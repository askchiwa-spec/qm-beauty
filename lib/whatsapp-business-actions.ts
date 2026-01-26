// WhatsApp Business Actions Handler
// Connects WhatsApp messages to business operations

import { prisma } from './prisma';
import { evolutionWhatsApp } from './evolution-whatsapp';
import { whatsappAnalytics } from './whatsapp-analytics';
import { logger } from './logging';

interface BusinessAction {
  action: 'order_status' | 'cancel_order' | 'update_contact' | 'request_catalog' | 'book_service' | 'payment_info' | 'complaint' | 'feedback' | 'auto_booking_confirm' | 'cart_followup';
  phoneNumber: string;
  parameters?: Record<string, any>;
  messageContent: string;
}

interface OrderAction extends BusinessAction {
  action: 'order_status' | 'cancel_order';
  parameters: {
    orderCode: string;
  };
}

interface ContactAction extends BusinessAction {
  action: 'update_contact';
  parameters: {
    name?: string;
    email?: string;
    address?: string;
  };
}

interface CatalogAction extends BusinessAction {
  action: 'request_catalog';
  parameters: {
    category?: string;
  };
}

interface BookingAction extends BusinessAction {
  action: 'book_service';
  parameters: {
    service: string;
    dateTime: string;
    duration?: number;
  };
}

class WhatsAppBusinessActions {
  /**
   * Process an incoming message and determine if it triggers a business action
   */
  async processBusinessAction(message: {
    from: string;
    message: string;
    timestamp: Date;
    messageId?: string;
  }): Promise<boolean> {
    try {
      // Parse the message to identify business intent
      const action = this.parseBusinessIntent(message);
      
      if (!action) {
        return false; // No business action identified
      }

      // Track the business action
      await whatsappAnalytics.trackMessage(
        message.messageId,
        message.from,
        message.message,
        'text'
      );

      // Execute the business action
      const result = await this.executeAction(action);
      
      if (result.success) {
        // Update message status to show it triggered a business action
        if (message.messageId) {
          await whatsappAnalytics.updateMessageStatus(message.messageId, 'read');
        }
        
        logger.info('Business action executed successfully', { 
          action: action.action, 
          phoneNumber: action.phoneNumber,
          result: result.message 
        });
        
        return true;
      } else {
        logger.error('Business action failed', { 
          action: action.action, 
          phoneNumber: action.phoneNumber,
          error: result.error 
        });
        
        // Send error message to user
        await evolutionWhatsApp.sendTextMessage(
          message.from,
          `⚠️ Sorry, we couldn't process your request: ${result.error || 'Unknown error'}. Please try again or call +255 657 120 151.`
        );
        
        return false;
      }
    } catch (error) {
      console.error('Error processing business action:', error);
      logger.error('Business action processing error', { error });
      
      // Send generic error message to user
      await evolutionWhatsApp.sendTextMessage(
        message.from,
        '⚠️ We encountered an issue processing your request. Please try again or call +255 657 120 151 for assistance.'
      );
      
      return false;
    }
  }

