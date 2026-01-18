// Test endpoint for WhatsApp automation responses
// Simulates incoming messages to test automatic replies

import { NextRequest, NextResponse } from 'next/server';
import { whatsappBusinessActions } from '@/lib/whatsapp-business-actions';
import { logger } from '@/lib/logging';

export async function POST(request: NextRequest) {
  try {
    const { phoneNumber, message, secret } = await request.json();
    
    // Simple authentication
    const expectedSecret = process.env.WHATSAPP_AUTOMATION_SECRET || 'test-secret';
    if (secret !== expectedSecret) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    if (!phoneNumber || !message) {
      return NextResponse.json(
        { success: false, error: 'Phone number and message are required' },
        { status: 400 }
      );
    }
    
    logger.info('Testing WhatsApp automation', { phoneNumber, message });
    
    // Create simulated incoming message
    const incomingMessage = {
      from: phoneNumber.replace('+', ''), // Remove + for consistency
      message: message,
      timestamp: new Date(),
      messageId: `test_${Date.now()}`
    };
    
    // Process through business actions
    const businessProcessed = await whatsappBusinessActions.processBusinessAction(incomingMessage);
    
    let response;
    if (businessProcessed) {
      response = {
        success: true,
        processed: true,
        type: 'business_action',
        message: 'Business action processed successfully'
      };
    } else {
      response = {
        success: true,
        processed: false,
        type: 'no_action',
        message: 'Message did not trigger any business action'
      };
    }
    
    logger.info('Test completed', response);
    
    return NextResponse.json({
      ...response,
      testInput: { phoneNumber, message },
      timestamp: new Date().toISOString()
    });
    
  } catch (error: any) {
    logger.error('Test endpoint error', { error: error.message });
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// GET endpoint for quick testing
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const phoneNumber = url.searchParams.get('phone');
    const message = url.searchParams.get('message');
    const secret = url.searchParams.get('secret');
    
    // Simple authentication
    const expectedSecret = process.env.WHATSAPP_AUTOMATION_SECRET || 'test-secret';
    if (secret !== expectedSecret) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    if (!phoneNumber || !message) {
      // Show available test scenarios
      return NextResponse.json({
        success: true,
        message: 'WhatsApp Automation Test Endpoint',
        available_tests: [
          {
            scenario: 'Booking Request',
            message: 'book facial treatment tomorrow',
            description: 'Triggers booking confirmation automation'
          },
          {
            scenario: 'Cart Inquiry', 
            message: 'what is in my cart',
            description: 'Triggers cart follow-up automation'
          },
          {
            scenario: 'Order Status',
            message: 'status QB-ABC123',
            description: 'Triggers order status check'
          }
        ],
        usage: 'GET /api/whatsapp/test?phone=[PHONE]&message=[MESSAGE]&secret=[SECRET]'
      });
    }
    
    // Process the test
    const incomingMessage = {
      from: phoneNumber.replace('+', ''),
      message: message,
      timestamp: new Date(),
      messageId: `test_${Date.now()}`
    };
    
    const businessProcessed = await whatsappBusinessActions.processBusinessAction(incomingMessage);
    
    return NextResponse.json({
      success: true,
      processed: businessProcessed,
      phoneNumber,
      message,
      timestamp: new Date().toISOString()
    });
    
  } catch (error: any) {
    logger.error('Test GET endpoint error', { error: error.message });
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}