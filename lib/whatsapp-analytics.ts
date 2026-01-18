// WhatsApp Analytics and Tracking System
// Tracks message delivery, engagement, and provides analytics

interface MessageTracking {
  id: string;
  messageId?: string; // Evolution API message ID
  phoneNumber: string;
  messageContent: string;
  messageType: 'text' | 'media' | 'location' | 'contact';
  status: 'sent' | 'delivered' | 'read' | 'failed' | 'error';
  statusReason?: string;
  sentAt: Date;
  deliveredAt?: Date;
  readAt?: Date;
  attempts: number;
  lastAttemptAt: Date;
  responseReceived?: boolean;
  responseContent?: string;
  responseReceivedAt?: Date;
}

interface EngagementMetrics {
  totalMessagesSent: number;
  deliveryRate: number;
  readRate: number;
  responseRate: number;
  averageResponseTime: number; // in minutes
  failureRate: number;
  peakActivityHours: number[]; // hours with most activity
  customerEngagementScore: number;
}

class WhatsAppAnalytics {
  private trackedMessages: Map<string, MessageTracking> = new Map();
  private analyticsEnabled: boolean;

  constructor() {
    this.analyticsEnabled = process.env.WHATSAPP_ANALYTICS_ENABLED === 'true';
    if (this.analyticsEnabled) {
      console.log('WhatsApp Analytics enabled');
    } else {
      console.log('WhatsApp Analytics disabled - set WHATSAPP_ANALYTICS_ENABLED=true to enable');
    }
  }

