// WhatsApp Message Queue Manager
// Handles message queuing, scheduling, and retry logic for Evolution API

interface QueuedMessage {
  id: string;
  to: string;
  message: string;
  type: 'text' | 'media' | 'location';
  mediaUrl?: string;
  caption?: string;
  priority: 'high' | 'normal' | 'low';
  scheduledTime?: Date;
  maxRetries: number;
  currentRetry: number;
  createdAt: Date;
  status: 'queued' | 'processing' | 'sent' | 'failed' | 'cancelled';
  failureReason?: string;
}

interface MessageQueueStats {
  totalQueued: number;
  processing: number;
  sent: number;
  failed: number;
  averageWaitTime: number;
  averageProcessTime: number;
}

class WhatsAppQueueManager {
  private queue: QueuedMessage[] = [];
  private processingQueue: boolean = false;
  private stats: MessageQueueStats = {
    totalQueued: 0,
    processing: 0,
    sent: 0,
    failed: 0,
    averageWaitTime: 0,
    averageProcessTime: 0
  };

  constructor() {
    // Start processing queue automatically
    this.startProcessing();
  }

  /**
   * Add a message to the queue
   */
  enqueueMessage(
    to: string,
    message: string,
    options: {
      type?: 'text' | 'media' | 'location';
      mediaUrl?: string;
      caption?: string;
      priority?: 'high' | 'normal' | 'low';
      scheduledTime?: Date;
      maxRetries?: number;
    } = {}
  ): string {
    const id = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const queuedMessage: QueuedMessage = {
      id,
      to,
      message,
      type: options.type || 'text',
      mediaUrl: options.mediaUrl,
      caption: options.caption,
      priority: options.priority || 'normal',
      scheduledTime: options.scheduledTime,
      maxRetries: options.maxRetries !== undefined ? options.maxRetries : 3,
      currentRetry: 0,
      createdAt: new Date(),
      status: 'queued'
    };

    this.queue.push(queuedMessage);
    this.stats.totalQueued++;

    // Sort queue by priority and scheduled time
    this.sortQueue();

    console.log(`Message queued: ${id} for ${to}`);
    return id;
  }

  /**
   * Process the message queue
   */
  private async processQueue(): Promise<void> {
    if (this.processingQueue || this.queue.length === 0) {
      return;
    }

    this.processingQueue = true;

    // Get next message to process (respecting priority and scheduling)
    const now = new Date();
    const nextMessage = this.queue.find(msg => 
      msg.status === 'queued' && 
      (!msg.scheduledTime || msg.scheduledTime <= now)
    );

    if (nextMessage) {
      // Mark as processing
      nextMessage.status = 'processing';
      this.stats.processing++;

      try {
        // Attempt to send the message
        const success = await this.sendMessage(nextMessage);
        
        if (success) {
          // Mark as sent
          nextMessage.status = 'sent';
          this.stats.sent++;
          console.log(`Message sent successfully: ${nextMessage.id}`);
        } else {
          // Handle failure with retry logic
          await this.handleSendFailure(nextMessage);
        }
      } catch (error) {
        console.error(`Error processing message ${nextMessage.id}:`, error);
        await this.handleSendFailure(nextMessage);
      } finally {
        // Remove processed message from queue
        this.queue = this.queue.filter(msg => msg.id !== nextMessage.id);
        this.stats.processing--;
      }
    }

    this.processingQueue = false;
  }

  /**
   * Send a single message using the Evolution API
   */
  private async sendMessage(message: QueuedMessage): Promise<boolean> {
    try {
      // Import the evolution WhatsApp client
      const { evolutionWhatsApp } = await import('./evolution-whatsapp');
      
      if (!evolutionWhatsApp.isEnabled()) {
        throw new Error('Evolution API not enabled');
      }

      let result;
      if (message.type === 'media' && message.mediaUrl) {
        result = await evolutionWhatsApp.sendMediaMessage(
          message.to,
          message.mediaUrl,
          message.caption
        );
      } else if (message.type === 'location') {
        // For location messages, we'd need coordinates
        // This is a simplified version - would need to parse location from message
        throw new Error('Location message type not fully implemented');
      } else {
        result = await evolutionWhatsApp.sendTextMessage(
          message.to,
          message.message
        );
      }

      return result.success;
    } catch (error) {
      console.error(`Failed to send message ${message.id}:`, error);
      return false;
    }
  }

  /**
   * Handle message send failure with retry logic
   */
  private async handleSendFailure(message: QueuedMessage): Promise<void> {
    message.currentRetry++;
    
    if (message.currentRetry <= message.maxRetries) {
      // Calculate delay using exponential backoff
      const delay = Math.pow(2, message.currentRetry) * 1000; // 2^retry * 1000ms
      
      // Reschedule with delay
      message.scheduledTime = new Date(Date.now() + delay);
      message.status = 'queued';
      
      console.log(`Message ${message.id} scheduled for retry #${message.currentRetry} in ${delay}ms`);
    } else {
      // Max retries reached, mark as failed
      message.status = 'failed';
      message.failureReason = `Max retries (${message.maxRetries}) exceeded`;
      this.stats.failed++;
      
      console.error(`Message ${message.id} failed after ${message.maxRetries} retries`);
    }
  }

  /**
   * Start processing the queue at regular intervals
   */
  private startProcessing(): void {
    // Process queue every 2 seconds
    setInterval(() => {
      this.processQueue();
    }, 2000);
  }

  /**
   * Sort queue by priority and scheduled time
   */
  private sortQueue(): void {
    this.queue.sort((a, b) => {
      // High priority first
      const priorityOrder = { high: 3, normal: 2, low: 1 };
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      }
      
      // Earlier scheduled time first
      if (a.scheduledTime && b.scheduledTime) {
        return a.scheduledTime.getTime() - b.scheduledTime.getTime();
      }
      
      // If one is scheduled and the other isn't, prioritize the one that's ready
      if (a.scheduledTime && !b.scheduledTime) {
        return a.scheduledTime > new Date() ? 1 : -1;
      }
      if (!a.scheduledTime && b.scheduledTime) {
        return b.scheduledTime > new Date() ? -1 : 1;
      }
      
      // Otherwise, sort by creation time (older first)
      return a.createdAt.getTime() - b.createdAt.getTime();
    });
  }

  /**
   * Get queue statistics
   */
  getStats(): MessageQueueStats {
    return { ...this.stats };
  }

  /**
   * Get current queue status
   */
  getQueueStatus(): { pending: number; processing: number; queue: QueuedMessage[] } {
    return {
      pending: this.queue.filter(msg => msg.status === 'queued').length,
      processing: this.stats.processing,
      queue: this.queue
    };
  }

  /**
   * Cancel a message in the queue
   */
  cancelMessage(messageId: string): boolean {
    const index = this.queue.findIndex(msg => msg.id === messageId);
    if (index !== -1) {
      this.queue[index].status = 'cancelled';
      return true;
    }
    return false;
  }
}

// Export singleton instance
export const whatsappQueueManager = new WhatsAppQueueManager();

// Export class for testing
export { WhatsAppQueueManager };