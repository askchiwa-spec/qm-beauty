// WhatsApp Chatbot for QM Beauty
// Handles automated responses for common customer inquiries

import { evolutionWhatsApp } from './evolution-whatsapp';
import { prisma } from './prisma';
import { whatsappContextManager } from './whatsapp-context-manager';

interface IncomingMessage {
  from: string;
  message: string;
  timestamp: Date;
  messageId?: string;
}

interface OrderStatus {
  orderCode: string;
  status: string;
  items: Array<{
    name: string;
    quantity: number;
  }>;
  totalAmount: number;
  estimatedDelivery?: string;
  trackingNumber?: string;
}

class WhatsAppChatbot {
  private businessHours: { start: number; end: number }; // Hours in 24-hour format
  private messageFrequencyLimit: number; // Max messages per time period
  private timePeriod: number; // Time period in milliseconds

  constructor() {
    // Business hours: 8 AM to 8 PM
    this.businessHours = { start: 8, end: 20 };
    // Limit to 5 messages per 5 minutes per phone number
    this.messageFrequencyLimit = 5;
    this.timePeriod = 5 * 60 * 1000; // 5 minutes in ms
  }

  /**
   * Process an incoming message and generate appropriate response
   */
  async processIncomingMessage(incomingMessage: IncomingMessage): Promise<boolean> {
    try {
      // Get conversation context
      const context = whatsappContextManager.getContext(incomingMessage.from);
      
      // Check if message is during business hours (skip for ongoing conversations)
      if (!context?.contextState || context.contextState === 'idle') {
        if (!this.isBusinessHours(incomingMessage.timestamp)) {
          const offHoursMessage = this.getOffHoursMessage();
          await evolutionWhatsApp.sendTextMessage(incomingMessage.from, offHoursMessage);
          return true;
        }
      }

      // Check message frequency to prevent spam
      if (!(await this.checkMessageFrequency(incomingMessage.from))) {
        const frequencyLimitMessage = this.getFrequencyLimitMessage();
        await evolutionWhatsApp.sendTextMessage(incomingMessage.from, frequencyLimitMessage);
        return true;
      }

      // Process the message based on content and context
      const response = await this.generateResponse(incomingMessage, context);
      
      if (response) {
        await evolutionWhatsApp.sendTextMessage(incomingMessage.from, response);
        
        // Update context after sending response
        whatsappContextManager.updateContext(incomingMessage.from, {
          lastMessage: incomingMessage.message,
          lastMessageTime: incomingMessage.timestamp
        });
        
        return true;
      }

      return false; // No response generated
    } catch (error) {
      console.error('Error processing incoming message:', error);
      return false;
    }
  }

  /**
   * Generate response based on message content
   */
  private async generateResponse(incomingMessage: IncomingMessage, context: any = null): Promise<string | null> {
    const lowerMessage = incomingMessage.message.toLowerCase();
    const from = incomingMessage.from;

    // If there's an active conversation context, handle it specially
    if (context && context.contextState !== 'idle') {
      const contextResponse = this.handleContextualResponse(incomingMessage, context);
      if (contextResponse) {
        return contextResponse;
      }
    }

    // Handle greetings
    if (this.containsGreeting(lowerMessage)) {
      return await this.getGreetingResponse(from);
    }

    // Handle order status inquiries
    if (lowerMessage.includes('order') || lowerMessage.includes('status')) {
      const orderCode = this.extractOrderCode(incomingMessage.message);
      if (orderCode) {
        return await this.getOrderStatusResponse(orderCode, from);
      }
      // If no order code found, ask for it
      return this.getOrderCodeRequest();
    }

    // Handle product inquiries
    if (lowerMessage.includes('product') || lowerMessage.includes('item') || lowerMessage.includes('catalog')) {
      return this.getProductCatalogResponse();
    }

    // Handle delivery inquiries
    if (lowerMessage.includes('deliver') || lowerMessage.includes('ship') || lowerMessage.includes('arrival')) {
      return this.getDeliveryInfoResponse();
    }

    // Handle payment inquiries
    if (lowerMessage.includes('pay') || lowerMessage.includes('payment') || lowerMessage.includes('money')) {
      return this.getPaymentInfoResponse();
    }

    // Handle return/refund inquiries
    if (lowerMessage.includes('return') || lowerMessage.includes('refund') || lowerMessage.includes('exchange')) {
      return this.getReturnPolicyResponse();
    }

    // Handle appointment/service inquiries
    if (lowerMessage.includes('book') || lowerMessage.includes('appointment') || lowerMessage.includes('service')) {
      return this.getAppointmentInfoResponse();
    }

    // Handle cart-related inquiries
    if (lowerMessage.includes('cart') || lowerMessage.includes('basket') || lowerMessage.includes('my items')) {
      return this.getCartInfoResponse();
    }
    
    // Handle shopping assistance
    if (lowerMessage.includes('buy') || lowerMessage.includes('purchase') || lowerMessage.includes('order now') || lowerMessage.includes('add to cart')) {
      return this.getShoppingAssistanceResponse();
    }
    
    // Handle appointment booking
    if (lowerMessage.includes('book') || lowerMessage.includes('appointment') || lowerMessage.includes('schedule') || lowerMessage.includes('reserve')) {
      return this.getAppointmentBookingResponse();
    }
    
    // Handle help/information requests
    if (lowerMessage.includes('help') || lowerMessage.includes('info') || lowerMessage.includes('information')) {
      return this.getHelpResponse();
    }

    // Handle contact information requests
    if (lowerMessage.includes('contact') || lowerMessage.includes('phone') || lowerMessage.includes('address')) {
      return this.getContactInfoResponse();
    }

    // Default response for unrecognized messages
    return this.getDefaultResponse();
  }
  
