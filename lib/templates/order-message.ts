// WhatsApp Order Message Templates
// Optimized for Tanzania market

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  subtotal: number;
}

interface OrderDetails {
  orderCode: string;
  customerName?: string;
  customerPhone: string;
  items: OrderItem[];
  totalAmount: number;
  timestamp?: Date;
}

/**
 * Format currency for Tanzania (TZS)
 */
function formatCurrency(amount: number): string {
  // Convert from cents to TZS
  const tzs = amount;
  
  // Format with commas
  return `TZS ${tzs.toLocaleString('en-TZ')}/=`;
}

/**
 * Generate order confirmation message for WhatsApp
 * This is sent to the QM Beauty team
 */
export function generateOrderMessage(order: OrderDetails): string {
  const timestamp = order.timestamp || new Date();
  const formattedTime = timestamp.toLocaleString('en-TZ', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  // Build items list
  const itemsList = order.items
    .map((item, index) => {
      return `${index + 1}. *${item.name}*\n   Qty: ${item.quantity} × ${formatCurrency(item.price)} = ${formatCurrency(item.subtotal)}`;
    })
    .join('\n\n');

  // Build complete message
  const message = `
🛍️ *NEW ORDER - QM BEAUTY*

📋 *Order Details:*
Order ID: *${order.orderCode}*
Customer: ${order.customerName || 'Guest'}
Phone: ${order.customerPhone}

🛒 *ITEMS ORDERED:*
${itemsList}

━━━━━━━━━━━━━━━━
💰 *TOTAL: ${formatCurrency(order.totalAmount)}*
━━━━━━━━━━━━━━━━

⏰ ${formattedTime}

*NEXT STEPS:*
✅ Reply *CONFIRM* to proceed with order
❌ Reply *CANCEL* if unable to fulfill
💬 Reply with any questions

_This order was placed via QM Beauty website_
`.trim();

  return message;
}

/**
 * Generate customer confirmation message
 * This is sent to the customer
 */
export function generateCustomerConfirmation(order: OrderDetails): string {
  const message = `
👋 *Hello ${order.customerName || 'there'}!*

Thank you for your order from *QM Beauty*! 🌺

📋 *Order ID:* ${order.orderCode}
💰 *Total:* ${formatCurrency(order.totalAmount)}

✨ *What happens next?*
1️⃣ We're reviewing your order
2️⃣ You'll receive payment instructions shortly
3️⃣ Once paid, we'll prepare your items
4️⃣ Delivery/pickup details will be shared

📞 *Need help?*
Call/WhatsApp: +255 657 120 151
Email: info@qmbeauty.co.tz

Thank you for choosing QM Beauty! 💆🏽‍♀️✨
`.trim();

  return message;
}

/**
 * Generate booking confirmation message
 */
export function generateBookingMessage(details: {
  customerName: string;
  customerPhone: string;
  serviceName: string;
  bookingTime: Date;
  duration?: number;
}): string {
  const formattedTime = details.bookingTime.toLocaleString('en-TZ', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const message = `
💆🏽‍♀️ *NEW SERVICE BOOKING*

📅 *Booking Details:*
Customer: *${details.customerName}*
Phone: ${details.customerPhone}
Service: *${details.serviceName}*
Date & Time: ${formattedTime}
${details.duration ? `Duration: ${details.duration} minutes` : ''}

*STAFF ACTION REQUIRED:*
✅ Confirm availability
📞 Contact customer to confirm
🗓️ Add to calendar

_Booked via QM Beauty Calendly_
`.trim();

  return message;
}

/**
 * Generate payment received confirmation
 */
export function generatePaymentConfirmation(details: {
  orderCode: string;
  customerName: string;
  amount: number;
  paymentMethod: string;
}): string {
  const message = `
✅ *PAYMENT RECEIVED*

Order: ${details.orderCode}
Customer: ${details.customerName}
Amount: ${formatCurrency(details.amount)}
Method: ${details.paymentMethod}

🎉 Payment confirmed! Please prepare order for delivery.
`.trim();

  return message;
}

/**
 * Validate phone number format for Tanzania
 */
export function validateTanzaniaPhone(phone: string): boolean {
  // Remove spaces and dashes
  const cleaned = phone.replace(/[\s-]/g, '');
  
  // Valid formats:
  // +255XXXXXXXXX (13 digits)
  // 0XXXXXXXXX (10 digits)
  // 7XXXXXXXX or 6XXXXXXXX (9 digits - mobile)
  
  const patterns = [
    /^\+255[67]\d{8}$/,  // +255 7XX XXX XXX
    /^0[67]\d{8}$/,       // 0 7XX XXX XXX
    /^[67]\d{8}$/,        // 7XX XXX XXX
  ];
  
  return patterns.some(pattern => pattern.test(cleaned));
}
