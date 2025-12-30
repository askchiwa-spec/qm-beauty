// Test endpoint for WhatsApp functionality
import { NextRequest, NextResponse } from 'next/server';
import { unifiedWhatsApp } from '@/lib/unified-whatsapp';

export async function POST(request: NextRequest) {
  try {
    const { to, message } = await request.json();

    if (!to || !message) {
      return NextResponse.json(
        { error: 'Missing required fields: to, message' },
        { status: 400 }
      );
    }

    // Send test message
    const result = await unifiedWhatsApp.sendTextMessage(to, message);

    return NextResponse.json({
      ...result,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('WhatsApp Test Error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error.message || 'Failed to send test message' 
      },
      { status: 500 }
    );
  }
}
