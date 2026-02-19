import "server-only";
// Venom Bot WhatsApp Client Wrapper
// Replaces Evolution API with Venom Bot for self-hosted WhatsApp
// Docs: https://github.com/orkestral/venom

import { 
  sendWhatsAppMessage, 
  sendWhatsAppMedia, 
  getConnectionStatus 
} from './venom-whatsapp';

interface WhatsAppMessage {
  number: string;
  text?: string;
  mediaUrl?: string;
  caption?: string;
}

interface WhatsAppResponse {
  success: boolean;
  messageId?: string;
  error?: string;
  data?: any;
}

class VenomWhatsAppClient {
  private enabled: boolean;

  constructor() {
    this.enabled = process.env.WHATSAPP_ENABLED === 'true';
  }

  /**
   * Check if WhatsApp is enabled and Venom Bot is connected
   */
  isEnabled(): boolean {
    return this.enabled && getConnectionStatus();
  }

  /**
   * Create a new WhatsApp instance (no-op for Venom Bot)
   * Instance is created automatically when server starts
   */
  async createInstance(): Promise<WhatsAppResponse> {
    if (!this.enabled) {
      return {
        success: false,
        error: 'WhatsApp not enabled',
      };
    }

    return {
      success: true,
      data: { message: 'Venom Bot instance managed by whatsapp-server.ts' },
    };
  }

  /**
   * Get instance connection status
   */
  async getInstanceStatus(): Promise<WhatsAppResponse> {
    const isConnected = getConnectionStatus();
    
    return {
      success: isConnected,
      data: {
        instance: {
          instanceName: 'qm-beauty',
          status: isConnected ? 'connected' : 'disconnected',
        },
      },
    };
  }

  /**
   * Get QR code for WhatsApp connection
   * QR code is displayed in terminal/logs when server starts
   */
  async getQRCode(): Promise<WhatsAppResponse> {
    return {
      success: true,
      data: {
        message: 'QR code is displayed in the terminal when running: npm run whatsapp:start',
        instructions: 'Run "npm run whatsapp:logs" to view the QR code',
      },
    };
  }

  /**
   * Send a text message
   */
  async sendTextMessage(to: string, message: string): Promise<WhatsAppResponse> {
    try {
      if (!this.isEnabled()) {
        return {
          success: false,
          error: 'WhatsApp not enabled or Venom Bot not connected',
        };
      }

      await sendWhatsAppMessage(to, message);

      return {
        success: true,
        messageId: `venom-${Date.now()}`,
      };
    } catch (error: any) {
      console.error('Venom Bot - Send Message Error:', error);
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
  ): Promise<WhatsAppResponse> {
    try {
      if (!this.isEnabled()) {
        return {
          success: false,
          error: 'WhatsApp not enabled or Venom Bot not connected',
        };
      }

      await sendWhatsAppMedia(to, mediaUrl, caption);

      return {
        success: true,
        messageId: `venom-${Date.now()}`,
      };
    } catch (error: any) {
      console.error('Venom Bot - Send Media Error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Send a location message
   * Note: Venom Bot location sending requires different implementation
   */
  async sendLocation(
    to: string,
    latitude: number,
    longitude: number,
    name?: string,
    address?: string
  ): Promise<WhatsAppResponse> {
    try {
      if (!this.isEnabled()) {
        return {
          success: false,
          error: 'WhatsApp not enabled or Venom Bot not connected',
        };
      }

      // Send location as text message with Google Maps link
      const mapsLink = `https://www.google.com/maps?q=${latitude},${longitude}`;
      const message = `📍 ${name || 'Location'}\n${address || ''}\n\n${mapsLink}`;
      
      await sendWhatsAppMessage(to, message);

      return {
        success: true,
        messageId: `venom-${Date.now()}`,
      };
    } catch (error: any) {
      console.error('Venom Bot - Send Location Error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Check if a number is registered on WhatsApp
   * Note: Venom Bot doesn't have direct number check, returns success
   */
  async checkNumber(phone: string): Promise<WhatsAppResponse> {
    return {
      success: true,
      data: {
        exists: true,
        number: this.formatPhoneNumber(phone),
      },
    };
  }

  /**
   * Format phone number for Tanzania
   * Accepts: 0715727085, 715727085, +255715727085
   * Returns: 255715727085 (no plus sign)
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
  async logoutInstance(): Promise<WhatsAppResponse> {
    try {
      const { disconnectVenomBot } = await import('./venom-whatsapp');
      await disconnectVenomBot();
      
      return {
        success: true,
        data: { message: 'Venom Bot disconnected' },
      };
    } catch (error: any) {
      console.error('Venom Bot - Logout Error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Delete instance completely
   * For Venom Bot, this just logs out
   */
  async deleteInstance(): Promise<WhatsAppResponse> {
    return this.logoutInstance();
  }
}

// Export singleton instance (maintain same export name for compatibility)
export const evolutionWhatsApp = new VenomWhatsAppClient();

// Export class for testing
export { VenomWhatsAppClient };
