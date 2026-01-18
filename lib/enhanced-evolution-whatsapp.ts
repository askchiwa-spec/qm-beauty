// Enhanced Evolution API WhatsApp Client
// Self-hosted WhatsApp solution for Tanzania market with advanced features
// Docs: https://doc.evolution-api.com

interface EvolutionMessage {
  number: string;
  text?: string;
  mediaUrl?: string;
  caption?: string;
  options?: {
    delay?: number; // Delay in milliseconds before sending
    scheduleTime?: Date; // Scheduled time for sending
  };
}

interface EvolutionResponse {
  success: boolean;
  messageId?: string;
  error?: string;
  data?: any;
  provider?: string;
}

interface EvolutionInstanceStatus {
  instance: {
    instanceName: string;
    status: string;
    state: string;
  };
  qrcode?: {
    code: string;
    base64: string;
  };
}

interface WhatsAppMetrics {
  messagesSent: number;
  messagesDelivered: number;
  messagesRead: number;
  avgResponseTime: number;
  successRate: number;
}

class EnhancedEvolutionWhatsAppClient {
  private apiUrl: string;
  private apiKey: string;
  private instanceName: string;
  private enabled: boolean;
  private messageQueue: EvolutionMessage[] = [];
  private isProcessingQueue: boolean = false;
  private metrics: WhatsAppMetrics = {
    messagesSent: 0,
    messagesDelivered: 0,
    messagesRead: 0,
    avgResponseTime: 0,
    successRate: 0,
  };

  constructor() {
    this.apiUrl = process.env.EVOLUTION_API_URL || 'http://localhost:8080';
    this.apiKey = process.env.EVOLUTION_API_KEY || '';
    this.instanceName = process.env.EVOLUTION_INSTANCE_NAME || 'qm-beauty';
    this.enabled = process.env.USE_EVOLUTION_API === 'true';

    if (this.enabled && !this.apiKey) {
      console.warn('Evolution API enabled but API key not configured');
    }

    // Initialize message queue processing
    this.startQueueProcessor();
  }

  /**
   * Check if Evolution API is enabled and configured
   */
  isEnabled(): boolean {
    return this.enabled && Boolean(this.apiKey);
  }

