// Evolution API WhatsApp Client
// Self-hosted WhatsApp solution for Tanzania market
// Docs: https://doc.evolution-api.com

interface EvolutionMessage {
  number: string;
  text?: string;
  mediaUrl?: string;
  caption?: string;
}

interface EvolutionResponse {
  success: boolean;
  messageId?: string;
  error?: string;
  data?: any;
}

interface EvolutionInstanceStatus {
  instance: {
    instanceName: string;
    status: string;
  };
  qrcode?: {
    code: string;
    base64: string;
  };
}

class EvolutionWhatsAppClient {
  private apiUrl: string;
  private apiKey: string;
  private instanceName: string;
  private enabled: boolean;

  constructor() {
    this.apiUrl = process.env.EVOLUTION_API_URL || 'http://localhost:8080';
    this.apiKey = process.env.EVOLUTION_API_KEY || '';
    this.instanceName = process.env.EVOLUTION_INSTANCE_NAME || 'qm-beauty';
    this.enabled = process.env.USE_EVOLUTION_API === 'true';

    if (this.enabled && !this.apiKey) {
      console.warn('Evolution API enabled but API key not configured');
    }
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
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.message || 'Failed to create instance',
        };
      }

      return {
        success: true,
        data: data,
      };
    } catch (error: any) {
      console.error('Evolution API - Create Instance Error:', error);
      return {
        success: false,
        error: error.message,
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
        return {
          success: false,
          error: data.message || 'Failed to get instance status',
        };
      }

      return {
        success: true,
        data: data,
      };
    } catch (error: any) {
      console.error('Evolution API - Get Status Error:', error);
      return {
        success: false,
        error: error.message,
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
        return {
          success: false,
          error: data.message || 'Failed to get QR code',
        };
      }

      return {
        success: true,
        data: data,
      };
    } catch (error: any) {
      console.error('Evolution API - Get QR Code Error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
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
        };
      }

      const payload = {
        number: this.formatPhoneNumber(to),
        text: message,
      };

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

      if (!response.ok) {
        console.error('Evolution API Error:', data);
        return {
          success: false,
          error: data.message || 'Failed to send message',
        };
      }

      return {
        success: true,
        messageId: data.key?.id,
        data: data,
      };
    } catch (error: any) {
      console.error('Evolution API - Send Message Error:', error);
      return {
        success: false,
        error: error.message,
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
        return {
          success: false,
          error: data.message || 'Failed to send media',
        };
      }

      return {
        success: true,
        messageId: data.key?.id,
        data: data,
      };
    } catch (error: any) {
      console.error('Evolution API - Send Media Error:', error);
      return {
        success: false,
        error: error.message,
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
        };
      }

      return {
        success: true,
        messageId: data.key?.id,
        data: data,
      };
    } catch (error: any) {
      console.error('Evolution API - Send Location Error:', error);
      return {
        success: false,
        error: error.message,
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
        };
      }

      return {
        success: true,
        data: data,
      };
    } catch (error: any) {
      console.error('Evolution API - Check Number Error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
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
        };
      }

      return {
        success: true,
        data: data,
      };
    } catch (error: any) {
      console.error('Evolution API - Logout Error:', error);
      return {
        success: false,
        error: error.message,
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
        };
      }

      return {
        success: true,
        data: data,
      };
    } catch (error: any) {
      console.error('Evolution API - Delete Instance Error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }
}

// Export singleton instance
export const evolutionWhatsApp = new EvolutionWhatsAppClient();

// Export class for testing
export { EvolutionWhatsAppClient };
