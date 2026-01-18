// API Route: Selcom Payment Webhook
// POST /api/payment/webhook

import { NextRequest, NextResponse } from 'next/server';
import { selcomClient } from '@/lib/selcom';
import { unifiedWhatsApp } from '@/lib/unified-whatsapp';
import { generatePaymentConfirmation } from '@/lib/templates/order-message';
import {
  sanitizeInput,
  isValidTanzaniaPhone,
  isValidAmount,
  isValidPaymentStatus,
} from '@/lib/security/validation';

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
      currency,
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

    // Validate webhook data
    if (!order_id || !transaction_id || !status || amount === undefined || amount === null) {
      console.error('Invalid webhook data');
      return NextResponse.json(
        { error: 'Invalid webhook data' },
        { status: 400 }
      );
    }
    
    // Check for duplicate webhook processing (idempotency)
    // This would typically involve checking a database for the transaction_id
    // For now, we'll add a basic check
    try {
      // TODO: Implement proper idempotency check in database
      // const existingPayment = await prisma.payment.findUnique({
      //   where: { transaction_id: transaction_id }
      // });
      // 
      // if (existingPayment) {
      //   console.log('Duplicate webhook received for transaction:', transaction_id);
      //   return NextResponse.json({
      //     success: true,
      //     message: 'Duplicate webhook - already processed'
      //   });
      // }
    } catch (dbError) {
      console.error('Error checking for duplicate transaction:', dbError);
      // Continue processing even if duplicate check fails
    }
    
    // Validate status
    if (!isValidPaymentStatus(status)) {
      console.error('Invalid payment status:', status);
      return NextResponse.json(
        { error: 'Invalid payment status' },
        { status: 400 }
      );
    }
    
    // Validate amount
    if (!isValidAmount(amount)) {
      console.error('Invalid amount:', amount);
      return NextResponse.json(
        { error: 'Invalid amount' },
        { status: 400 }
      );
    }
    
    // Validate currency
    if (currency !== 'TZS') {
      console.error('Unsupported currency:', currency);
      return NextResponse.json(
        { error: 'Unsupported currency' },
        { status: 400 }
      );
    }
    
    // Validate phone
    if (!isValidTanzaniaPhone(payment_phone)) {
      console.error('Invalid phone number:', payment_phone);
      return NextResponse.json(
        { error: 'Invalid phone number' },
        { status: 400 }
      );
    }
    
    // Sanitize payment method
    const sanitizedPaymentMethod = sanitizeInput(payment_method);

    if (status === 'COMPLETED') {
      // TODO: Update order payment status in database
      // TODO: Create payment record in payments table
      // TODO: Update order fulfillment status to 'processing'
      
      // Send WhatsApp confirmation to customer
      const confirmationMessage = generatePaymentConfirmation({
        orderCode: order_id,
        customerName: 'Customer', // Using default name since not available in webhook
        amount,
        paymentMethod: sanitizedPaymentMethod,
      });

      if (unifiedWhatsApp.isConfigured()) {
        await unifiedWhatsApp.sendTextMessage(
          payment_phone,
          confirmationMessage
        );

        // Notify QM Beauty team
        const teamMessage = `✅ *PAYMENT RECEIVED*

Order: ${order_id}
Amount: TZS ${amount.toLocaleString()}/=
Method: ${sanitizedPaymentMethod}
Transaction: ${transaction_id}

📦 *Action Required:* Process order for delivery`;
        
        const recipientNumber = process.env.WHATSAPP_RECIPIENT_NUMBER || '+255657120151';
        await unifiedWhatsApp.sendTextMessage(recipientNumber, teamMessage);
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
    
    // Don't expose internal error details to prevent information disclosure
    // Still return 200 to prevent webhook retries for processing errors
    return NextResponse.json({
      error: 'Webhook processing error',
      // details: error.message, // Commented out to prevent information disclosure
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