  /**
   * Parse message to identify business intent
   */
  private parseBusinessIntent(message: { from: string; message: string; timestamp: Date }): BusinessAction | null {
    const lowerMessage = message.message.toLowerCase().trim();
    const phoneNumber = message.from;

    // Order status inquiry: "status QB-123456" or "order QB-123456" or "where is my order QB-123456"
    const orderCodeMatch = lowerMessage.match(/qb-\w+/i);
    if (orderCodeMatch) {
      const orderCode = orderCodeMatch[0].toUpperCase();
      if (lowerMessage.includes('status') || lowerMessage.includes('where') || lowerMessage.includes('order')) {
        return {
          action: 'order_status',
          phoneNumber,
          messageContent: message.message,
          parameters: { orderCode }
        };
      }
    }

    // Order cancellation: "cancel QB-123456" or "cancel order QB-123456"
    if (lowerMessage.includes('cancel') && orderCodeMatch) {
      const orderCode = orderCodeMatch[0].toUpperCase();
      return {
        action: 'cancel_order',
        phoneNumber,
        messageContent: message.message,
        parameters: { orderCode }
      };
    }

    // Contact update: "update name John Doe" or "change email john@example.com"
    if (lowerMessage.includes('update') || lowerMessage.includes('change') || lowerMessage.includes('modify')) {
      // Extract name
      const nameMatch = lowerMessage.match(/name\s+(.+)/i);
      if (nameMatch) {
        return {
          action: 'update_contact',
          phoneNumber,
          messageContent: message.message,
          parameters: { name: nameMatch[1].trim() }
        };
      }

      // Extract email
      const emailMatch = lowerMessage.match(/\b[\w.-]+@[\w.-]+\.\w{2,}\b/i);
      if (emailMatch) {
        return {
          action: 'update_contact',
          phoneNumber,
          messageContent: message.message,
          parameters: { email: emailMatch[0] }
        };
      }

      // Extract address
      if (lowerMessage.includes('address') || lowerMessage.includes('location')) {
        const addressMatch = lowerMessage.match(/(?:address|location)\s+(.+)/i);
        if (addressMatch) {
          return {
            action: 'update_contact',
            phoneNumber,
            messageContent: message.message,
            parameters: { address: addressMatch[1].trim() }
          };
        }
      }
    }

    // Catalog request: "catalog", "products", "show me products", "what do you have"
    if (lowerMessage.includes('catalog') || 
        lowerMessage.includes('product') || 
        lowerMessage.includes('what do you have') ||
        lowerMessage.includes('show me')) {
      
      // Extract category if specified
      let category: string | undefined;
      if (lowerMessage.includes('face') || lowerMessage.includes('facial')) {
        category = 'face';
      } else if (lowerMessage.includes('hair')) {
        category = 'hair';
      } else if (lowerMessage.includes('body')) {
        category = 'body';
      } else if (lowerMessage.includes('bundle') || lowerMessage.includes('special')) {
        category = 'bundles';
      }

      return {
        action: 'request_catalog',
        phoneNumber,
        messageContent: message.message,
        parameters: category ? { category } : {}
      };
    }

    // Booking request: "book facial", "schedule appointment", "book service"
    if (lowerMessage.includes('book') || 
        lowerMessage.includes('schedule') || 
        lowerMessage.includes('appointment') ||
        lowerMessage.includes('reserve')) {
      
      let service = '';
      if (lowerMessage.includes('facial')) service = 'Facial Treatment';
      else if (lowerMessage.includes('hair')) service = 'Hair Service';
      else if (lowerMessage.includes('manicure')) service = 'Manicure';
      else if (lowerMessage.includes('pedicure')) service = 'Pedicure';
      else if (lowerMessage.includes('wax')) service = 'Waxing Service';
      else service = 'Beauty Service';

      // Try to extract date/time
      const dateTime = this.extractDateTime(lowerMessage) || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // Default to tomorrow

      return {
        action: 'book_service',
        phoneNumber,
        messageContent: message.message,
        parameters: {
          service,
          dateTime
        }
      };
    }

    // Payment info request: "payment", "pay", "how to pay", "payment method"
    if (lowerMessage.includes('pay') || 
        lowerMessage.includes('payment') || 
        lowerMessage.includes('method') ||
        lowerMessage.includes('mobile money')) {
      return {
        action: 'payment_info',
        phoneNumber,
        messageContent: message.message
      };
    }

    // Complaint: "complaint", "issue", "problem", "not satisfied"
    if (lowerMessage.includes('complaint') || 
        lowerMessage.includes('issue') || 
        lowerMessage.includes('problem') ||
        lowerMessage.includes('not satisfied') ||
        lowerMessage.includes('bad service')) {
      return {
        action: 'complaint',
        phoneNumber,
        messageContent: message.message
      };
    }

    // Feedback: "feedback", "review", "opinion", "suggestion"
    if (lowerMessage.includes('feedback') || 
        lowerMessage.includes('review') || 
        lowerMessage.includes('opinion') ||
        lowerMessage.includes('suggestion')) {
      return {
        action: 'feedback',
        phoneNumber,
        messageContent: message.message
      };
    }

    return null; // No business action identified
  }

