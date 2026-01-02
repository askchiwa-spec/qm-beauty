// API Route: Initiate Payment
// POST /api/payment/initiate

import { NextRequest, NextResponse } from 'next/server';
import { selcomClient } from '@/lib/selcom';
import {
  sanitizeInput,
  isValidTanzaniaPhone,
  isValidAmount,
  isValidOrderCode,
} from '@/lib/security/validation';
import { hasSuspiciousPattern } from '@/lib/security/config';

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

    // Sanitize inputs
    const sanitizedOrderId = sanitizeInput(orderId);
    const sanitizedCustomerName = sanitizeInput(customerName);
    
    // Validation
    if (!sanitizedOrderId || !phone || !amount) {
      return NextResponse.json(
        { error: 'Missing required fields: orderId, phone, amount' },
        { status: 400 }
      );
    }
    
    // Validate order ID format
    if (!isValidOrderCode(sanitizedOrderId)) {
      return NextResponse.json(
        { error: 'Invalid order ID format' },
        { status: 400 }
      );
    }
    
    // Validate phone number
    if (!isValidTanzaniaPhone(phone)) {
      return NextResponse.json(
        { error: 'Invalid phone number format' },
        { status: 400 }
      );
    }
    
    // Validate amount
    if (!isValidAmount(amount)) {
      return NextResponse.json(
        { error: 'Amount must be greater than 0' },
        { status: 400 }
      );
    }
    
    // Validate customer name
    if (hasSuspiciousPattern(sanitizedCustomerName)) {
      return NextResponse.json(
        { error: 'Invalid customer name' },
        { status: 400 }
      );
    }
    
    // Validate payment type
    if (paymentType && !['web', 'push'].includes(paymentType)) {
      return NextResponse.json(
        { error: 'Invalid payment type' },
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
          { error: 'Payment initiation failed', details: 'Payment provider error' }, // Don't expose internal details
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
          paymentMethod: (paymentResult as any).paymentMethod,
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
          { error: 'Payment initiation failed', details: 'Payment provider error' }, // Don't expose internal details
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
      { error: 'Failed to initiate payment', details: 'Internal server error' }, // Don't expose internal error details
      { status: 500 }
    );
  }
}