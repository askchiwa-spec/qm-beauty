// WhatsApp Cart Follow-up System
// Automatically sends reminders for abandoned carts

import { prisma } from './prisma';
import { sendCartFollowUp } from './whatsapp-business-actions';
import { logger } from './logging';

/**
 * Check for abandoned carts and send follow-up messages
 */
export async function checkAbandonedCarts() {
  try {
    logger.info('Checking for abandoned carts...');
    
    // Find carts that are:
    // - Active
    // - Have items
    // - Haven't been updated in the last 2 hours
    // - Belong to users with phone numbers
    
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
    
    const abandonedCarts = await prisma.cart.findMany({
      where: {
        status: 'active',
        updatedAt: {
          lt: twoHoursAgo
        },
        items: {
          some: {} // Has at least one item
        },
        OR: [
          {
            userId: {
              not: null
            }
          },
          {
            sessionId: {
              not: null
            }
          }
        ]
      },
      include: {
        items: {
          include: {
            product: true
          }
        },
        user: true
      },
      orderBy: {
        updatedAt: 'asc' // Process oldest first
      }
    });
    
    logger.info(`Found ${abandonedCarts.length} abandoned carts`);
    
    let sentCount = 0;
    const errors: string[] = [];
    
    // Send follow-up messages for each abandoned cart
    for (const cart of abandonedCarts) {
      try {
        // Get customer phone number
        let phoneNumber: string | null = null;
        let customerName: string | undefined;
        
        if (cart.userId && cart.user) {
          phoneNumber = cart.user.phone;
          customerName = cart.user.name || undefined;
        } else if (cart.sessionId) {
          // For guest carts, we'd need to store phone number in session or cart
          // This is a limitation - we can only follow up with registered users
          logger.info('Skipping guest cart for follow-up', { cartId: cart.id });
          continue;
        }
        
        if (!phoneNumber) {
          logger.warn('No phone number found for cart', { cartId: cart.id });
          continue;
        }
        
        // Format cart items for the message
        const items = cart.items.map((item: any) => ({
          name: item.product.name,
          quantity: item.quantity,
          price: item.product.price,
          subtotal: item.subtotal
        }));
        
        // Send cart follow-up message
        const result = await sendCartFollowUp(phoneNumber, {
          cartId: cart.id,
          items,
          totalAmount: cart.totalAmount,
          customerName
        });
        
        if (result.success) {
          sentCount++;
          logger.info('Cart follow-up sent successfully', { 
            cartId: cart.id, 
            phoneNumber 
          });
          
          // Optionally mark cart as having received follow-up
          // await prisma.cart.update({
          //   where: { id: cart.id },
          //   data: { whatsappFollowUpSent: true }
          // });
        } else {
          errors.push(`Failed to send follow-up for cart ${cart.id}: ${result.error}`);
          logger.error('Failed to send cart follow-up', { 
            cartId: cart.id, 
            error: result.error 
          });
        }
        
        // Add small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        errors.push(`Error processing cart ${cart.id}: ${error}`);
        logger.error('Error processing abandoned cart', { 
          cartId: cart.id, 
          error 
        });
      }
    }
    
    logger.info('Cart follow-up process completed', { 
      totalChecked: abandonedCarts.length,
      messagesSent: sentCount,
      errors: errors.length
    });
    
    return {
      success: true,
      stats: {
        totalChecked: abandonedCarts.length,
        messagesSent: sentCount,
        errors: errors.length
      },
      errorMessages: errors
    };
    
  } catch (error) {
    logger.error('Error in cart follow-up system', { error });
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Scheduled task runner - should be called periodically (e.g., every hour)
 */
export async function runCartFollowUpTask() {
  try {
    const result = await checkAbandonedCarts();
    
    if (result.success) {
      logger.info('Cart follow-up task completed successfully', result.stats);
    } else {
      logger.error('Cart follow-up task failed', { error: result.error });
    }
    
    return result;
  } catch (error) {
    logger.error('Cart follow-up task crashed', { error });
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Task crashed'
    };
  }
}

// Example usage:
// This would typically be called by a cron job or background task scheduler
// For development/testing, you can call it manually:

/*
// Manual test
if (require.main === module) {
  runCartFollowUpTask().then(result => {
    console.log('Task result:', result);
    process.exit(result.success ? 0 : 1);
  }).catch(error => {
    console.error('Task error:', error);
    process.exit(1);
  });
}
*/