  /**
   * Execute a business action
   */
  public async executeAction(action: BusinessAction): Promise<{
    success: boolean;
    message?: string;
    error?: string;
  }> {
    try {
      switch (action.action) {
        case 'order_status':
          return await this.handleOrderStatus(action as OrderAction);
        case 'cancel_order':
          return await this.handleOrderCancellation(action as OrderAction);
        case 'update_contact':
          return await this.handleContactUpdate(action as ContactAction);
        case 'request_catalog':
          return await this.handleCatalogRequest(action as CatalogAction);
        case 'book_service':
          return await this.handleBookingRequest(action as BookingAction);
        case 'payment_info':
          return await this.handlePaymentInfoRequest(action);
        case 'complaint':
          return await this.handleComplaint(action);
        case 'feedback':
          return await this.handleFeedback(action);
        case 'auto_booking_confirm':
          return await this.handleAutoBookingConfirmation(action);
        case 'cart_followup':
          return await this.handleCartFollowUp(action);
        default:
          return {
            success: false,
            error: 'Unknown action type'
          };
      }
    } catch (error) {
      console.error('Error executing business action:', error);
      return {
        success: false,
        error: 'Execution error'
      };
    }
  }

  /**
   * Handle order status inquiry
   */
  private async handleOrderStatus(action: OrderAction): Promise<{
    success: boolean;
    message?: string;
    error?: string;
  }> {
    try {
      const order = await prisma.order.findFirst({
        where: {
          orderCode: action.parameters.orderCode,
          customerPhone: action.phoneNumber
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
        return {
          success: false,
          error: `Order ${action.parameters.orderCode} not found for your phone number. Please verify the order code.`
        };
      }

      const itemsList = order.cart?.items.map((item: any) => 
        `• ${item.product.name} (Qty: ${item.quantity})`
      ).join('\n') || 'No items found';

      const statusMessage = `📦 *Order Status: ${order.orderCode}*\n\n` +
        `*Status*: ${this.formatStatus(order.fulfillmentStatus)}\n` +
        `*Payment*: ${this.formatStatus(order.paymentStatus)}\n` +
        `*Total*: TZS ${order.totalAmount.toLocaleString()}/=\n\n` +
        `*Items ordered*:\n${itemsList}\n\n` +
        `*Created*: ${order.createdAt.toLocaleDateString('en-US')}\n` +
        `\n\nFor more details, call: +255 657 120 151`;

      await evolutionWhatsApp.sendTextMessage(action.phoneNumber, statusMessage);

      return {
        success: true,
        message: `Order status sent for ${action.parameters.orderCode}`
      };
    } catch (error) {
      console.error('Error handling order status:', error);
      return {
        success: false,
        error: 'Could not retrieve order status'
      };
    }
  }

  /**
   * Handle order cancellation
   */
  private async handleOrderCancellation(action: OrderAction): Promise<{
    success: boolean;
    message?: string;
    error?: string;
  }> {
    try {
      // In a real implementation, you'd have more complex logic for cancellations
      // including checking order status, payment status, etc.
      const order = await prisma.order.findFirst({
        where: {
          orderCode: action.parameters.orderCode,
          customerPhone: action.phoneNumber,
          fulfillmentStatus: { not: 'delivered' } // Only allow cancellation if not delivered
        }
      });

      if (!order) {
        return {
          success: false,
          error: `Order ${action.parameters.orderCode} cannot be canceled. It may already be processed or delivered.`
        };
      }

      // Update order status to cancelled
      await prisma.order.update({
        where: { id: order.id },
        data: { fulfillmentStatus: 'cancelled' }
      });

      await evolutionWhatsApp.sendTextMessage(
        action.phoneNumber,
        `❌ *Order Cancelled*

Order ${action.parameters.orderCode} has been successfully cancelled.

Refund will be processed according to our refund policy. For questions, call +255 657 120 151.`
      );

      return {
        success: true,
        message: `Order ${action.parameters.orderCode} cancelled`
      };
    } catch (error) {
      console.error('Error handling order cancellation:', error);
      return {
        success: false,
        error: 'Could not cancel order'
      };
    }
  }

  /**
   * Handle contact information update
   */
  private async handleContactUpdate(action: ContactAction): Promise<{
    success: boolean;
    message?: string;
    error?: string;
  }> {
    try {
      const updates: any = {};
      if (action.parameters.name) updates.name = action.parameters.name;
      if (action.parameters.email) updates.email = action.parameters.email;
      if (action.parameters.address) updates.deliveryAddress = action.parameters.address;

      if (Object.keys(updates).length === 0) {
        return {
          success: false,
          error: 'No valid information to update provided'
        };
      }

      await prisma.user.update({
        where: { phone: action.phoneNumber },
        data: updates
      });

      const updateMessage = `✅ *Information Updated*\n\nYour information has been updated successfully:\n` +
        (action.parameters.name ? `- Name: ${action.parameters.name}\n` : '') +
        (action.parameters.email ? `- Email: ${action.parameters.email}\n` : '') +
        (action.parameters.address ? `- Address: ${action.parameters.address}\n` : '') +
        `\nThank you for keeping your information current!`;

      await evolutionWhatsApp.sendTextMessage(action.phoneNumber, updateMessage);

      return {
        success: true,
        message: 'Contact information updated'
      };
    } catch (error) {
      console.error('Error handling contact update:', error);
      return {
        success: false,
        error: 'Could not update contact information'
      };
    }
  }

  /**
   * Handle catalog request
   */
  private async handleCatalogRequest(action: CatalogAction): Promise<{
    success: boolean;
    message?: string;
    error?: string;
  }> {
    try {
      // This would typically pull from your product database
      let catalogMessage = `🛍️ *QM Beauty Product Catalog*\n\n`;
      
      if (action.parameters.category) {
        catalogMessage += `*Category: ${action.parameters.category.toUpperCase()}*\n\n`;
      }

      catalogMessage += `*Popular Products:*\n` +
        `• Premium Face Cream - TZS 15,000/=\n` +
        `• Natural Hair Oil - TZS 12,000/=\n` +
        `• Body Scrub Set - TZS 18,000/=\n` +
        `• Makeup Kit - TZS 25,000/=\n\n` +
        `*Special Bundles:*\n` +
        `• Face Care Bundle - TZS 40,000/= (Save 20%)\n` +
        `• Hair Care Bundle - TZS 35,000/= (Save 15%)\n\n` +
        `Visit our website for full catalog: qmbeauty.co.tz\n` +
        `To order, reply with: ORDER [PRODUCT NAME]`;

      await evolutionWhatsApp.sendTextMessage(action.phoneNumber, catalogMessage);

      return {
        success: true,
        message: 'Catalog sent'
      };
    } catch (error) {
      console.error('Error handling catalog request:', error);
      return {
        success: false,
        error: 'Could not retrieve catalog'
      };
    }
  }

  /**
   * Handle booking request
   */
  private async handleBookingRequest(action: BookingAction): Promise<{
    success: boolean;
    message?: string;
    error?: string;
  }> {
    try {
      // Create a booking record
      const booking = await prisma.booking.create({
        data: {
          customerName: action.phoneNumber, // Will be updated when we get the real name
          customerPhone: action.phoneNumber,
          customerEmail: '', // Will be updated later
          serviceName: action.parameters.service,
          bookingTime: new Date(action.parameters.dateTime),
          status: 'confirmed',
          depositPaid: false,
          depositAmount: 10000, // Example deposit
          notes: `Requested via WhatsApp: ${action.messageContent}`
        }
      });

      const bookingMessage = `💇‍♀️ *Service Booking Confirmed*\n\n` +
        `*Service*: ${action.parameters.service}\n` +
        `*Date & Time*: ${new Date(action.parameters.dateTime).toLocaleString('en-US')}\n` +
        `*Booking ID*: BK-${booking.id.slice(0, 8).toUpperCase()}\n` +
        `*Deposit*: TZS 10,000/= required\n\n` +
        `Please complete your booking by paying the deposit via Selcom or Mobile Money.\n\n` +
        `For changes, reply with: CHANGE [BOOKING_ID]\n\n` +
        `✅ You will receive a detailed confirmation message shortly with all the important details!`;

      // Send initial acknowledgment
      await evolutionWhatsApp.sendTextMessage(action.phoneNumber, bookingMessage);
      
      // Send detailed automatic confirmation
      setTimeout(async () => {
        await sendBookingConfirmation(action.phoneNumber, {
          bookingId: `BK-${booking.id.slice(0, 8).toUpperCase()}`,
          service: action.parameters.service,
          dateTime: action.parameters.dateTime,
          customerName: action.phoneNumber // Could be improved to get actual customer name
        });
      }, 2000); // Delay slightly to ensure order

      return {
        success: true,
        message: 'Booking confirmed'
      };
    } catch (error) {
      console.error('Error handling booking request:', error);
      return {
        success: false,
        error: 'Could not create booking'
      };
    }
  }

  /**
   * Handle payment information request
   */
  private async handlePaymentInfoRequest(action: BusinessAction): Promise<{
    success: boolean;
    message?: string;
    error?: string;
  }> {
    try {
      const paymentMessage = `💳 *Payment Information*\n\n` +
        `*Accepted Methods:*\n` +
        `• Selcom (via WhatsApp)\n` +
        `• Mobile Money (M-Pesa, Tigo Pesa, Airtel Money)\n` +
        `• Bank Transfer\n` +
        `• Cash on Delivery\n\n` +
        `*Mobile Money Instructions:*\n` +
        `1. Open your mobile money app\n` +
        `2. Select "Pay Bills" or "Merchant"\n` +
        `3. Enter our business number: QM-BEAUTY\n` +
        `4. Enter amount and PIN\n\n` +
        `For payment assistance, call: +255 657 120 151`;

      await evolutionWhatsApp.sendTextMessage(action.phoneNumber, paymentMessage);

      return {
        success: true,
        message: 'Payment info sent'
      };
    } catch (error) {
      console.error('Error handling payment info request:', error);
      return {
        success: false,
        error: 'Could not send payment information'
      };
    }
  }

  /**
   * Handle complaint
   */
  private async handleComplaint(action: BusinessAction): Promise<{
    success: boolean;
    message?: string;
    error?: string;
  }> {
    try {
      // Log complaint in database
      await prisma.activityLog.create({
        data: {
          entityType: 'complaint',
          entityId: action.phoneNumber,
          action: 'created',
          description: action.messageContent,
          metadata: `{"phoneNumber": "${action.phoneNumber}", "timestamp": "${new Date().toISOString()}"}`
        }
      });

      const complaintMessage = `📝 *Complaint Received*\n\n` +
        `We have received your complaint and our team will review it promptly.\n\n` +
        `*Your complaint*: "${action.messageContent}"\n\n` +
        `We value your feedback and will work to resolve this issue.\n\n` +
        `For urgent matters, please call: +255 657 120 151`;

      await evolutionWhatsApp.sendTextMessage(action.phoneNumber, complaintMessage);

      return {
        success: true,
        message: 'Complaint logged'
      };
    } catch (error) {
      console.error('Error handling complaint:', error);
      return {
        success: false,
        error: 'Could not log complaint'
      };
    }
  }

  /**
   * Handle feedback
   */
  private async handleFeedback(action: BusinessAction): Promise<{
    success: boolean;
    message?: string;
    error?: string;
  }> {
    try {
      // Log feedback in database
      await prisma.activityLog.create({
        data: {
          entityType: 'feedback',
          entityId: action.phoneNumber,
          action: 'submitted',
          description: action.messageContent,
          metadata: `{"phoneNumber": "${action.phoneNumber}"}`
        }
      });

      const feedbackMessage = `💕 *Feedback Received*\n\n` +
        `Thank you for your valuable feedback!\n\n` +
        `*Your feedback*: "${action.messageContent}"\n\n` +
        `Your opinion helps us improve our services.\n\n` +
        `QM Beauty Team`;

      await evolutionWhatsApp.sendTextMessage(action.phoneNumber, feedbackMessage);

      return {
        success: true,
        message: 'Feedback received'
      };
    } catch (error) {
      console.error('Error handling feedback:', error);
      return {
        success: false,
        error: 'Could not log feedback'
      };
    }
  }

  /**
   * Extract date/time from message text
   */
  private extractDateTime(message: string): string | null {
    // Simple implementation - in reality, you'd want a more sophisticated parser
    const datePatterns = [
      /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/, // DD/MM/YYYY or MM/DD/YYYY
      /(\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2})/    // YYYY-MM-DD
    ];

    for (const pattern of datePatterns) {
      const match = message.match(pattern);
      if (match) {
        try {
          const date = new Date(match[1]);
          if (!isNaN(date.getTime())) {
            return date.toISOString();
          }
        } catch (e) {
          continue;
        }
      }
    }

    // Look for relative dates
    if (message.includes('tomorrow')) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      return tomorrow.toISOString();
    }

    if (message.includes('next week')) {
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);
      return nextWeek.toISOString();
    }

