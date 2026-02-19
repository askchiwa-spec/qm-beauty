import { create, Whatsapp, Message } from 'venom-bot';
import { logger } from './logging';

let client: Whatsapp | null = null;
let isConnected = false;

export interface WhatsAppMessage {
  from: string;
  body: string;
  timestamp: number;
  isGroup: boolean;
  sender?: string;
}

export async function initializeVenomBot(): Promise<Whatsapp> {
  if (client && isConnected) {
    return client;
  }

  try {
    logger.info('Initializing Venom Bot...');

    client = await create(
      'qm-beauty-session',
      (base64Qrimg: string, asciiQR: string, attempts: number, urlCode?: string) => {
        logger.info('QR Code generated', { attempts });
        console.log('\n');
        console.log(asciiQR);
        console.log('\nScan the QR code above with your WhatsApp mobile app');
      },
      (statusSession: string, session: string) => {
        logger.info('Session status changed', { statusSession, session });
      },
      {
        headless: true,
        devtools: false,
        useChrome: false,
        debug: false,
        logQR: true,
        browserArgs: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--single-process',
          '--disable-gpu'
        ],
        puppeteerOptions: {
          args: ['--no-sandbox', '--disable-setuid-sandbox']
        }
      }
    );

    isConnected = true;
    logger.info('Venom Bot initialized successfully');

    // Set up message handler
    client.onMessage(async (message: Message) => {
      await handleIncomingMessage(message);
    });

    return client;
  } catch (error) {
    logger.error('Failed to initialize Venom Bot:', error);
    throw error;
  }
}

async function handleIncomingMessage(message: Message): Promise<void> {
  try {
    // Ignore group messages and status broadcasts
    if (message.isGroupMsg || message.from === 'status@broadcast') {
      return;
    }

    const whatsappMessage: WhatsAppMessage = {
      from: message.from.replace('@c.us', ''),
      body: message.body,
      timestamp: message.timestamp,
      isGroup: message.isGroupMsg,
      sender: message.sender?.pushname || message.sender?.shortName
    };

    logger.info('Received WhatsApp message:', whatsappMessage);

    // Process message through webhook handler
    await processMessageWithAI(whatsappMessage);
  } catch (error) {
    logger.error('Error handling message:', error);
  }
}

async function processMessageWithAI(message: WhatsAppMessage): Promise<void> {
  try {
    // Import and use the AI chatbot logic
    const { processWhatsAppMessage } = await import('./whatsapp-chatbot');
    await processWhatsAppMessage(message);
  } catch (error) {
    logger.error('Error processing message with AI:', error);
  }
}

export async function sendWhatsAppMessage(to: string, message: string): Promise<void> {
  if (!client || !isConnected) {
    throw new Error('WhatsApp client not initialized');
  }

  try {
    const formattedNumber = to.includes('@c.us') ? to : `${to}@c.us`;
    await client.sendText(formattedNumber, message);
    logger.info(`Message sent to ${to}`);
  } catch (error) {
    logger.error(`Failed to send message to ${to}:`, error);
    throw error;
  }
}

export async function sendWhatsAppMedia(
  to: string,
  mediaPath: string,
  caption?: string
): Promise<void> {
  if (!client || !isConnected) {
    throw new Error('WhatsApp client not initialized');
  }

  try {
    const formattedNumber = to.includes('@c.us') ? to : `${to}@c.us`;
    await client.sendFile(formattedNumber, mediaPath, '', caption || '');
    logger.info(`Media sent to ${to}`);
  } catch (error) {
    logger.error(`Failed to send media to ${to}:`, error);
    throw error;
  }
}

export function getConnectionStatus(): boolean {
  return isConnected;
}

export async function disconnectVenomBot(): Promise<void> {
  if (client) {
    await client.close();
    client = null;
    isConnected = false;
    logger.info('Venom Bot disconnected');
  }
}
