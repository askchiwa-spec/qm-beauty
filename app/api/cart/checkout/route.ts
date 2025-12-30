// API Route: Checkout Cart
// POST /api/cart/checkout

import { NextRequest, NextResponse } from 'next/server';
import { prisma, generateOrderCode } from '@/lib/prisma';
import { generateOrderMessage, generateCustomerConfirmation } from '@/lib/templates/order-message';
import { unifiedWhatsApp } from '@/lib/unified-whatsapp';

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

    // Validation
    if (!cartId || !customerName || !customerPhone || !items || !totalAmount) {
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

    // Generate order code
    const orderCode = generateOrderCode();

    // Create order in database
    try {
      const order = await prisma.order.create({
        data: {
          orderCode,
          cartId,
          customerName,
          customerPhone,
          customerEmail: customerEmail || null,
          deliveryAddress: deliveryAddress || null,
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
    return NextResponse.json(
      { error: 'Failed to process checkout', details: error.message },
      { status: 500 }
    );
  }
}
