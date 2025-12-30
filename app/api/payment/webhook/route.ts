// API Route: Selcom Payment Webhook
// POST /api/payment/webhook

import { NextRequest, NextResponse } from 'next/server';
import { selcomClient } from '@/lib/selcom';
import { whatsappClient } from '@/lib/whatsapp';
import { generatePaymentConfirmation } from '@/lib/templates/order-message';

interface SelcomWebhook {
  order_id: string;
  transaction_id: string;
  status: 'COMPLETED' | 'FAILED' | 'PENDING';
  amount: number;
  currency: string;
  payment_method: string;
  payment_phone: string;
  reference: string;
  created_at: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: SelcomWebhook = await request.json();
    
    // Get signature from headers
    const signature = request.headers.get('x-selcom-signature');
    
    if (!signature) {
      console.error('Missing webhook signature');
      return NextResponse.json(
        { error: 'Missing signature' },
        { status: 401 }
      );
    }

    // Verify webhook signature
    const isValid = selcomClient.verifyWebhookSignature(
      JSON.stringify(body),
      signature
    );

    if (!isValid) {
      console.error('Invalid webhook signature');
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 403 }
      );
    }

    const {
      order_id,
      transaction_id,
      status,
      amount,
      payment_method,
      payment_phone,
      reference,
    } = body;

    console.log('Payment Webhook Received:', {
      orderId: order_id,
      status,
      amount,
      transactionId: transaction_id,
    });

    // TODO: Fetch order from database
    // TODO: Check for duplicate webhook processing (idempotency)

    if (status === 'COMPLETED') {
      // TODO: Update order payment status in database
      // TODO: Create payment record in payments table
      // TODO: Update order fulfillment status to 'processing'
      
      // Send WhatsApp confirmation to customer
      const confirmationMessage = generatePaymentConfirmation({
        orderCode: order_id,
        amount,
        paymentMethod: payment_method,
        transactionId: transaction_id,
      });

      if (whatsappClient.isConfigured()) {
        await whatsappClient.sendTextMessage(
          payment_phone,
          confirmationMessage
        );

        // Notify QM Beauty team
        const teamMessage = `✅ *PAYMENT RECEIVED*

Order: ${order_id}
Amount: TZS ${amount.toLocaleString()}/=
Method: ${payment_method}
Transaction: ${transaction_id}

📦 *Action Required:* Process order for delivery`;
        
        const recipientNumber = process.env.WHATSAPP_RECIPIENT_NUMBER || '+255715727085';
        await whatsappClient.sendTextMessage(recipientNumber, teamMessage);
      }

      return NextResponse.json({
        success: true,
        message: 'Payment processed successfully',
      });
    } else if (status === 'FAILED') {
      // TODO: Update order payment status to 'failed' in database
      
      console.error('Payment failed for order:', order_id);

      return NextResponse.json({
        success: true,
        message: 'Payment failure recorded',
      });
    } else {
      // PENDING status
      console.log('Payment pending for order:', order_id);

      return NextResponse.json({
        success: true,
        message: 'Payment status updated to pending',
      });
    }
  } catch (error: any) {
    console.error('Webhook Processing Error:', error);
    
    // Still return 200 to prevent webhook retries for processing errors
    return NextResponse.json({
      error: 'Webhook processing error',
      details: error.message,
    }, { status: 200 });
  }
}

// Selcom might send GET requests to verify webhook endpoint
export async function GET() {
  return NextResponse.json({
    status: 'active',
    service: 'QM Beauty Payment Webhook',
  });
}
