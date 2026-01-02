// API Route: Checkout Cart
// POST /api/cart/checkout

import { NextRequest, NextResponse } from 'next/server';
import { prisma, generateOrderCode } from '@/lib/prisma';
import { generateOrderMessage, generateCustomerConfirmation } from '@/lib/templates/order-message';
import { unifiedWhatsApp } from '@/lib/unified-whatsapp';
import {
  sanitizeInput,
  isValidEmail,
  isValidTanzaniaPhone,
  isValidAmount,
  isValidQuantity,
  isValidProductName
} from '@/lib/security/validation';

interface CheckoutRequest {
  cartId: string;
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
    if (!cartId || !sanitizedCustomerName || !customerPhone || !items || !totalAmount) {
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
      const order = await prisma.order.create({
        data: {
          orderCode,
          cartId,
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
    } catch (dbError) {
      console.error('Database error (order will still be processed via WhatsApp):', dbError);
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

    // Send to QM Beauty team
    const recipientNumber = process.env.WHATSAPP_RECIPIENT_NUMBER || '+255657120151';
    
    if (unifiedWhatsApp.isConfigured()) {
      const teamResult = await unifiedWhatsApp.sendTextMessage(
        recipientNumber,
        orderMessage
      );

      if (!teamResult.success) {
        console.error('Failed to send WhatsApp to team:', teamResult.error);
      }

      // Send confirmation to customer
      const customerResult = await unifiedWhatsApp.sendTextMessage(
        customerPhone,
        customerMessage
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
          whatsappProvider: teamResult.provider,
        },
      });
    } else {
      // WhatsApp not configured, just return order data
      console.warn('WhatsApp not configured. Order created but notifications not sent.');
      
      return NextResponse.json({
        success: true,
        message: 'Order placed successfully (WhatsApp not configured)',
        data: {
          orderCode,
          totalAmount,
          whatsappSent: false,
          customerNotified: false,
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
