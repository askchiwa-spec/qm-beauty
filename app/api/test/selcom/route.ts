import { NextResponse } from 'next/server';
import { selcomClient } from '@/lib/selcom';

export async function GET() {
  try {
    const isConfigured = selcomClient.isConfigured();
    
    if (!isConfigured) {
      return NextResponse.json({
        success: false,
        message: 'Selcom not configured',
        configured: false
      }, { status: 503 });
    }

    // Test query payment status with a dummy order ID
    const testResult = await selcomClient.queryPaymentStatus('TEST_ORDER_123');
    
    return NextResponse.json({
      success: true,
      message: 'Selcom is properly configured',
      configured: true,
      testResult: testResult
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      message: 'Error testing Selcom configuration',
      error: error.message,
      configured: selcomClient.isConfigured()
    }, { status: 500 });
  }
}