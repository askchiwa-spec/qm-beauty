// API Route: Check Payment Status
// GET /api/payment/status?orderId=QB-123456

import { NextRequest, NextResponse } from 'next/server';
import { selcomClient } from '@/lib/selcom';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('orderId');

    if (!orderId) {
      return NextResponse.json(
        { error: 'Missing orderId parameter' },
        { status: 400 }
      );
    }

    // TODO: Fetch order from database first
    // TODO: Check database for payment status before calling Selcom

    // Query payment status from Selcom
    const statusResult = await selcomClient.queryPaymentStatus(orderId);

    if (!statusResult.success) {
      return NextResponse.json(
        { error: 'Failed to query payment status', details: statusResult.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        orderId,
        status: statusResult.status,
        amount: statusResult.amount,
        paymentMethod: statusResult.paymentMethod,
        transactionId: statusResult.transactionId,
      },
    });
  } catch (error: any) {
    console.error('Payment Status Query Error:', error);
    return NextResponse.json(
      { error: 'Failed to check payment status', details: error.message },
      { status: 500 }
    );
  }
}
