// API Route: Selcom Payment Webhook
// POST /api/payment/webhook

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { selcomClient } from '@/lib/selcom';
import { generatePaymentConfirmation } from '@/lib/templates/order-message';
import {
  sanitizeInput,
  isValidTanzaniaPhone,
  isValidAmount,
  isValidPaymentStatus,
} from '@/lib/security/validation';

async function getUnifiedWhatsApp() {
  const { unifiedWhatsApp } = await import('@/lib/unified-whatsapp');
  return unifiedWhatsApp;
}

interface SelcomWebhook {
  order_id: string;
  transaction_id: string;
  status: 'COMPLETED' | 'FAILED' | 'PENDING';
  amount: number;
  currency: string;
  payment_method: string;
  payment_phone: string;
  reference: string;
  created_at: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: SelcomWebhook = await request.json();

    // Verify signature
    const signature = request.headers.get('x-selcom-signature');
    if (!signature) {
      console.error('Missing webhook signature');
      return NextResponse.json({ error: 'Missing signature' }, { status: 401 });
    }
    const isValid = selcomClient.verifyWebhookSignature(JSON.stringify(body), signature);
    if (!isValid) {
      console.error('Invalid webhook signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 403 });
    }

    const { order_id, transaction_id, status, amount, currency, payment_method, payment_phone } = body;

    // Basic field validation
    if (!order_id || !transaction_id || !status || amount === undefined || amount === null) {
      return NextResponse.json({ error: 'Invalid webhook data' }, { status: 400 });
    }
    if (!isValidPaymentStatus(status)) {
      return NextResponse.json({ error: 'Invalid payment status' }, { status: 400 });
    }
    if (!isValidAmount(amount)) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
    }
    if (currency !== 'TZS') {
      return NextResponse.json({ error: 'Unsupported currency' }, { status: 400 });
    }
    if (!isValidTanzaniaPhone(payment_phone)) {
      return NextResponse.json({ error: 'Invalid phone number' }, { status: 400 });
    }

    const sanitizedPaymentMethod = sanitizeInput(payment_method);

    console.log('Payment Webhook:', { orderId: order_id, status, amount, transactionId: transaction_id });

    // ─── IDEMPOTENCY CHECK ────────────────────────────────────────────────────
    // Selcom retries webhooks on failure. Skip if already processed.
    const existingPayment = await prisma.payment.findFirst({
      where: { selcomTransactionId: transaction_id },
    }).catch(() => null);

    if (existingPayment && existingPayment.status === 'completed') {
      console.log('Duplicate webhook — already processed:', transaction_id);
      return NextResponse.json({ success: true, message: 'Already processed' });
    }
    // ──────────────────────────────────────────────────────────────────────────

    // ─── LOOK UP ORDER ────────────────────────────────────────────────────────
    // order_id from Selcom is the orderCode (QB-XXXXXX)
    const order = await prisma.order.findUnique({
      where: { orderCode: order_id },
    }).catch(() => null);

    if (!order) {
      console.error('Order not found for webhook:', order_id);
      // Return 200 so Selcom doesn't keep retrying for unknown orders
      return NextResponse.json({ success: true, message: 'Order not found — acknowledged' });
    }
    // ──────────────────────────────────────────────────────────────────────────

    if (status === 'COMPLETED') {
      // ─── DATABASE: RECORD PAYMENT + UPDATE ORDER ──────────────────────────
      try {
        await prisma.$transaction([
          // Upsert payment record (create if pending entry exists, else create new)
          ...(existingPayment
            ? [prisma.payment.update({
                where: { id: existingPayment.id },
                data: {
                  status: 'completed',
                  selcomTransactionId: transaction_id,
                  paymentMethod: sanitizedPaymentMethod,
                  webhookReceivedAt: new Date(),
                  gatewayResponse: body as any,
                },
              })]
            : [prisma.payment.create({
                data: {
                  orderId: order.id,
                  selcomTransactionId: transaction_id,
                  amount,
                  phone: payment_phone,
                  paymentMethod: sanitizedPaymentMethod,
                  status: 'completed',
                  webhookReceivedAt: new Date(),
                  gatewayResponse: body as any,
                },
              })]),
          // Mark order as paid and move to processing
          prisma.order.update({
            where: { id: order.id },
            data: {
              paymentStatus: 'paid',
              paymentMethod: sanitizedPaymentMethod.toLowerCase(),
              fulfillmentStatus: 'processing',
            },
          }),
        ]);
        console.log('Payment recorded and order updated for:', order_id);
      } catch (dbError) {
        console.error('DB write failed for payment webhook:', dbError);
        // Return 500 so Selcom retries — we need these writes to succeed
        return NextResponse.json({ error: 'Database error' }, { status: 500 });
      }
      // ────────────────────────────────────────────────────────────────────────

      // WhatsApp confirmation to customer and team
      const confirmationMessage = generatePaymentConfirmation({
        orderCode: order_id,
        customerName: order.customerName,
        amount,
        paymentMethod: sanitizedPaymentMethod,
      });

      const teamMessage =
        `✅ *PAYMENT RECEIVED*\n\n` +
        `Order: ${order_id}\n` +
        `Customer: ${order.customerName}\n` +
        `Amount: TZS ${amount.toLocaleString()}/=\n` +
        `Method: ${sanitizedPaymentMethod}\n` +
        `Transaction: ${transaction_id}\n\n` +
        `📦 *Action Required:* Process order for delivery`;

      try {
        const unifiedWhatsApp = await getUnifiedWhatsApp();
        if (await unifiedWhatsApp.isConfigured()) {
          await unifiedWhatsApp.sendTextMessage(order.customerPhone, confirmationMessage);
          const recipientNumber = process.env.WHATSAPP_RECIPIENT_NUMBER || '+255657120151';
          await unifiedWhatsApp.sendTextMessage(recipientNumber, teamMessage);
        }
      } catch (whatsappError) {
        // Log but don't fail the webhook — payment was already recorded
        console.error('WhatsApp notification failed post-payment:', whatsappError);
      }

      return NextResponse.json({ success: true, message: 'Payment processed successfully' });

    } else if (status === 'FAILED') {
      // Update order and payment status to failed
      try {
        await prisma.order.update({
          where: { id: order.id },
          data: { paymentStatus: 'failed' },
        });
        if (existingPayment) {
          await prisma.payment.update({
            where: { id: existingPayment.id },
            data: { status: 'failed', webhookReceivedAt: new Date(), gatewayResponse: body as any },
          });
        }
      } catch (dbError) {
        console.error('DB update failed for failed payment:', dbError);
      }
      console.error('Payment failed for order:', order_id);
      return NextResponse.json({ success: true, message: 'Payment failure recorded' });

    } else {
      // PENDING — update timestamp if record exists
      if (existingPayment) {
        await prisma.payment.update({
          where: { id: existingPayment.id },
          data: { webhookReceivedAt: new Date() },
        }).catch(() => null);
      }
      return NextResponse.json({ success: true, message: 'Payment pending acknowledged' });
    }
  } catch (error: any) {
    console.error('Webhook Processing Error:', error);
    return NextResponse.json({ error: 'Webhook processing error' }, { status: 500 });
  }
}

// Selcom might send GET to verify the endpoint is alive
export async function GET() {
  return NextResponse.json({ status: 'active', service: 'QM Beauty Payment Webhook' });
}