  /**
   * Handle contextual responses based on conversation state
   */
  private handleContextualResponse(incomingMessage: IncomingMessage, context: any): string | null {
    const lowerMessage = incomingMessage.message.toLowerCase();
    
    switch (context.contextState) {
      case 'confirming_order':
        if (lowerMessage.includes('yes') || lowerMessage.includes('confirm') || lowerMessage.includes('ok')) {
          // Confirm the order
          whatsappContextManager.updateContext(incomingMessage.from, { contextState: 'idle' });
          return '✅ Your order has been confirmed! You will receive a confirmation message with details shortly.';
        } else if (lowerMessage.includes('no') || lowerMessage.includes('cancel') || lowerMessage.includes('stop')) {
          // Cancel the order
          whatsappContextManager.updateContext(incomingMessage.from, { contextState: 'idle' });
          return '❌ Your order has been cancelled. Let us know if you need anything else!';
        }
        return 'Please confirm your order by replying with "YES" or "NO".';
      
      case 'booking_service':
        if (lowerMessage.includes('yes') || lowerMessage.includes('confirm') || lowerMessage.includes('ok')) {
          // Confirm the booking
          whatsappContextManager.updateContext(incomingMessage.from, { contextState: 'idle' });
          return '✅ Your appointment has been confirmed! You will receive a confirmation message with details shortly.';
        } else if (lowerMessage.includes('no') || lowerMessage.includes('cancel') || lowerMessage.includes('stop')) {
          // Cancel the booking
          whatsappContextManager.updateContext(incomingMessage.from, { contextState: 'idle' });
          return '❌ Your booking has been cancelled. Let us know if you need anything else!';
        }
        return 'Please confirm your booking by replying with "YES" or "NO".';
      
      default:
        return null; // No contextual response
    }
  }

  /**
   * Check if current time is within business hours
   */
  private isBusinessHours(timestamp: Date): boolean {
    const currentHour = timestamp.getHours();
    return currentHour >= this.businessHours.start && currentHour < this.businessHours.end;
  }

  /**
   * Get off-hours response message
   */
  private getOffHoursMessage(): string {
    return `🌙 *QM Beauty After-Hours*

We're currently closed. Our business hours are 8 AM to 8 PM daily.

For urgent inquiries, please call: +255 657 120 151
Or visit our website: qmbeauty.co.tz

We'll get back to you during business hours. Thank you! 💆‍♀️`;
  }

  /**
   * Check if customer has sent too many messages recently
   */
  private async checkMessageFrequency(phoneNumber: string): Promise<boolean> {
    // For now, always return true since we don't have a WhatsApp message tracking table
    // In a production environment, you might want to implement this using a different approach
    return true;
  }

  /**
   * Get frequency limit exceeded message
   */
  private getFrequencyLimitMessage(): string {
    return `⏱️ *Message Rate Limit*

You've sent too many messages in a short time. Please wait a moment before sending another message.

For immediate assistance, call: +255 657 120 151`;
  }