  /**
   * Create a new WhatsApp instance
   */
  async createInstance(): Promise<EvolutionResponse> {
    try {
      const startTime = Date.now();
      const response = await fetch(`${this.apiUrl}/instance/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': this.apiKey,
        },
        body: JSON.stringify({
          instanceName: this.instanceName,
          qrcode: true,
          integration: 'WHATSAPP-BAILEYS',
          webhook: {
            url: `${process.env.BASE_URL || 'http://localhost:3000'}/api/whatsapp/webhook`,
            webhook_by_events: true,
            events: ['APPLICATION_STARTUP', 'QRCODE_UPDATED', 'MESSAGES_SET', 'MESSAGES_UPSERT', 'MESSAGES_UPDATE', 'SEND_MESSAGE_SUCCESS', 'SEND_MESSAGE_FAILED']
          }
        }),
      });

      const data = await response.json();
      const endTime = Date.now();

      // Log metrics
      this.metrics.avgResponseTime = endTime - startTime;
      this.metrics.messagesSent += 1;

      if (!response.ok) {
        console.error('Evolution API - Create Instance Error:', { error: data.message || 'Failed to create instance', response: data });
        return {
          success: false,
          error: data.message || 'Failed to create instance',
        };
      }

      console.log('Evolution API - Instance created successfully', { instance: this.instanceName });

      return {
        success: true,
        data: data,
        provider: 'evolution-api'
      };
    } catch (error: any) {
      console.error('Evolution API - Create Instance Error:', error);
      return {
        success: false,
        error: error.message,
        provider: 'evolution-api'
      };
    }
  }

  /**
   * Get instance connection status and QR code
   */
  async getInstanceStatus(): Promise<EvolutionResponse> {
    try {
      const response = await fetch(
        `${this.apiUrl}/instance/connectionState/${this.instanceName}`,
        {
          method: 'GET',
          headers: {
            'apikey': this.apiKey,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        console.error('Evolution API - Get Status Error:', { error: data.message || 'Failed to get instance status', response: data });
        return {
          success: false,
          error: data.message || 'Failed to get instance status',
        };
      }

      return {
        success: true,
        data: data,
        provider: 'evolution-api'
      };
    } catch (error: any) {
      console.error('Evolution API - Get Status Error:', error);
      return {
        success: false,
        error: error.message,
        provider: 'evolution-api'
      };
    }
  }

  /**
   * Get QR code for WhatsApp connection
   */
  async getQRCode(): Promise<EvolutionResponse> {
    try {
      const response = await fetch(
        `${this.apiUrl}/instance/connect/${this.instanceName}`,
        {
          method: 'GET',
          headers: {
            'apikey': this.apiKey,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        console.error('Evolution API - Get QR Code Error:', { error: data.message || 'Failed to get QR code', response: data });
        return {
          success: false,
          error: data.message || 'Failed to get QR code',
        };
      }

      return {
        success: true,
        data: data,
        provider: 'evolution-api'
      };
    } catch (error: any) {
      console.error('Evolution API - Get QR Code Error:', error);
      return {
        success: false,
        error: error.message,
        provider: 'evolution-api'
      };
    }
  }

  /**
   * Queue a message for sending (with optional scheduling)
   */
  queueMessage(message: EvolutionMessage): void {
    this.messageQueue.push(message);
    console.log('Message queued for sending', { number: message.number, scheduled: !!message.options?.scheduleTime });
  }

  /**
   * Process the message queue
   */
  private async processQueue(): Promise<void> {
    if (this.isProcessingQueue || this.messageQueue.length === 0) {
      return;
    }

    this.isProcessingQueue = true;

    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift();
      if (!message) continue;

      // Check if message should be sent now or later
      if (message.options?.scheduleTime && message.options.scheduleTime > new Date()) {
        // Schedule the message for later
        const delay = message.options.scheduleTime.getTime() - Date.now();
        setTimeout(async () => {
          await this.processScheduledMessage(message);
        }, delay);
      } else {
        // Send the message immediately
        await this.processScheduledMessage(message);
      }

      // Add small delay between messages to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    this.isProcessingQueue = false;
  }

  /**
   * Process a single scheduled message
   */
  private async processScheduledMessage(message: EvolutionMessage): Promise<void> {
    if (message.text) {
      await this.sendTextMessage(message.number, message.text);
    } else if (message.mediaUrl) {
      await this.sendMediaMessage(message.number, message.mediaUrl, message.caption);
    }
  }

  /**
   * Start the queue processor
   */
  private startQueueProcessor(): void {
    // Process queue every 5 seconds
    setInterval(() => {
      this.processQueue();
    }, 5000);
  }

  /**
   * Send a text message
   */
  async sendTextMessage(to: string, message: string): Promise<EvolutionResponse> {
    try {
      if (!this.isEnabled()) {
        return {
          success: false,
          error: 'Evolution API not enabled or configured',
          provider: 'none'
        };
      }

      const payload = {
        number: this.formatPhoneNumber(to),
        text: message,
      };

      const startTime = Date.now();
      const response = await fetch(
        `${this.apiUrl}/message/sendText/${this.instanceName}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': this.apiKey,
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();
      const endTime = Date.now();

      // Update metrics
      this.metrics.avgResponseTime = ((this.metrics.avgResponseTime * (this.metrics.messagesSent || 1)) + (endTime - startTime)) / (this.metrics.messagesSent + 1);
      this.metrics.messagesSent += 1;

      if (!response.ok) {
        console.error('Evolution API Error:', { error: data.message || 'Failed to send message', response: data, to: payload.number });
        return {
          success: false,
          error: data.message || 'Failed to send message',
          provider: 'evolution-api'
        };
      }

      console.log('WhatsApp message sent successfully', { to: payload.number, messageId: data.key?.id });

      return {
        success: true,
        messageId: data.key?.id,
        data: data,
        provider: 'evolution-api'
      };
    } catch (error: any) {
      console.error('Evolution API - Send Message Error:', error);
      return {
        success: false,
        error: error.message,
        provider: 'evolution-api'
      };
    }
  }

  /**
   * Send a message with media (image, document, etc.)
   */
  async sendMediaMessage(
    to: string,
    mediaUrl: string,
    caption?: string
  ): Promise<EvolutionResponse> {
    try {
      if (!this.isEnabled()) {
        return {
          success: false,
          error: 'Evolution API not enabled or configured',
          provider: 'none'
        };
      }

      const payload = {
        number: this.formatPhoneNumber(to),
        mediaUrl: mediaUrl,
        caption: caption || '',
      };

      const response = await fetch(
        `${this.apiUrl}/message/sendMedia/${this.instanceName}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': this.apiKey,
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        console.error('Evolution API - Send Media Error:', { error: data.message || 'Failed to send media', response: data, to: payload.number });
        return {
          success: false,
          error: data.message || 'Failed to send media',
          provider: 'evolution-api'
        };
      }

      console.log('WhatsApp media sent successfully', { to: payload.number, messageId: data.key?.id });

      return {
        success: true,
        messageId: data.key?.id,
        data: data,
        provider: 'evolution-api'
      };
    } catch (error: any) {
      console.error('Evolution API - Send Media Error:', error);
      return {
        success: false,
        error: error.message,
        provider: 'evolution-api'
      };
    }
  }

  /**
   * Send a location message
   */
  async sendLocation(
    to: string,
    latitude: number,
    longitude: number,
    name?: string,
    address?: string
  ): Promise<EvolutionResponse> {
    try {
      if (!this.isEnabled()) {
        return {
          success: false,
          error: 'Evolution API not enabled or configured',
          provider: 'none'
        };
      }

      const payload = {
        number: this.formatPhoneNumber(to),
        latitude,
        longitude,
        name: name || 'QM Beauty',
        address: address || '',
      };

      const response = await fetch(
        `${this.apiUrl}/message/sendLocation/${this.instanceName}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': this.apiKey,
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.message || 'Failed to send location',
          provider: 'evolution-api'
        };
      }

      return {
        success: true,
        messageId: data.key?.id,
        data: data,
        provider: 'evolution-api'
      };
    } catch (error: any) {
      console.error('Evolution API - Send Location Error:', error);
      return {
        success: false,
        error: error.message,
        provider: 'evolution-api'
      };
    }
  }

