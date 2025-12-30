// API Route: Calendly Webhook
// POST /api/calendly/webhook

import { NextRequest, NextResponse } from 'next/server';
import { createHmac } from 'crypto';
import { whatsappClient } from '@/lib/whatsapp';
import { generateBookingMessage } from '@/lib/templates/order-message';

interface CalendlyWebhook {
  event: string;
  payload: {
    event_type: string;
    event: {
      uri: string;
      name: string;
      start_time: string;
      end_time: string;
      location?: {
        type: string;
        location?: string;
      };
    };
    invitee: {
      uri: string;
      name: string;
      email: string;
      text_reminder_number?: string;
      timezone: string;
      created_at: string;
      questions_and_answers?: Array<{
        question: string;
        answer: string;
      }>;
    };
  };
}

function verifyCalendlySignature(body: string, signature: string): boolean {
  const signingKey = process.env.CALENDLY_WEBHOOK_SIGNING_KEY;
  
  if (!signingKey) {
    console.warn('Calendly webhook signing key not configured');
    return true; // Allow webhook if key not configured (for testing)
  }

  const expectedSignature = createHmac('sha256', signingKey)
    .update(body)
    .digest('hex');

  return signature === expectedSignature;
}

export async function POST(request: NextRequest) {
  try {
    const bodyText = await request.text();
    const body: CalendlyWebhook = JSON.parse(bodyText);
    
    // Verify webhook signature
    const signature = request.headers.get('calendly-webhook-signature') || '';
    
    if (!verifyCalendlySignature(bodyText, signature)) {
      console.error('Invalid Calendly webhook signature');
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 403 }
      );
    }

    const { event, payload } = body;

    console.log('Calendly Webhook Received:', {
      event,
      eventType: payload.event_type,
      invitee: payload.invitee.name,
    });

    // Handle booking created/rescheduled
    if (event === 'invitee.created' || event === 'invitee.rescheduled') {
      const { invitee, event: eventDetails } = payload;

      // Extract phone number from questions if available
      let phoneNumber = invitee.text_reminder_number || '';
      
      if (!phoneNumber && invitee.questions_and_answers) {
        const phoneQuestion = invitee.questions_and_answers.find(
          qa => qa.question.toLowerCase().includes('phone')
        );
        if (phoneQuestion) {
          phoneNumber = phoneQuestion.answer;
        }
      }

      // TODO: Store booking in database
      const bookingData = {
        calendlyUri: invitee.uri,
        customerName: invitee.name,
        customerEmail: invitee.email,
        customerPhone: phoneNumber,
        serviceName: eventDetails.name,
        startTime: new Date(eventDetails.start_time),
        endTime: new Date(eventDetails.end_time),
        timezone: invitee.timezone,
        status: 'confirmed',
        createdAt: new Date(invitee.created_at),
      };

      console.log('Booking Data:', bookingData);

      // Send WhatsApp notification to QM Beauty team
      const bookingMessage = generateBookingMessage({
        customerName: invitee.name,
        customerPhone: phoneNumber,
        customerEmail: invitee.email,
        serviceName: eventDetails.name,
        startTime: new Date(eventDetails.start_time),
        endTime: new Date(eventDetails.end_time),
      });

      if (whatsappClient.isConfigured()) {
        const recipientNumber = process.env.WHATSAPP_RECIPIENT_NUMBER || '+255715727085';
        
        const result = await whatsappClient.sendTextMessage(
          recipientNumber,
          bookingMessage
        );

        if (!result.success) {
          console.error('Failed to send booking notification:', result.error);
        }
      }

      return NextResponse.json({
        success: true,
        message: 'Booking processed successfully',
      });
    }

    // Handle booking cancellation
    if (event === 'invitee.canceled') {
      const { invitee, event: eventDetails } = payload;

      console.log('Booking Cancelled:', {
        name: invitee.name,
        service: eventDetails.name,
      });

      // TODO: Update booking status in database to 'cancelled'

      // Notify team
      if (whatsappClient.isConfigured()) {
        const recipientNumber = process.env.WHATSAPP_RECIPIENT_NUMBER || '+255715727085';
        
        const cancelMessage = `❌ *BOOKING CANCELLED*

Customer: ${invitee.name}
Service: ${eventDetails.name}
Time: ${new Date(eventDetails.start_time).toLocaleString('en-TZ')}

_Cancelled via Calendly_`;

        await whatsappClient.sendTextMessage(recipientNumber, cancelMessage);
      }

      return NextResponse.json({
        success: true,
        message: 'Cancellation processed',
      });
    }

    // Unknown event type
    return NextResponse.json({
      success: true,
      message: 'Event received but not processed',
    });
  } catch (error: any) {
    console.error('Calendly Webhook Error:', error);
    
    // Return 200 to prevent webhook retries
    return NextResponse.json({
      error: 'Webhook processing error',
      details: error.message,
    }, { status: 200 });
  }
}

// Calendly might send GET requests to verify endpoint
export async function GET() {
  return NextResponse.json({
    status: 'active',
    service: 'QM Beauty Calendly Webhook',
  });
}