  /**
   * Check if message contains greeting
   */
  private containsGreeting(message: string): boolean {
    const greetings = ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening', 'hola', 'namaste'];
    return greetings.some(greeting => message.includes(greeting));
  }

  /**
   * Get greeting response
   */
  private async getGreetingResponse(phoneNumber: string): Promise<string> {
    // Try to get customer name if available
    const customer = await this.getCustomerByPhone(phoneNumber);
    const customerName = customer ? `, ${customer.name || 'valued customer'}` : '';
    
    return `👋 Hello${customerName}!

Welcome to *QM Beauty*! 💖

How can we assist you today?
• *Order status*: Reply with "ORDER [CODE]" 
• *Products*: Reply with "PRODUCTS" 
• *Delivery*: Reply with "DELIVERY"
• *Book service*: Reply with "BOOK APPOINTMENT"

For immediate help, call: +255 657 120 151`;
  }

  /**
   * Extract order code from message
   */
  private extractOrderCode(message: string): string | null {
    // Look for patterns like QB-XXXXXX or similar order codes
    const orderCodeRegex = /QB-\w+/gi;
    const matches = message.match(orderCodeRegex);
    return matches ? matches[0].toUpperCase() : null;
  }

  /**
   * Get order status response
   */
  private async getOrderStatusResponse(orderCode: string, phoneNumber: string): Promise<string> {
    try {
      const order = await prisma.order.findFirst({
        where: {
          orderCode,
          customerPhone: phoneNumber // Verify the order belongs to this customer
        },
        include: {
          cart: {
            include: {
              items: {
                include: {
                  product: true
                }
              }
            }
          }
        }
      });

      if (!order) {
        return `❌ *Order Not Found*

We couldn't find an order with code *${orderCode}* associated with your phone number. 

Please verify the order code or contact us at +255 657 120 151 for assistance.`;
      }

      const itemsList = order.cart?.items.map((item: any) => 
        `• ${item.product.name} (Qty: ${item.quantity})`
      ).join('\n') || 'No items found';

      return `📦 *Order Status: ${order.orderCode}*

*Status*: ${this.formatStatus(order.fulfillmentStatus)}
*Payment*: ${this.formatStatus(order.paymentStatus)}
*Total*: TZS ${order.totalAmount.toLocaleString()}/=

*Items ordered*:
${itemsList}

*Created*: ${order.createdAt.toLocaleDateString('en-US')}



For more details, call: +255 657 120 151`;
    } catch (error) {
      console.error('Error getting order status:', error);
      return `⚠️ *System Issue*

We're having trouble retrieving your order status. Please try again or call +255 657 120 151 for assistance.`;
    }
  }

  /**
   * Get order code request message
   */
  private getOrderCodeRequest(): string {
    return `🔍 *Order Inquiry*

Please provide your order code to check status. It looks like *QB-XXXXXX* and can be found in your order confirmation.

Reply with: *ORDER [YOUR_CODE]*`;
  }

  /**
   * Get product catalog response
   */
  private getProductCatalogResponse(): string {
    return `🛍️ *QM Beauty Products*

Browse our collection:
• Face Care Products
• Body Care Items  
• Hair Care Solutions
• Beauty Accessories
• Special Bundles

Visit our website for full catalog: qmbeauty.co.tz
Or reply with "CATEGORIES" for specific product groups.`;
  }

  /**
   * Get delivery information response
   */
  private getDeliveryInfoResponse(): string {
    return `🚚 *Delivery Information*

*Standard Delivery*: 1-2 business days
*Express Delivery*: Same day (within city)
*Delivery Areas*: Dar es Salaam, Dodoma, Arusha, Mwanza

*Free delivery* on orders over 50,000 TZS
*Delivery fee*: Starting from 5,000 TZS

Track your order with: *ORDER [ORDER_CODE]*`;
  }

  /**
   * Get payment information response
   */
  private getPaymentInfoResponse(): string {
    return `💳 *Payment Options*

We accept:
• Selcom (via WhatsApp)
• Mobile Money (M-Pesa, Tigo Pesa, Airtel Money)
• Bank Transfer
• Cash on Delivery

Payment instructions sent with order confirmation.
Need payment help? Call: +255 657 120 151`;
  }

