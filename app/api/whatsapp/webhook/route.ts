// WhatsApp Webhook Handler
// Receives incoming messages from Evolution API and processes them

import { NextRequest, NextResponse } from 'next/server';
import { whatsappChatbot } from '@/lib/whatsapp-chatbot';
import { whatsappAnalytics } from '@/lib/whatsapp-analytics';
import { evolutionWhatsApp } from '@/lib/evolution-whatsapp';
import { logger } from '@/lib/logging';
import { whatsappBusinessActions } from '@/lib/whatsapp-business-actions';

export async function POST(request: NextRequest) {
  try {
    // Log incoming webhook request
    logger.info('WhatsApp webhook received');
    
    // Get webhook payload
    const payload = await request.json();
    
    // Log the full payload for debugging (in production, you might want to be more selective)
    console.log('WhatsApp webhook payload:', JSON.stringify(payload, null, 2));
    
    // Process different types of webhook events
    if (payload.event === 'MESSAGES_UPSERT' || payload.event === 'MESSAGES_SET') {
      // Handle incoming messages
      await handleIncomingMessage(payload);
    } else if (payload.event === 'MESSAGES_UPDATE') {
      // Handle message status updates (delivered, read, etc.)
      await handleMessageUpdate(payload);
    } else if (payload.event === 'SEND_MESSAGE_SUCCESS') {
      // Handle successful message sends
      await handleSendMessageSuccess(payload);
    } else if (payload.event === 'SEND_MESSAGE_FAILED') {
      // Handle failed message sends
      await handleSendMessageFailed(payload);
    } else {
      // Log unknown events
      logger.info('Unknown webhook event', { event: payload.event, payload });
    }
    
    // Return success response
    return NextResponse.json({ 
      success: true, 
      message: 'Webhook processed successfully' 
    });
  } catch (error: any) {
    console.error('Error processing WhatsApp webhook:', error);
    logger.error('WhatsApp webhook error', { error: error.message, stack: error.stack });
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to process webhook' 
      },
      { status: 500 }
    );
  }
}

/**
 * Handle incoming messages
 */
async function handleIncomingMessage(payload: any) {
  try {
    // Extract message details
    const messageData = payload.data?.messages?.[0];
    if (!messageData) {
      logger.warn('No message data found in webhook payload');
      return;
    }
    
    // Skip messages from status broadcasts or own messages
    if (messageData.fromMe || messageData.author?.includes('status')) {
      logger.info('Skipping outgoing or status message');
      return;
    }
    
    // Get sender info
    const sender = messageData.from;
    const messageBody = messageData.body || messageData.caption || '';
    const timestamp = new Date(messageData.timestamp * 1000); // Convert Unix timestamp
    
    // Create incoming message object
    const incomingMessage = {
      from: sender,
      message: messageBody,
      timestamp,
      messageId: messageData.id
    };
    
    logger.info('Processing incoming message', { from: sender, message: messageBody });
    
    // Track the incoming message
    await whatsappAnalytics.trackMessage(
      incomingMessage.messageId,
      incomingMessage.from,
      incomingMessage.message,
      'text'
    );
    
    // Process the message through the business actions first
    const businessProcessed = await whatsappBusinessActions.processBusinessAction(incomingMessage);
    
    if (!businessProcessed) {
      // If no business action was triggered, process through chatbot
      const chatbotProcessed = await whatsappChatbot.processIncomingMessage(incomingMessage);
      
      if (chatbotProcessed) {
        logger.info('Message processed by chatbot', { from: sender });
      } else {
        logger.info('Message not processed by chatbot', { from: sender });
      }
    } else {
      logger.info('Message processed as business action', { from: sender });
    }
  } catch (error) {
    console.error('Error handling incoming message:', error);
    logger.error('Error handling incoming message', { error });
  }
}

/**
 * Handle message status updates (delivered, read)
 */
async function handleMessageUpdate(payload: any) {
  try {
    const updateData = payload.data;
    const messageId = updateData.id;
    const status = updateData.status;
    
    // Update message tracking based on status
    if (status === 'delivered') {
      await whatsappAnalytics.updateMessageStatus(messageId, 'delivered');
      logger.info('Message delivered', { messageId });
    } else if (status === 'read') {
      await whatsappAnalytics.updateMessageStatus(messageId, 'read');
      logger.info('Message read', { messageId });
    } else if (status === 'failed') {
      await whatsappAnalytics.updateMessageStatus(messageId, 'failed');
      logger.warn('Message failed', { messageId });
    }
  } catch (error) {
    console.error('Error handling message update:', error);
    logger.error('Error handling message update', { error });
  }
}

/**
 * Handle successful message sends
 */
async function handleSendMessageSuccess(payload: any) {
  try {
    const messageData = payload.data;
    const messageId = messageData.key?.id;
    const to = messageData.key?.remoteJid;
    
    // Track successful send
    if (messageId) {
      await whatsappAnalytics.updateMessageStatus(messageId, 'sent');
      logger.info('Message sent successfully', { messageId, to });
    }
  } catch (error) {
    console.error('Error handling send success:', error);
    logger.error('Error handling send success', { error });
  }
}

/**
 * Handle failed message sends
 */
async function handleSendMessageFailed(payload: any) {
  try {
    const errorData = payload.data;
    const messageId = errorData.key?.id;
    const reason = errorData.error || 'Unknown error';
    
    // Track failed send
    if (messageId) {
      await whatsappAnalytics.updateMessageStatus(messageId, 'failed', reason);
      logger.warn('Message send failed', { messageId, reason });
    }
  } catch (error) {
    console.error('Error handling send failure:', error);
    logger.error('Error handling send failure', { error });
  }
}

// Add a GET endpoint for webhook verification (if needed by Evolution API)
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const mode = url.searchParams.get('hub.mode');
    const token = url.searchParams.get('hub.verify_token');
    const challenge = url.searchParams.get('hub.challenge');
    
    // Verify token (you should set this in your Evolution API configuration)
    const expectedToken = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN;
    
    if (mode === 'subscribe' && token === expectedToken) {
      console.log('Webhook verified successfully');
      return new NextResponse(challenge, { status: 200 });
    } else {
      console.log('Webhook verification failed', { mode, token });
      return new NextResponse('Forbidden', { status: 403 });
    }
  } catch (error) {
    console.error('Error verifying webhook:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}