    return null;
  }

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
   * Handle automatic booking confirmation
   */
  private async handleAutoBookingConfirmation(action: BusinessAction): Promise<{
    success: boolean;
    message?: string;
    error?: string;
  }> {
    try {
      const { bookingId, service, dateTime, customerName } = action.parameters || {};
      
      const confirmationMessage = `✅ *Booking Confirmation*

` +
        `Dear ${customerName || 'Valued Customer'},

` +
        `Your booking has been confirmed! 🎉

` +
        `*Service*: ${service}
` +
        `*Date & Time*: ${new Date(dateTime).toLocaleString('en-US')}
` +
        `*Booking ID*: ${bookingId}

` +
        `📍 *Location*
` +
        `59 Ali Hassan Mwinyi Road
` +
        `Oysterbay, Dar es Salaam

` +
        `💡 *Important Information*
` +
        `• Arrive 10 minutes early
` +
        `• Bring this confirmation message
` +
        `• Deposit of TZS 10,000/= is required

` +
        `For any changes or questions, reply with your booking ID or call +255 657 120 151

` +
        `We look forward to serving you! 💆‍♀️`;

      await evolutionWhatsApp.sendTextMessage(action.phoneNumber, confirmationMessage);
      
      logger.info('Automatic booking confirmation sent', { 
        phoneNumber: action.phoneNumber, 
        bookingId 
      });
      
      return {
        success: true,
        message: 'Booking confirmation sent'
      };
    } catch (error) {
      console.error('Error sending booking confirmation:', error);
      logger.error('Booking confirmation error', { error });
      return {
        success: false,
        error: 'Could not send booking confirmation'
      };
    }
  }

  /**
   * Handle cart follow-up message
   */
  private async handleCartFollowUp(action: BusinessAction): Promise<{
    success: boolean;
    message?: string;
    error?: string;
  }> {
    try {
      const { cartId, items, totalAmount, customerName } = action.parameters || {};
      
      // Format items list
      const itemsList = items?.map((item: any) => 
        `• ${item.name} x${item.quantity} - TZS ${(item.subtotal || item.price * item.quantity).toLocaleString()}/=`
      ).join('\n') || 'No items found';
      
      const followUpMessage = `🛒 *Your Shopping Cart*

` +
        `Hi ${customerName || 'there'}! 👋

` +
        `We noticed you have items in your cart that haven't been checked out yet:

` +
        `${itemsList}

` +
        `*Total*: TZS ${totalAmount?.toLocaleString() || '0'}/=

` +
        `🎁 *Special Offer*
` +
        `Complete your purchase now and get free delivery on orders over TZS 50,000/=

` +
        `🛒 *Checkout Options*
` +
        `1. Reply "CHECKOUT" to proceed
` +
        `2. Visit: qmbeauty.co.tz/shop
` +
        `3. Call: +255 657 120 151

` +
        `⏰ *Hurry!* Items in your cart are reserved for 24 hours only.

` +
        `Need help? Just ask! We're here to assist you. 💁‍♀️`;

      await evolutionWhatsApp.sendTextMessage(action.phoneNumber, followUpMessage);
      
      logger.info('Cart follow-up message sent', { 
        phoneNumber: action.phoneNumber, 
        cartId 
      });
      
      return {
        success: true,
        message: 'Cart follow-up sent'
      };
    } catch (error) {
      console.error('Error sending cart follow-up:', error);
      logger.error('Cart follow-up error', { error });
      return {
        success: false,
        error: 'Could not send cart follow-up message'
      };
    }
  }
}

