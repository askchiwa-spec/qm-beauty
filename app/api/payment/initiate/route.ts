import { NextResponse } from 'next/server';
import { selcomClient } from '@/lib/selcom';

export async function POST(request: Request) {
  try {
    const { amount, orderId, customer, paymentType = 'web' } = await request.json();
    
    // Validate required fields
    if (!amount || !orderId || !customer || !customer.phone) {
      return NextResponse.json(
        { error: 'Missing required fields: amount, orderId, customer.phone' },
        { status: 400 }
      );
    }
    
    // Check if Selcom is configured
    if (!selcomClient.isConfigured()) {
      return NextResponse.json(
        { error: 'Payment gateway not configured' },
        { status: 503 }
      );
    }
    
    // Prepare payment request
    const paymentRequest = {
      orderId,
      amount,
      phone: customer.phone,
      email: customer.email,
      customerName: customer.name,
    };
    
    let paymentResult;
    
    // Handle different payment types
    if (paymentType === 'push' || ['mpesa', 'tigo', 'airtel', 'halopesa'].includes(paymentType.toLowerCase())) {
      // Initiate USSD push payment for mobile money
      paymentResult = await selcomClient.initiatePushPayment(paymentRequest);
    } else {
      // Initiate web gateway payment (default)
      paymentResult = await selcomClient.initiatePayment(paymentRequest);
    }
    
    if (!paymentResult.success) {
      console.error('Payment initiation failed:', paymentResult.error);
      return NextResponse.json(
        { 
          success: false, 
          error: paymentResult.error || 'Payment initiation failed',
          message: 'Failed to initiate payment'
        },
        { status: 500 }
      );
    }
    
    console.log('Payment initiated successfully:', {
      orderId,
      transactionId: paymentResult.transactionId,
      redirectUrl: paymentResult.redirectUrl
    });
    
    return NextResponse.json({
      success: true,
      data: {
        transactionId: paymentResult.transactionId,
        redirectUrl: paymentResult.redirectUrl,
        reference: paymentResult.reference,
        amount,
        orderId
      },
      message: 'Payment initiated successfully'
    });
    
  } catch (error: any) {
    console.error('Error initiating payment:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Internal server error',
        message: 'Failed to initiate payment'
      },
      { status: 500 }
    );
  }
}
