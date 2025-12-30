// WhatsApp Business Cloud API Client
// Optimized for Tanzania market

interface WhatsAppMessage {
  to: string;
  type: 'text' | 'template';
  text?: {
    body: string;
  };
  template?: {
    name: string;
    language: {
      code: string;
    };
    components?: any[];
  };
}

interface WhatsAppResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

class WhatsAppClient {
  private accessToken: string;
  private phoneNumberId: string;
  private baseUrl: string = 'https://graph.facebook.com/v18.0';

  constructor() {
    this.accessToken = process.env.WHATSAPP_ACCESS_TOKEN || '';
    this.phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID || '';

    if (!this.accessToken || !this.phoneNumberId) {
      console.warn('WhatsApp credentials not configured. Please set WHATSAPP_ACCESS_TOKEN and WHATSAPP_PHONE_NUMBER_ID');
    }
  }

  /**
   * Send a text message via WhatsApp
   */
  async sendTextMessage(to: string, message: string): Promise<WhatsAppResponse> {
    try {
      const payload: WhatsAppMessage = {
        to: this.formatPhoneNumber(to),
        type: 'text',
        text: {
          body: message,
        },
      };

      const response = await fetch(`${this.baseUrl}/${this.phoneNumberId}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('WhatsApp API Error:', data);
        return {
          success: false,
          error: data.error?.message || 'Failed to send WhatsApp message',
        };
      }

      return {
        success: true,
        messageId: data.messages?.[0]?.id,
      };
    } catch (error: any) {
      console.error('WhatsApp Send Error:', error);
      return {
        success: false,
        error: error.message || 'An error occurred while sending WhatsApp message',
      };
    }
  }

  /**
   * Send a template message (for pre-approved templates)
   */
  async sendTemplateMessage(to: string, templateName: string, components?: any[]): Promise<WhatsAppResponse> {
    try {
      const payload: WhatsAppMessage = {
        to: this.formatPhoneNumber(to),
        type: 'template',
        template: {
          name: templateName,
          language: {
            code: 'en', // or 'sw' for Swahili
          },
          components: components || [],
        },
      };

      const response = await fetch(`${this.baseUrl}/${this.phoneNumberId}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('WhatsApp API Error:', data);
        return {
          success: false,
          error: data.error?.message || 'Failed to send WhatsApp template',
        };
      }

      return {
        success: true,
        messageId: data.messages?.[0]?.id,
      };
    } catch (error: any) {
      console.error('WhatsApp Template Error:', error);
      return {
        success: false,
        error: error.message || 'An error occurred while sending template',
      };
    }
  }

  /**
   * Format phone number for Tanzania
   * Accepts: 0715727085, 715727085, +255715727085
   * Returns: +255715727085
   */
  private formatPhoneNumber(phone: string): string {
    // Remove all spaces and dashes
    let cleaned = phone.replace(/[\s-]/g, '');

    // If starts with 0, replace with +255
    if (cleaned.startsWith('0')) {
      cleaned = '+255' + cleaned.substring(1);
    }
    // If doesn't start with +, add +255
    else if (!cleaned.startsWith('+')) {
      cleaned = '+255' + cleaned;
    }

    return cleaned;
  }

  /**
   * Validate WhatsApp configuration
   */
  isConfigured(): boolean {
    return Boolean(this.accessToken && this.phoneNumberId);
  }
}

// Export singleton instance
export const whatsappClient = new WhatsAppClient();

// Export for testing/mocking
export { WhatsAppClient };
