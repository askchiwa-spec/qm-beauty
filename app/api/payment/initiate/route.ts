// API Route: Initiate Payment
// POST /api/payment/initiate

import { NextRequest, NextResponse } from 'next/server';
import { selcomClient } from '@/lib/selcom';

interface PaymentRequest {
  orderId: string;
  phone: string;
  amount: number;
  customerName: string;
  paymentType?: 'web' | 'push'; // web = gateway redirect, push = USSD push
}

export async function POST(request: NextRequest) {
  try {
    const body: PaymentRequest = await request.json();
    const { orderId, phone, amount, customerName, paymentType = 'web' } = body;

    // Validation
    if (!orderId || !phone || !amount) {
      return NextResponse.json(
        { error: 'Missing required fields: orderId, phone, amount' },
        { status: 400 }
      );
    }

    if (amount <= 0) {
      return NextResponse.json(
        { error: 'Amount must be greater than 0' },
        { status: 400 }
      );
    }

    // TODO: Verify order exists in database
    // TODO: Check if order is already paid

    let paymentResult;

    if (paymentType === 'push') {
      // USSD Push Payment (SIM Toolkit)
      paymentResult = await selcomClient.initiatePushPayment({
        orderId,
        phone,
        amount,
        customerName,
      });

      if (!paymentResult.success) {
        return NextResponse.json(
          { error: 'Payment initiation failed', details: paymentResult.error },
          { status: 400 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'USSD push sent to your phone. Please check your SIM toolkit.',
        data: {
          orderId,
          transactionId: paymentResult.transactionId,
          reference: paymentResult.reference,
          paymentMethod: paymentResult.paymentMethod,
          type: 'push',
        },
      });
    } else {
      // Web Gateway Payment (Redirect)
      paymentResult = await selcomClient.initiatePayment({
        orderId,
        phone,
        amount,
        customerName,
      });

      if (!paymentResult.success) {
        return NextResponse.json(
          { error: 'Payment initiation failed', details: paymentResult.error },
          { status: 400 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'Payment gateway ready',
        data: {
          orderId,
          transactionId: paymentResult.transactionId,
          reference: paymentResult.reference,
          redirectUrl: paymentResult.redirectUrl,
          type: 'web',
        },
      });
    }
  } catch (error: any) {
    console.error('Payment Initiation Error:', error);
    return NextResponse.json(
      { error: 'Failed to initiate payment', details: error.message },
      { status: 500 }
    );
  }
}