  /**
   * Get return policy response
   */
  private getReturnPolicyResponse(): string {
    return `↩️ *Return & Refund Policy*

*Returns accepted within*: 7 days of delivery
*Conditions*: Unopened, original packaging
*Refunds*: Processed within 3-5 business days

For returns, reply with: *RETURN [ORDER_CODE]*
Or call: +255 657 120 151`;
  }

  /**
   * Get appointment information response
   */
  private getAppointmentInfoResponse(): string {
    return `💇‍♀️ *Book Services*

Book beauty services:
• Facial Treatments
• Hair Styling
• Nail Care
• Waxing Services

Visit: qmbeauty.co.tz/appointments
Or call: +255 657 120 151

Reply with "SERVICES" for treatment details.`;
  }

  /**
   * Get help response
   */
  private getHelpResponse(): string {
    return `ℹ️ *QM Beauty Help*

*Order Status*: ORDER [CODE]
*Product Info*: PRODUCTS
*Delivery*: DELIVERY INFO  
*Payments*: PAYMENT OPTIONS
*Returns*: RETURN POLICY
*Services*: BOOK SERVICES

Customer Service: +255 657 120 151
Website: qmbeauty.co.tz`;
  }

  /**
   * Get contact information response
   */
  private getContactInfoResponse(): string {
    return `📞 *Contact QM Beauty*

*Phone*: +255 657 120 151
*WhatsApp*: +255 657 120 151
*Email*: info@qmbeauty.co.tz
*Website*: qmbeauty.co.tz
*Address*: [Your Address Here]

*Business Hours*: 8 AM - 8 PM Daily`;
  }

  /**
   * Get default response for unrecognized messages
   */
  private getDefaultResponse(): string {
    return `👋 *QM Beauty*

Thank you for your message! We'll get back to you within 2 hours during business hours.

For immediate assistance:
• Order status: Reply with *ORDER [CODE]*
• Products: Reply with *PRODUCTS*
• Delivery: Reply with *DELIVERY*

Call anytime: +255 657 120 151`;
  }

  /**
   * Format status for display
   */
  /**
   * Format status for display
   */
  private formatStatus(status: string): string {
    const statusMap: { [key: string]: string } = {
      'new': 'New',
      'processing': 'Processing',
      'shipped': 'Shipped',
      'delivered': 'Delivered',
      'cancelled': 'Cancelled',
      'pending': 'Pending',
      'completed': 'Completed',
      'failed': 'Failed',
      'refunded': 'Refunded'
    };
    
    return statusMap[status] || status.charAt(0).toUpperCase() + status.slice(1);
  }

  /**
   * Get customer by phone number (simplified)
   */
  private async getCustomerByPhone(phoneNumber: string) {
    try {
      return await prisma.user.findFirst({
        where: { phone: phoneNumber },
        select: { name: true }
      });
    } catch (error) {
      console.error('Error fetching customer:', error);
      return null;
    }
  }
  
  /**
   * Get cart information response
   */
  private getCartInfoResponse(): string {
    return `🛒 *Shopping Cart Information*

To check your cart:
• Visit: qmbeauty.co.tz/shop
• Add items to your cart
• Proceed to checkout

For cart assistance, reply with "HELP CART"
Or call: +255 657 120 151`;
  }
  
  /**
   * Get shopping assistance response
   */
  private getShoppingAssistanceResponse(): string {
    return `🛍️ *Shopping Assistance*

Ready to buy from QM Beauty? Here's how:

1. Browse our products at: qmbeauty.co.tz/shop
2. Add desired items to your cart
3. Proceed to checkout
4. Choose your payment method:
   • Selcom (via WhatsApp)
   • Mobile Money
   • Bank Transfer
   • Cash on Delivery

For help with specific products, reply with "CATALOG" or call: +255 657 120 151`;
  }
  
  /**
   * Get appointment booking response
   */
  private getAppointmentBookingResponse(): string {
    return `💇‍♀️ *Book an Appointment*

To book a beauty service:

1. Visit: qmbeauty.co.tz/appointments
2. Select your preferred service
3. Choose date and time
4. Complete booking

Available services:
• Facial Treatments
• Hair Styling
• Nail Care
• Waxing Services

For immediate booking assistance, call: +255 657 120 151`;
  }
}

// Export singleton instance
export const whatsappChatbot = new WhatsAppChatbot();

// Export class for testing
export { WhatsAppChatbot };