  /**
   * Track a new message
   */
  async trackMessage(
    messageId: string | undefined,
    phoneNumber: string,
    messageContent: string,
    messageType: MessageTracking['messageType'] = 'text'
  ): Promise<string> {
    if (!this.analyticsEnabled) {
      return messageId || `local_${Date.now()}`;
    }

    const trackingId = `track_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const tracking: MessageTracking = {
      id: trackingId,
      messageId,
      phoneNumber,
      messageContent,
      messageType,
      status: 'sent',
      sentAt: new Date(),
      lastAttemptAt: new Date(),
      attempts: 1
    };

    this.trackedMessages.set(trackingId, tracking);
    
    // Log to database in background
    this.logToDatabase(tracking).catch(err => {
      console.error('Error logging message to database:', err);
    });

    return trackingId;
  }

  /**
   * Update message status
   */
  async updateMessageStatus(
    trackingId: string,
    status: MessageTracking['status'],
    reason?: string
  ): Promise<boolean> {
    if (!this.analyticsEnabled) {
      return false;
    }

    const tracking = this.trackedMessages.get(trackingId);
    if (!tracking) {
      return false;
    }

    tracking.status = status;
    tracking.statusReason = reason;
    tracking.lastAttemptAt = new Date();

    switch (status) {
      case 'delivered':
        tracking.deliveredAt = new Date();
        break;
      case 'read':
        tracking.readAt = new Date();
        break;
      case 'failed':
      case 'error':
        tracking.attempts++;
        break;
    }

    // Update in database
    this.updateInDatabase(trackingId, {
      status,
      statusReason: reason,
      deliveredAt: tracking.deliveredAt,
      readAt: tracking.readAt,
      attempts: tracking.attempts,
      lastAttemptAt: tracking.lastAttemptAt
    }).catch(err => {
      console.error('Error updating message status in database:', err);
    });

    this.trackedMessages.set(trackingId, tracking);
    return true;
  }

  /**
   * Track customer response to a message
   */
  async trackResponse(
    trackingId: string,
    responseContent: string
  ): Promise<boolean> {
    if (!this.analyticsEnabled) {
      return false;
    }

    const tracking = this.trackedMessages.get(trackingId);
    if (!tracking) {
      return false;
    }

    tracking.responseReceived = true;
    tracking.responseContent = responseContent;
    tracking.responseReceivedAt = new Date();

    // Update in database
    this.updateInDatabase(trackingId, {
      responseReceived: true,
      responseContent,
      responseReceivedAt: tracking.responseReceivedAt
    }).catch(err => {
      console.error('Error updating response in database:', err);
    });

    this.trackedMessages.set(trackingId, tracking);
    return true;
  }

  /**
   * Get engagement metrics
   */
  async getEngagementMetrics(): Promise<EngagementMetrics> {
    if (!this.analyticsEnabled) {
      return this.getDefaultMetrics();
    }

    const allMessages = Array.from(this.trackedMessages.values());
    const totalMessages = allMessages.length;

    if (totalMessages === 0) {
      return this.getDefaultMetrics();
    }

    const deliveredMessages = allMessages.filter(m => m.status === 'delivered' || m.status === 'read').length;
    const readMessages = allMessages.filter(m => m.status === 'read').length;
    const respondedMessages = allMessages.filter(m => m.responseReceived).length;
    const failedMessages = allMessages.filter(m => m.status === 'failed' || m.status === 'error').length;

    // Calculate average response time
    let totalResponseTime = 0;
    let responseCount = 0;
    allMessages.forEach(m => {
      if (m.responseReceivedAt && m.sentAt) {
        const responseTimeMinutes = (m.responseReceivedAt.getTime() - m.sentAt.getTime()) / (1000 * 60);
        totalResponseTime += responseTimeMinutes;
        responseCount++;
      }
    });

    // Calculate peak activity hours
    const hourCounts: { [hour: number]: number } = {};
    allMessages.forEach(m => {
      const hour = m.sentAt.getHours();
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });

    const peakHours = Object.entries(hourCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([hour]) => parseInt(hour));

    return {
      totalMessagesSent: totalMessages,
      deliveryRate: deliveredMessages / totalMessages * 100,
      readRate: readMessages / totalMessages * 100,
      responseRate: respondedMessages / totalMessages * 100,
      averageResponseTime: responseCount > 0 ? totalResponseTime / responseCount : 0,
      failureRate: failedMessages / totalMessages * 100,
      peakActivityHours: peakHours,
      customerEngagementScore: this.calculateEngagementScore(allMessages)
    };
  }

  /**
   * Get metrics for a specific phone number
   */
  async getCustomerMetrics(phoneNumber: string): Promise<EngagementMetrics> {
    if (!this.analyticsEnabled) {
      return this.getDefaultMetrics();
    }

    const customerMessages = Array.from(this.trackedMessages.values())
      .filter(m => m.phoneNumber === phoneNumber);

    const totalMessages = customerMessages.length;

    if (totalMessages === 0) {
      return this.getDefaultMetrics();
    }

    const deliveredMessages = customerMessages.filter(m => m.status === 'delivered' || m.status === 'read').length;
    const readMessages = customerMessages.filter(m => m.status === 'read').length;
    const respondedMessages = customerMessages.filter(m => m.responseReceived).length;
    const failedMessages = customerMessages.filter(m => m.status === 'failed' || m.status === 'error').length;

    // Calculate average response time
    let totalResponseTime = 0;
    let responseCount = 0;
    customerMessages.forEach(m => {
      if (m.responseReceivedAt && m.sentAt) {
        const responseTimeMinutes = (m.responseReceivedAt.getTime() - m.sentAt.getTime()) / (1000 * 60);
        totalResponseTime += responseTimeMinutes;
        responseCount++;
      }
    });

    return {
      totalMessagesSent: totalMessages,
      deliveryRate: deliveredMessages / totalMessages * 100,
      readRate: readMessages / totalMessages * 100,
      responseRate: respondedMessages / totalMessages * 100,
      averageResponseTime: responseCount > 0 ? totalResponseTime / responseCount : 0,
      failureRate: failedMessages / totalMessages * 100,
      peakActivityHours: [], // Could calculate per customer if needed
      customerEngagementScore: this.calculateEngagementScore(customerMessages)
    };
  }

  /**
   * Get message tracking by ID
   */
  getMessageTracking(trackingId: string): MessageTracking | undefined {
    return this.trackedMessages.get(trackingId);
  }

  /**
   * Calculate engagement score based on various factors
   */
  private calculateEngagementScore(messages: MessageTracking[]): number {
    if (messages.length === 0) {
      return 0;
    }

    // Factors: response rate (40%), read rate (30%), delivery rate (20%), frequency (10%)
    const responseRate = messages.filter(m => m.responseReceived).length / messages.length;
    const readRate = messages.filter(m => m.status === 'read').length / messages.length;
    const deliveryRate = messages.filter(m => m.status === 'delivered' || m.status === 'read').length / messages.length;
    
    // Frequency factor: how often they engage
    const engagementFrequency = responseRate > 0.5 ? 1 : responseRate > 0.2 ? 0.7 : responseRate > 0.1 ? 0.4 : 0.1;

    return (
      responseRate * 40 +
      readRate * 30 +
      deliveryRate * 20 +
      engagementFrequency * 10
    );
  }

  /**
   * Get default metrics when analytics is disabled
   */
  private getDefaultMetrics(): EngagementMetrics {
    return {
      totalMessagesSent: 0,
      deliveryRate: 0,
      readRate: 0,
      responseRate: 0,
      averageResponseTime: 0,
      failureRate: 0,
      peakActivityHours: [],
      customerEngagementScore: 0
    };
  }

  /**
   * Log message to database (simulated - would use Prisma in real implementation)
   */
  private async logToDatabase(tracking: MessageTracking): Promise<void> {
    // In a real implementation, this would save to the database
    // using Prisma or another ORM
    console.log(`Analytics: Logging message ${tracking.id} to database`);
    
    // Simulate database save
    try {
      // This is where you'd use Prisma to save the tracking data
      // await prisma.whatsAppMessage.create({
      //   data: {
      //     id: tracking.id,
      //     messageId: tracking.messageId,
      //     phoneNumber: tracking.phoneNumber,
      //     messageContent: tracking.messageContent,
      //     messageType: tracking.messageType,
      //     status: tracking.status,
      //     sentAt: tracking.sentAt,
      //     deliveredAt: tracking.deliveredAt,
      //     readAt: tracking.readAt,
      //     attempts: tracking.attempts,
      //     lastAttemptAt: tracking.lastAttemptAt,
      //     responseReceived: tracking.responseReceived || false,
      //     responseContent: tracking.responseContent,
      //     responseReceivedAt: tracking.responseReceivedAt
      //   }
      // });
    } catch (error) {
      console.error('Database logging error:', error);
    }
  }

  /**
   * Update message in database
   */
  private async updateInDatabase(
    trackingId: string,
    updates: Partial<MessageTracking>
  ): Promise<void> {
    // In a real implementation, this would update the database record
    console.log(`Analytics: Updating message ${trackingId} in database`);
    
    // Simulate database update
    try {
      // This is where you'd use Prisma to update the tracking data
      // await prisma.whatsAppMessage.update({
      //   where: { id: trackingId },
      //   data: updates
      // });
    } catch (error) {
      console.error('Database update error:', error);
    }
  }
}

// Export singleton instance
export const whatsappAnalytics = new WhatsAppAnalytics();

// Export class for testing
export { WhatsAppAnalytics };