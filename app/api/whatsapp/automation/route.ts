// API endpoint for triggering automated WhatsApp messages
// This can be called by cron jobs, background tasks, or manually for testing

import { NextRequest, NextResponse } from 'next/server';
import { runCartFollowUpTask } from '@/lib/whatsapp-cart-followup';
import { scheduleAutomatedMessages } from '@/lib/whatsapp-business-actions';
import { logger } from '@/lib/logging';

export async function POST(request: NextRequest) {
  try {
    // Optional: Add authentication/authorization check here
    // For production, you'd want to secure this endpoint
    
    const { action, secret } = await request.json();
    
    // Simple authentication - in production use proper auth
    const expectedSecret = process.env.WHATSAPP_AUTOMATION_SECRET;
    if (expectedSecret && secret !== expectedSecret) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    logger.info('Automation trigger received', { action });
    
    let result;
    
    switch (action) {
      case 'cart_followup':
        result = await runCartFollowUpTask();
        break;
        
      case 'scheduled_messages':
        result = await scheduleAutomatedMessages();
        break;
        
      case 'all':
        // Run all automation tasks
        const cartResult = await runCartFollowUpTask();
        const scheduledResult = await scheduleAutomatedMessages();
        result = {
          success: cartResult.success && scheduledResult.success,
          results: {
            cart_followup: cartResult,
            scheduled_messages: scheduledResult
          }
        };
        break;
        
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action specified' },
          { status: 400 }
        );
    }
    
    return NextResponse.json({
      success: true,
      action,
      result,
      timestamp: new Date().toISOString()
    });
    
  } catch (error: any) {
    logger.error('Automation trigger error', { error: error.message });
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// GET endpoint for health check and manual triggering
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const action = url.searchParams.get('action');
    const secret = url.searchParams.get('secret');
    
    // Simple authentication
    const expectedSecret = process.env.WHATSAPP_AUTOMATION_SECRET;
    if (expectedSecret && secret !== expectedSecret) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    if (action) {
      // Trigger specific action via GET (for easy testing)
      let result;
      
      switch (action) {
        case 'cart_followup':
          result = await runCartFollowUpTask();
          break;
          
        case 'scheduled_messages':
          result = await scheduleAutomatedMessages();
          break;
          
        default:
          return NextResponse.json(
            { success: false, error: 'Invalid action' },
            { status: 400 }
          );
      }
      
      return NextResponse.json({
        success: true,
        action,
        result,
        timestamp: new Date().toISOString()
      });
    }
    
    // Health check response
    return NextResponse.json({
      success: true,
      message: 'WhatsApp Automation API is running',
      timestamp: new Date().toISOString(),
      available_actions: ['cart_followup', 'scheduled_messages', 'all']
    });
    
  } catch (error: any) {
    logger.error('Automation API error', { error: error.message });
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}