import { initializeVenomBot, getConnectionStatus } from './lib/venom-whatsapp';
import { logger } from './lib/logging';

async function startWhatsAppServer() {
  try {
    logger.info('Starting QM Beauty WhatsApp Server...');
    
    await initializeVenomBot();
    
    logger.info('WhatsApp Server started successfully!');
    logger.info('Scan the QR code to connect your WhatsApp account');
    
    // Keep the process running
    process.on('SIGINT', async () => {
      logger.info('Shutting down WhatsApp Server...');
      const { disconnectVenomBot } = await import('./lib/venom-whatsapp');
      await disconnectVenomBot();
      process.exit(0);
    });
    
    process.on('SIGTERM', async () => {
      logger.info('Shutting down WhatsApp Server...');
      const { disconnectVenomBot } = await import('./lib/venom-whatsapp');
      await disconnectVenomBot();
      process.exit(0);
    });
    
  } catch (error) {
    logger.error('Failed to start WhatsApp Server:', error as Error);
    process.exit(1);
  }
}

startWhatsAppServer();