  /**
   * Send a contact card
   */
  async sendContact(
    to: string,
    contactName: string,
    contactNumber: string
  ): Promise<EvolutionResponse> {
    try {
      if (!this.isEnabled()) {
        return {
          success: false,
          error: 'Evolution API not enabled or configured',
          provider: 'none'
        };
      }

      const payload = {
        number: this.formatPhoneNumber(to),
        contact: {
          fullName: contactName,
          wuid: this.formatPhoneNumber(contactNumber),
        },
      };

      const response = await fetch(
        `${this.apiUrl}/message/sendContact/${this.instanceName}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': this.apiKey,
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.message || 'Failed to send contact',
          provider: 'evolution-api'
        };
      }

      return {
        success: true,
        messageId: data.key?.id,
        data: data,
        provider: 'evolution-api'
      };
    } catch (error: any) {
      console.error('Evolution API - Send Contact Error:', error);
      return {
        success: false,
        error: error.message,
        provider: 'evolution-api'
      };
    }
  }

  /**
   * Check if a number is registered on WhatsApp
   */
  async checkNumber(phone: string): Promise<EvolutionResponse> {
    try {
      const response = await fetch(
        `${this.apiUrl}/chat/whatsappNumbers/${this.instanceName}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': this.apiKey,
          },
          body: JSON.stringify({
            numbers: [this.formatPhoneNumber(phone)],
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.message || 'Failed to check number',
          provider: 'evolution-api'
        };
      }

      return {
        success: true,
        data: data,
        provider: 'evolution-api'
      };
    } catch (error: any) {
      console.error('Evolution API - Check Number Error:', error);
      return {
        success: false,
        error: error.message,
        provider: 'evolution-api'
      };
    }
  }

  /**
   * Get metrics for WhatsApp usage
   */
  getMetrics(): WhatsAppMetrics {
    return { ...this.metrics };
  }

  /**
   * Format phone number for Tanzania
   * Accepts: 0715727085, 715727085, +255715727085
   * Returns: 255715727085 (Evolution API format - no plus sign)
   */
  private formatPhoneNumber(phone: string): string {
    // Remove all spaces, dashes, and plus signs
    let cleaned = phone.replace(/[\s\-+]/g, '');

    // If starts with 0, replace with 255
    if (cleaned.startsWith('0')) {
      cleaned = '255' + cleaned.substring(1);
    }
    // If doesn't start with 255, add it
    else if (!cleaned.startsWith('255')) {
      cleaned = '255' + cleaned;
    }

    return cleaned;
  }

  /**
   * Logout and disconnect instance
   */
  async logoutInstance(): Promise<EvolutionResponse> {
    try {
      const response = await fetch(
        `${this.apiUrl}/instance/logout/${this.instanceName}`,
        {
          method: 'DELETE',
          headers: {
            'apikey': this.apiKey,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.message || 'Failed to logout instance',
          provider: 'evolution-api'
        };
      }

      return {
        success: true,
        data: data,
        provider: 'evolution-api'
      };
    } catch (error: any) {
      console.error('Evolution API - Logout Error:', error);
      return {
        success: false,
        error: error.message,
        provider: 'evolution-api'
      };
    }
  }

  /**
   * Delete instance completely
   */
  async deleteInstance(): Promise<EvolutionResponse> {
    try {
      const response = await fetch(
        `${this.apiUrl}/instance/delete/${this.instanceName}`,
        {
          method: 'DELETE',
          headers: {
            'apikey': this.apiKey,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.message || 'Failed to delete instance',
          provider: 'evolution-api'
        };
      }

      return {
        success: true,
        data: data,
        provider: 'evolution-api'
      };
    } catch (error: any) {
      console.error('Evolution API - Delete Instance Error:', error);
      return {
        success: false,
        error: error.message,
        provider: 'evolution-api'
      };
    }
  }
}

// Export singleton instance
export const enhancedEvolutionWhatsApp = new EnhancedEvolutionWhatsAppClient();

// Export class for testing
export { EnhancedEvolutionWhatsAppClient };