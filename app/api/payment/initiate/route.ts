import { NextRequest, NextResponse } from 'next/server';
import { selcomClient } from '@/lib/selcom';

// Selcom payment initiation implementation
export async function POST(request: NextRequest) {
  try {
    const { amount, customer, orderRef, description } = await request.json();

    // Validate required fields
    if (!amount || !customer || !orderRef) {
      return NextResponse.json(
        { error: 'Missing required fields: amount, customer, orderRef' },
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
      orderId: orderRef,
      amount,
      phone: customer.phone || customer.phoneNumber,
      email: customer.email,
      customerName: customer.name || customer.fullName,
    };

    // Initiate payment through Selcom
    const result = await selcomClient.initiatePayment(paymentRequest);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to initiate payment' },
        { status: 500 }
      );
    }

    // Prepare response data
    const paymentData = {
      transactionId: result.transactionId,
      orderRef,
      amount,
      customer,
      description: description || 'QM Beauty Product Purchase',
      paymentUrl: result.redirectUrl,
      initiatedAt: new Date().toISOString(),
      status: 'pending',
    };

    console.log('Payment initiated successfully:', paymentData);

    return NextResponse.json({
      success: true,
      data: paymentData,
      message: 'Payment initiated successfully'
    });
  } catch (error) {
    console.error('Error initiating payment:', error);
    return NextResponse.json(
      { error: 'Failed to initiate payment' },
      { status: 500 }
    );
  }
}