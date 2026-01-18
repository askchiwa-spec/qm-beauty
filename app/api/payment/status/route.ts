import { NextRequest, NextResponse } from 'next/server';

// This is a mock implementation of the Selcom payment status check
// In a real implementation, you would integrate with Selcom's actual API
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

    // Mock payment status response
    // In a real implementation, this would call Selcom's API to check the payment status
    const paymentStatus = {
      transactionId,
      status: 'completed', // In a real implementation, this would reflect the actual status
      amount: 50000, // This would come from the database or Selcom API
      currency: 'TZS',
      reference: `REF${Date.now()}`,
      completedAt: new Date().toISOString(),
    };

    // In a real implementation, you would fetch the transaction from your database
    // and return the actual status from Selcom
    console.log('Payment status requested:', transactionId);

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