// Export singleton instance
export const whatsappBusinessActions = new WhatsAppBusinessActions();

// Export class for testing
export { WhatsAppBusinessActions };

// Helper functions for triggering automated messages

/**
 * Send automatic booking confirmation
 */
export async function sendBookingConfirmation(
  phoneNumber: string,
  bookingDetails: {
    bookingId: string;
    service: string;
    dateTime: string | Date;
    customerName?: string;
  }
) {
  const action: BusinessAction = {
    action: 'auto_booking_confirm',
    phoneNumber,
    parameters: {
      bookingId: bookingDetails.bookingId,
      service: bookingDetails.service,
      dateTime: typeof bookingDetails.dateTime === 'string' 
        ? bookingDetails.dateTime 
        : bookingDetails.dateTime.toISOString(),
      customerName: bookingDetails.customerName
    },
    messageContent: 'Automatic booking confirmation'
  };
  
  return await whatsappBusinessActions.executeAction(action);
}

/**
 * Send cart follow-up message
 */
export async function sendCartFollowUp(
  phoneNumber: string,
  cartDetails: {
    cartId: string;
    items: Array<{
      name: string;
      quantity: number;
      price: number;
      subtotal?: number;
    }>;
    totalAmount: number;
    customerName?: string;
  }
) {
  const action: BusinessAction = {
    action: 'cart_followup',
    phoneNumber,
    parameters: {
      cartId: cartDetails.cartId,
      items: cartDetails.items,
      totalAmount: cartDetails.totalAmount,
      customerName: cartDetails.customerName
    },
    messageContent: 'Cart follow-up reminder'
  };
  
  return await whatsappBusinessActions.executeAction(action);
}

/**
 * Schedule automated messages
 */
export async function scheduleAutomatedMessages() {
  // This would typically be called by a cron job or background task
  // Check for bookings that need confirmation messages
  // Check for abandoned carts that need follow-up
  
  try {
    // Example: Find bookings from last 24 hours that haven't sent confirmation
    // Example: Find carts older than 2 hours with items that haven't sent follow-up
    
    logger.info('Scheduled automated messages check completed');
    return { success: true };
  } catch (error) {
    logger.error('Error in scheduled automated messages', { error });
    return { success: false, error: 'Scheduling failed' };
  }
}