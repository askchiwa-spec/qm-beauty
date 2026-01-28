import { NextRequest, NextResponse } from 'next/server';
import { whatsappChatbot } from '@/lib/whatsapp-chatbot';
import { whatsappBusinessActions } from '@/lib/whatsapp-business-actions';

export async function POST(request: NextRequest) {
  try {
    const { message, from } = await request.json();

    if (!message || !from) {
      return NextResponse.json(
        { error: 'Missing message or from fields' },
        { status: 400 }
      );
    }

    // Create a mock incoming message object
    const incomingMessage = {
      from,
      message,
      timestamp: new Date(),
      messageId: `test_${Date.now()}`
    };

    console.log('Testing WhatsApp auto-reply with:', incomingMessage);

    // First try business actions
    const businessProcessed = await whatsappBusinessActions.processBusinessAction(incomingMessage);

    if (!businessProcessed) {
      // If no business action was triggered, process through chatbot
      const result = await whatsappChatbot.processIncomingMessage(incomingMessage);
      
      if (result) {
        return NextResponse.json({
          success: true,
          processed: true,
          message: 'Message processed by chatbot',
          processedBy: 'chatbot'
        });
      } else {
        return NextResponse.json({
          success: true,
          processed: false,
          message: 'Message not processed by chatbot',
          processedBy: 'none'
        });
      }
    } else {
      return NextResponse.json({
        success: true,
        processed: true,
        message: 'Message processed as business action',
        processedBy: 'business_action'
      });
    }
  } catch (error: any) {
    console.error('Error testing WhatsApp:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}