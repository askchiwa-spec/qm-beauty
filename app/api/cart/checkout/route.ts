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

// Dynamic import to avoid bundling venom-bot
async function getUnifiedWhatsApp() {
  const { unifiedWhatsApp } = await import('@/lib/unified-whatsapp');
  return unifiedWhatsApp;
}

interface CheckoutRequest {
  cartId?: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  deliveryAddress?: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    subtotal: number;
  }>;
  totalAmount: number;
}

function generateOrderCodeLegacy(): string {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `QB-${timestamp}${random}`;
}

export async function POST(request: NextRequest) {
  try {
    const body: CheckoutRequest = await request.json();
    const { 
      cartId, 
      customerName, 
      customerPhone, 
      customerEmail,
      deliveryAddress,
      items, 
      totalAmount 
    } = body;

    // Input sanitization
    const sanitizedCustomerName = sanitizeInput(customerName);
    const sanitizedCustomerEmail = customerEmail ? sanitizeInput(customerEmail) : undefined;
    const sanitizedDeliveryAddress = deliveryAddress ? sanitizeInput(deliveryAddress) : undefined;
    
    // Validation
    if (!sanitizedCustomerName || !customerPhone || !items || !totalAmount) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (items.length === 0) {
      return NextResponse.json(
        { error: 'Cart is empty' },
        { status: 400 }
      );
    }
    
    // Additional validation
    if (!isValidAmount(totalAmount)) {
      return NextResponse.json(
        { error: 'Invalid total amount' },
        { status: 400 }
      );
    }
    
    if (!isValidTanzaniaPhone(customerPhone)) {
      return NextResponse.json(
        { error: 'Invalid phone number format' },
        { status: 400 }
      );
    }
    
    if (sanitizedCustomerEmail && !isValidEmail(sanitizedCustomerEmail)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }
    
    // Validate items
    for (const item of items) {
      if (typeof item.name !== 'string' || 
          typeof item.quantity !== 'number' || 
          typeof item.price !== 'number' ||
          typeof item.subtotal !== 'number' ||
          !isValidQuantity(item.quantity) ||
          !isValidAmount(item.price) ||
          !isValidAmount(item.subtotal) ||
          !isValidProductName(item.name)) {
        return NextResponse.json(
          { error: 'Invalid item data' },
          { status: 400 }
        );
      }
      
      // Sanitize item name
      item.name = sanitizeInput(item.name);
    }

    // Generate order code
    const orderCode = generateOrderCode();

    // Create order in database
    try {
      // Ensure a Cart record exists for the FK constraint
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
          customerName: sanitizedCustomerName,
          customerPhone,
          customerEmail: sanitizedCustomerEmail || null,
          deliveryAddress: sanitizedDeliveryAddress || null,
          totalAmount,
          paymentStatus: 'pending',
          fulfillmentStatus: 'new',
        },
      });
      
      console.log('Order created in database:', order.id);
    } catch (dbError: any) {
      console.error('Database error (order will still be processed via WhatsApp):', dbError);
      
      // Handle specific Prisma errors
      if (dbError.code === 'P2002') {
        return NextResponse.json(
          { error: 'Order already exists', code: 'ORDER_DUPLICATE' },
          { status: 409 }
        );
      }
      
      if (dbError.code === 'P2025') {
        return NextResponse.json(
          { error: 'Cart not found', code: 'CART_NOT_FOUND' },
          { status: 404 }
        );
      }
      
      // Continue even if database fails - WhatsApp is the primary notification method
    }

    // Generate WhatsApp message for QM Beauty team
    const orderMessage = generateOrderMessage({
      orderCode,
      customerName,
      customerPhone,
      items,
      totalAmount,
      timestamp: new Date(),
    });

    // Generate customer confirmation message
    const customerMessage = generateCustomerConfirmation({
      orderCode,
      customerName,
      customerPhone,
      items,
      totalAmount,
    });

    // Check if Selcom is configured for payment processing
    let paymentInitiated = false;
    let paymentUrl = null;
    
    if (selcomClient.isConfigured()) {
      try {
        // Initiate payment through Selcom
        const paymentRequest = {
          orderId: orderCode,
          amount: totalAmount,
          phone: customerPhone,
          email: sanitizedCustomerEmail,
          customerName: sanitizedCustomerName,
        };

        const paymentResult = await selcomClient.initiatePayment(paymentRequest);

        if (paymentResult.success) {
          paymentInitiated = true;
          paymentUrl = paymentResult.redirectUrl;
          
          // Update order with payment status
          try {
            await prisma.order.update({
              where: { orderCode },
              data: { paymentStatus: 'pending' },
            });
          } catch (dbError) {
            console.error('Failed to update order payment status:', dbError);
          }
        } else {
          console.error('Failed to initiate payment:', paymentResult.error);
        }
      } catch (paymentError) {
        console.error('Payment initiation error:', paymentError);
      }
    }
    
    // Send to QM Beauty team
    const recipientNumber = process.env.WHATSAPP_RECIPIENT_NUMBER || '+255657120151';
    
    let teamResult: any = { success: false };
    let customerResult: any = { success: false };
    
    try {
      const unifiedWhatsApp = await getUnifiedWhatsApp();
      
      if (await unifiedWhatsApp.isConfigured()) {
        teamResult = await unifiedWhatsApp.sendTextMessage(
          recipientNumber,
          orderMessage
        );

        if (!teamResult.success) {
          console.error('Failed to send WhatsApp to team:', teamResult.error);
        }

        // Send confirmation to customer
        let finalCustomerMessage = customerMessage;
        
        // Add payment information if payment was initiated
        if (paymentInitiated && paymentUrl) {
          finalCustomerMessage += `

💳 *Payment Required*
Click here to pay: ${paymentUrl}`;
        }
        
        customerResult = await unifiedWhatsApp.sendTextMessage(
          customerPhone,
          finalCustomerMessage
        );

        if (!customerResult.success) {
          console.error('Failed to send WhatsApp to customer:', customerResult.error);
        }

        return NextResponse.json({
          success: true,
          message: 'Order placed successfully',
          data: {
            orderCode,
            totalAmount,
            whatsappSent: teamResult.success,
            customerNotified: customerResult.success,
            paymentInitiated,
            paymentUrl,
            whatsappProvider: teamResult.provider,
          },
        });
      } else {
        // WhatsApp not configured, just return order data
        console.warn('WhatsApp not configured. Order created but notifications not sent.');
        
        // Include the messages in the response so business can manually send them
        const businessWhatsAppLink = `https://wa.me/${process.env.WHATSAPP_RECIPIENT_NUMBER || '+255657120151'}?text=${encodeURIComponent(orderMessage)}`;
        const customerWhatsAppLink = `https://wa.me/${customerPhone}?text=${encodeURIComponent(customerMessage)}`;
        
        // Add payment information to messages if payment was initiated
        let businessMessage = orderMessage;
        let finalCustomerMessage = customerMessage;
        
        if (paymentInitiated && paymentUrl) {
          businessMessage += `\n\n💳 Payment URL: ${paymentUrl}`;
          finalCustomerMessage += `\n\n💳 *Payment Required*\nClick here to pay: ${paymentUrl}`;
        }
        
        return NextResponse.json({
          success: true,
          message: 'Order placed successfully (WhatsApp not configured)',
          data: {
            orderCode,
            totalAmount,
            whatsappSent: false,
            customerNotified: false,
            paymentInitiated,
            paymentUrl,
            // Provide links for manual notification
            manualNotification: {
              businessLink: businessWhatsAppLink,
              customerLink: customerWhatsAppLink,
              businessMessage: businessMessage,
              customerMessage: finalCustomerMessage,
            }
          },
        });
      }
    } catch (whatsappError) {
      console.error('Failed to send WhatsApp notifications:', whatsappError);
      
      // Return success even if WhatsApp fails - order was still created
      return NextResponse.json({
        success: true,
        message: 'Order placed successfully (WhatsApp notification failed)',
        data: {
          orderCode,
          totalAmount,
          whatsappSent: false,
          customerNotified: false,
          paymentInitiated,
          paymentUrl,
          whatsappError: true,
        },
      });
    }
  } catch (error: any) {
    console.error('Checkout Error:', error);
    // Don't expose internal error details to client
    return NextResponse.json(
      { error: 'Failed to process checkout' },
      { status: 500 }
    );
  }
}
