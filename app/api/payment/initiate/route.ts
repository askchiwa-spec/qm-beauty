import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { amount, orderId } = await request.json();
  
  // Demo mode - always success
  return NextResponse.json({
    success: true,
    transactionId: `TXN-${Date.now()}`,
    amount,
    orderId
  });
}
