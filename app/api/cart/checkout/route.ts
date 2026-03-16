// API Route: Checkout Cart
// POST /api/cart/checkout

import { NextRequest, NextResponse } from 'next/server';
import { prisma, generateOrderCode } from '@/lib/prisma';
import { generateOrderMessage, generateCustomerConfirmation } from '@/lib/templates/order-message';
import { selcomClient } from '@/lib/selcom';
import {
  sanitizeInput,
  isValidEmail,
  isValidTanzaniaPhone,
  isValidAmount,
  isValidQuantity,
  isValidProductName
} from '@/lib/security/validation';

async function getUnifiedWhatsApp() {
  const { unifiedWhatsApp } = await import('@/lib/unified-whatsapp');
  return unifiedWhatsApp;
}

interface CheckoutItem {
  productId?: string;
  name: string;
  quantity: number;
  price: number;
  subtotal: number;
}

interface CheckoutRequest {
  cartId?: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  deliveryAddress?: string;
  deliveryOption?: 'pickup' | 'home';
  paymentMethod?: string;
  items: CheckoutItem[];
  totalAmount: number;
}

const DELIVERY_FEE = 5000;

export async function POST(request: NextRequest) {
  try {
    const body: CheckoutRequest = await request.json();
    const {
      cartId,
      customerName,
      customerPhone,
      customerEmail,
      deliveryAddress,
      deliveryOption = 'pickup',
      paymentMethod = 'whatsapp',
      items,
      totalAmount,
    } = body;

    // Input sanitization
    const sanitizedName = sanitizeInput(customerName);
    const sanitizedEmail = customerEmail ? sanitizeInput(customerEmail) : undefined;
    const sanitizedAddress = deliveryAddress ? sanitizeInput(deliveryAddress) : undefined;

    // Required field validation
    if (!sanitizedName || !customerPhone || !items || !totalAmount) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    if (items.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
    }
    if (!isValidTanzaniaPhone(customerPhone)) {
      return NextResponse.json({ error: 'Invalid phone number format' }, { status: 400 });
    }
    if (sanitizedEmail && !isValidEmail(sanitizedEmail)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }
    if (!isValidAmount(totalAmount)) {
      return NextResponse.json({ error: 'Invalid total amount' }, { status: 400 });
    }

    // Validate and sanitize each item
    for (const item of items) {
      if (
        typeof item.name !== 'string' ||
        typeof item.quantity !== 'number' ||
        typeof item.price !== 'number' ||
        typeof item.subtotal !== 'number' ||
        !isValidQuantity(item.quantity) ||
        !isValidAmount(item.price) ||
        !isValidAmount(item.subtotal) ||
        !isValidProductName(item.name)
      ) {
        return NextResponse.json({ error: 'Invalid item data' }, { status: 400 });
      }
      item.name = sanitizeInput(item.name);
    }

    // ─── SERVER-SIDE PRICE VERIFICATION ───────────────────────────────────────
    // Verify prices against the database when productIds are supplied.
    // This prevents a client from manipulating prices before checkout.
    const productIds = items.map(i => i.productId).filter(Boolean) as string[];
    if (productIds.length > 0) {
      const dbProducts = await prisma.product.findMany({
        where: { id: { in: productIds } },
        select: { id: true, price: true, salePrice: true, inStock: true, status: true },
      });

      for (const item of items) {
        if (!item.productId) continue;
        const dbProduct = dbProducts.find(p => p.id === item.productId);
        if (!dbProduct) {
          return NextResponse.json({ error: `Product not found: ${item.name}` }, { status: 400 });
        }
        if (!dbProduct.inStock || dbProduct.status !== 'active') {
          return NextResponse.json({ error: `Product out of stock: ${item.name}` }, { status: 400 });
        }
        // Allow salePrice if set, otherwise full price
        const expectedPrice = dbProduct.salePrice ?? dbProduct.price;
        if (Math.abs(item.price - expectedPrice) > 1) {
          console.error(`Price mismatch for ${item.name}: sent ${item.price}, expected ${expectedPrice}`);
          return NextResponse.json(
            { error: `Price mismatch for ${item.name}. Please refresh and try again.` },
            { status: 400 }
          );
        }
      }
    }

    // Verify total = sum of subtotals + delivery fee
    const itemsTotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const expectedDeliveryFee = deliveryOption === 'home' ? DELIVERY_FEE : 0;
    const expectedTotal = itemsTotal + expectedDeliveryFee;
    if (Math.abs(totalAmount - expectedTotal) > 1) {
      console.error(`Total mismatch: sent ${totalAmount}, expected ${expectedTotal}`);
      return NextResponse.json({ error: 'Total amount does not match items' }, { status: 400 });
    }
    // ──────────────────────────────────────────────────────────────────────────

    const orderCode = generateOrderCode();

    // ─── DATABASE: CREATE ORDER ───────────────────────────────────────────────
    let orderId: string | null = null;
    try {
      const resolvedCartId = cartId || crypto.randomUUID();
      await prisma.cart.upsert({
        where: { id: resolvedCartId },
        create: { id: resolvedCartId, totalAmount, status: 'submitted' },
        update: { status: 'submitted' },
      });

      const order = await prisma.order.create({
        data: {
          orderCode,
          cartId: resolvedCartId,
          customerName: sanitizedName,
          customerPhone,
          customerEmail: sanitizedEmail || null,
          deliveryAddress: sanitizedAddress || null,
          totalAmount,
          paymentStatus: 'pending',
          paymentMethod: paymentMethod,
          fulfillmentStatus: 'new',
        },
      });
      orderId = order.id;
      console.log('Order created:', orderCode, orderId);
    } catch (dbError: any) {
      console.error('DB error creating order:', dbError);
      if (dbError.code === 'P2002') {
        return NextResponse.json({ error: 'Order already exists', code: 'ORDER_DUPLICATE' }, { status: 409 });
      }
    }
    // ──────────────────────────────────────────────────────────────────────────

    // WhatsApp message templates
    const orderMessage = generateOrderMessage({
      orderCode,
      customerName,
      customerPhone,
      items,
      totalAmount,
      timestamp: new Date(),
    });
    const customerMessage = generateCustomerConfirmation({
      orderCode,
      customerName,
      customerPhone,
      items,
      totalAmount,
    });

    // ─── SELCOM PAYMENT INITIATION ────────────────────────────────────────────
    let paymentInitiated = false;
    let paymentUrl: string | null = null;
    const mobileMoneyMethods = ['mpesa', 'tigopesa', 'airtel', 'halopesa'];

    if (selcomClient.isConfigured() && mobileMoneyMethods.includes(paymentMethod)) {
      try {
        const paymentResult = await selcomClient.initiatePayment({
          orderId: orderCode,
          amount: totalAmount,
          phone: customerPhone,
          email: sanitizedEmail,
          customerName: sanitizedName,
        });

        if (paymentResult.success) {
          paymentInitiated = true;
          paymentUrl = paymentResult.redirectUrl || null;

          // Record the pending payment in the database
          if (orderId) {
            await prisma.payment.create({
              data: {
                orderId,
                selcomReference: paymentResult.reference || null,
                selcomTransactionId: paymentResult.transactionId || null,
                amount: totalAmount,
                phone: customerPhone,
                paymentMethod: paymentMethod.toUpperCase(),
                status: 'pending',
                gatewayResponse: paymentResult as any,
              },
            }).catch(e => console.error('Failed to create Payment record:', e));
          }
        } else {
          console.error('Selcom initiation failed:', paymentResult.error);
        }
      } catch (paymentError) {
        console.error('Payment initiation error:', paymentError);
      }
    }
    // ──────────────────────────────────────────────────────────────────────────

    // ─── WHATSAPP NOTIFICATIONS ───────────────────────────────────────────────
    const recipientNumber = process.env.WHATSAPP_RECIPIENT_NUMBER || '+255657120151';
    let teamNotified = false;
    let customerNotified = false;

    try {
      const unifiedWhatsApp = await getUnifiedWhatsApp();

      if (await unifiedWhatsApp.isConfigured()) {
        const teamResult = await unifiedWhatsApp.sendTextMessage(recipientNumber, orderMessage);
        teamNotified = teamResult.success;
        if (!teamNotified) console.error('WhatsApp team send failed:', teamResult.error);

        let finalCustomerMsg = customerMessage;
        if (paymentInitiated && paymentUrl) {
          finalCustomerMsg += `\n\n💳 *Payment Required*\nClick here to pay: ${paymentUrl}`;
        }

        const customerResult = await unifiedWhatsApp.sendTextMessage(customerPhone, finalCustomerMsg);
        customerNotified = customerResult.success;
        if (!customerNotified) console.error('WhatsApp customer send failed:', customerResult.error);
      } else {
        console.warn('WhatsApp not configured — notifications skipped.');
      }
    } catch (whatsappError) {
      console.error('WhatsApp notifications error:', whatsappError);
    }
    // ──────────────────────────────────────────────────────────────────────────

    return NextResponse.json({
      success: true,
      message: 'Order placed successfully',
      data: {
        orderCode,
        totalAmount,
        paymentMethod,
        whatsappSent: teamNotified,
        customerNotified,
        paymentInitiated,
        paymentUrl,
      },
    });
  } catch (error: any) {
    console.error('Checkout Error:', error);
    return NextResponse.json({ error: 'Failed to process checkout' }, { status: 500 });
  }
}
