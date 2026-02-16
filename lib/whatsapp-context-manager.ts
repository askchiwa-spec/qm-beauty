// WhatsApp Conversation Context Manager
// Manages conversation state for multi-turn interactions

interface ConversationContext {
  phoneNumber: string;
  lastMessage: string;
  lastMessageTime: Date;
  contextState: string; // 'idle', 'ordering', 'booking', 'checking_out', etc.
  cartItems?: Array<{
    productId: string;
    name: string;
    quantity: number;
    price: number;
  }>;
  bookingDetails?: {
    service: string;
    dateTime: string;
    status: string;
  };
  tempData?: any; // Temporary data for ongoing conversations
}

class WhatsAppContextManager {
  private contexts: Map<string, ConversationContext> = new Map();
  private readonly TTL_MS = 30 * 60 * 1000; // 30 minutes
  
  /**
   * Get conversation context for a phone number
   */
  getContext(phoneNumber: string): ConversationContext | null {
    const context = this.contexts.get(phoneNumber);
    
    if (!context) {
      return null;
    }
    
    // Check if context is expired
    if (Date.now() - context.lastMessageTime.getTime() > this.TTL_MS) {
      this.clearContext(phoneNumber);
      return null;
    }
    
    return context;
  }
  
  /**
   * Set conversation context for a phone number
   */
  setContext(phoneNumber: string, context: Partial<ConversationContext>): void {
    const existingContext = this.contexts.get(phoneNumber);
    
    const newContext: ConversationContext = {
      phoneNumber,
      lastMessage: context.lastMessage || existingContext?.lastMessage || '',
      lastMessageTime: context.lastMessageTime || existingContext?.lastMessageTime || new Date(),
      contextState: context.contextState || existingContext?.contextState || 'idle',
      cartItems: context.cartItems || existingContext?.cartItems || [],
      bookingDetails: context.bookingDetails || existingContext?.bookingDetails,
      tempData: context.tempData || existingContext?.tempData || {}
    };
    
    this.contexts.set(phoneNumber, newContext);
  }
  
  /**
   * Update conversation context
   */
  updateContext(phoneNumber: string, updates: Partial<ConversationContext>): void {
    const context = this.getContext(phoneNumber);
    if (context) {
      this.setContext(phoneNumber, { ...context, ...updates });
    } else {
      this.setContext(phoneNumber, updates);
    }
  }
  
  /**
   * Clear conversation context
   */
  clearContext(phoneNumber: string): void {
    this.contexts.delete(phoneNumber);
  }
  
  /**
   * Check if a conversation is in progress
   */
  isInProgress(phoneNumber: string): boolean {
    const context = this.getContext(phoneNumber);
    return context !== null && context.contextState !== 'idle';
  }
  
  /**
   * Get all active contexts (for monitoring purposes)
   */
  getActiveContexts(): ConversationContext[] {
    return Array.from(this.contexts.values()).filter(context => {
      return Date.now() - context.lastMessageTime.getTime() <= this.TTL_MS;
    });
  }
  
  /**
   * Cleanup expired contexts periodically
   */
  cleanupExpiredContexts(): void {
    const now = Date.now();
    for (const [phoneNumber, context] of this.contexts.entries()) {
      if (now - context.lastMessageTime.getTime() > this.TTL_MS) {
        this.contexts.delete(phoneNumber);
      }
    }
  }
}

// Export singleton instance
export const whatsappContextManager = new WhatsAppContextManager();

// Export class for testing
export { WhatsAppContextManager };