import { NextRequest, NextResponse } from 'next/server';
import { selcomClient } from '@/lib/selcom';

// Selcom payment status check implementation
export async function POST(request: NextRequest) {
  try {
    const { transactionId } = await request.json();

    // Validate required fields
    if (!transactionId) {
      return NextResponse.json(
        { error: 'Missing required field: transactionId' },
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

    // Query payment status from Selcom
    const result = await selcomClient.queryPaymentStatus(transactionId);

    if (!result) {
      return NextResponse.json(
        { error: 'Failed to retrieve payment status' },
        { status: 500 }
      );
    }

    // Map Selcom response to our format
    const paymentStatus = {
      transactionId,
      status: result.status?.toLowerCase() || 'unknown',
      amount: result.amount,
      currency: result.currency || 'TZS',
      reference: result.reference || transactionId,
      completedAt: result.completed_at || new Date().toISOString(),
    };

    console.log('Payment status retrieved:', paymentStatus);

    return NextResponse.json({
      success: true,
      data: paymentStatus,
      message: 'Payment status retrieved successfully'
    });
  } catch (error) {
    console.error('Error checking payment status:', error);
    return NextResponse.json(
      { error: 'Failed to check payment status' },
      { status: 500 }
    );
  }
}