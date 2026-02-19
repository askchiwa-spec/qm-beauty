import { logger } from './logging';

// Mock implementation - venom-bot removed from dependencies
// WhatsApp functionality is handled by whatsapp-web.js on the VPS

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let client: any = null;
let isConnected = false;

export interface WhatsAppMessage {
  from: string;
  body: string;
  timestamp: number;
  isGroup: boolean;
  sender?: string;
}

export async function initializeVenomBot(): Promise<unknown> {
  logger.info('Venom Bot is disabled - using whatsapp-web.js on VPS instead');
  isConnected = false;
  return null;
}

// Mock functions - WhatsApp functionality is handled by whatsapp-web.js on VPS

export async function sendWhatsAppMessage(to: string, message: string): Promise<void> {
  logger.info(`[MOCK] Would send message to ${to}: ${message.substring(0, 50)}...`);
  // WhatsApp functionality is handled by whatsapp-web.js on the VPS
}

export async function sendWhatsAppMedia(
  to: string,
  mediaPath: string,
  caption?: string
): Promise<void> {
  logger.info(`[MOCK] Would send media to ${to}: ${mediaPath}`);
  // WhatsApp functionality is handled by whatsapp-web.js on the VPS
}

export function getConnectionStatus(): boolean {
  return false; // Always return false - using whatsapp-web.js on VPS instead
}

export async function disconnectVenomBot(): Promise<void> {
  logger.info('[MOCK] Disconnect called');
  client = null;
  isConnected = false;
}
