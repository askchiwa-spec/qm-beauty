// Unified WhatsApp Client
// Automatically uses Evolution API or Meta Business API based on configuration

import { evolutionWhatsApp } from './evolution-whatsapp';

interface UnifiedWhatsAppResponse {
  success: boolean;
  messageId?: string;
  error?: string;
  provider?: 'evolution' | 'meta' | 'none';
}

class UnifiedWhatsAppClient {
  /**
   * Send a text message using available provider
   * Priority: Evolution API → Meta Business API
   */
  async sendTextMessage(to: string, message: string): Promise<UnifiedWhatsAppResponse> {
    // Try Evolution API first if enabled
    if (evolutionWhatsApp.isEnabled()) {
      console.log('Using Evolution API for WhatsApp');
      const result = await evolutionWhatsApp.sendTextMessage(to, message);
      return {
        ...result,
        provider: 'evolution',
      };
    }

    // Fallback to Meta Business API
    // Meta Business API client has been removed
    
    // No provider configured
    console.warn('No WhatsApp provider configured');
    return {
      success: false,
      error: 'No WhatsApp provider configured. Please set up Evolution API.',
      provider: 'none',
    };
  }

  /**
   * Send a media message (Evolution API only)
   */
  async sendMediaMessage(
    to: string,
    mediaUrl: string,
    caption?: string
  ): Promise<UnifiedWhatsAppResponse> {
    if (evolutionWhatsApp.isEnabled()) {
      const result = await evolutionWhatsApp.sendMediaMessage(to, mediaUrl, caption);
      return {
        ...result,
        provider: 'evolution',
      };
    }

    return {
      success: false,
      error: 'Media messages require Evolution API',
      provider: 'none',
    };
  }

  /**
   * Send location message (Evolution API only)
   */
  async sendLocation(
    to: string,
    latitude: number,
    longitude: number,
    name?: string,
    address?: string
  ): Promise<UnifiedWhatsAppResponse> {
    if (evolutionWhatsApp.isEnabled()) {
      const result = await evolutionWhatsApp.sendLocation(to, latitude, longitude, name, address);
      return {
        ...result,
        provider: 'evolution',
      };
    }

    return {
      success: false,
      error: 'Location messages require Evolution API',
      provider: 'none',
    };
  }

  /**
   * Check which provider is active
   */
  getActiveProvider(): 'evolution' | 'meta' | 'none' {
    if (evolutionWhatsApp.isEnabled()) {
      return 'evolution';
    }
    // Meta Business API client has been removed
    // if (whatsappClient.isConfigured()) {
    //   return 'meta';
    // }
    return 'none';
  }

  /**
   * Check if any WhatsApp provider is configured
   */
  isConfigured(): boolean {
    return evolutionWhatsApp.isEnabled();
  }
}

// Export singleton instance
export const unifiedWhatsApp = new UnifiedWhatsAppClient();

// Export for testing
export { UnifiedWhatsAppClient };
