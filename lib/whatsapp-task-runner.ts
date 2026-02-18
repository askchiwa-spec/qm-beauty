// WhatsApp Task Runner
// Runs background tasks for WhatsApp automation with Venom Bot

import { whatsappBusinessActions } from './whatsapp-business-actions';
import { runCartFollowUpTask } from './whatsapp-cart-followup';
import { logger } from './logging';

class WhatsAppTaskRunner {
  private isRunning: boolean = false;
  private intervalId: NodeJS.Timeout | null = null;
  
  /**
   * Start background tasks
   */
  start(): void {
    if (this.isRunning) {
      logger.warn('WhatsApp Task Runner already running');
      return;
    }
    
    this.isRunning = true;
    logger.info('Starting WhatsApp Task Runner...');
    
    // Run cart follow-up task every 30 minutes
    this.intervalId = setInterval(async () => {
      try {
        await this.runBackgroundTasks();
      } catch (error: any) {
        logger.error('Error in WhatsApp background tasks:', { error: error.message || error });
      }
    }, 30 * 60 * 1000); // Every 30 minutes
    
    logger.info('WhatsApp Task Runner started');
  }
  
  /**
   * Stop background tasks
   */
  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
    logger.info('WhatsApp Task Runner stopped');
  }
  
  /**
   * Run background tasks
   */
  async runBackgroundTasks(): Promise<void> {
    logger.info('Running WhatsApp background tasks...');
    
    // Run cart follow-up checks
    try {
      await runCartFollowUpTask();
    } catch (error: any) {
      logger.error('Error running cart follow-up task:', { error: error.message || error });
    }
    
    // Add other background tasks here as needed
    
    logger.info('WhatsApp background tasks completed');
  }
  
  /**
   * Check if the task runner is currently running
   */
  isTaskRunnerRunning(): boolean {
    return this.isRunning;
  }
}

// Export singleton instance
export const whatsappTaskRunner = new WhatsAppTaskRunner();

// Initialize on module load
if (typeof window === 'undefined') { // Only run on server-side
  // Don't auto-start to avoid issues in Next.js environment
  // The task runner should be started explicitly when needed
}

export { WhatsAppTaskRunner };