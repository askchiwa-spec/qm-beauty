/**
 * Audit Logging for QM Beauty Application
 */

import { prisma } from './prisma';
import { logger } from './logging';

export interface AuditLog {
  id: string;
  entityType: string;
  entityId: string;
  action: string;
  userId?: string;
  ipAddress?: string;
  userAgent?: string;
  description: string;
  metadata?: any;
  createdAt: Date;
}

export interface AuditLogData {
  entityType: string;
  entityId: string;
  action: string;
  userId?: string;
  ipAddress?: string;
  userAgent?: string;
  description: string;
  metadata?: any;
}

class AuditLogger {
  /**
   * Log an audit event to the database
   */
  public async log(logData: AuditLogData): Promise<void> {
    try {
      // Create audit log in database
      await prisma.activityLog.create({
        data: {
          entityType: logData.entityType,
          entityId: logData.entityId,
          action: logData.action,
          description: logData.description,
          metadata: logData.metadata || {},
        },
      });

      // Also log to structured logger
      logger.info(`AUDIT: ${logData.action}`, {
        entityType: logData.entityType,
        entityId: logData.entityId,
        userId: logData.userId,
        ipAddress: logData.ipAddress,
        userAgent: logData.userAgent,
        description: logData.description,
        metadata: logData.metadata,
      });
    } catch (error) {
      // Don't let audit logging failures break the main application flow
      logger.error('Failed to create audit log', { error, logData });
    }
  }

  /**
   * Log user action
   */
  public async logUserAction(
    userId: string,
    action: string,
    entityType: string,
    entityId: string,
    description: string,
    metadata?: any
  ): Promise<void> {
    await this.log({
      entityType,
      entityId,
      action,
      userId,
      description,
      metadata,
    });
  }

  /**
   * Log order action
   */
  public async logOrderAction(
    orderId: string,
    action: string,
    userId?: string,
    description: string = '',
    metadata?: any
  ): Promise<void> {
    await this.log({
      entityType: 'order',
      entityId: orderId,
      action,
      userId,
      description: description || `Order ${action}`,
      metadata,
    });
  }

  /**
   * Log payment action
   */
  public async logPaymentAction(
    paymentId: string,
    action: string,
    userId?: string,
    description: string = '',
    metadata?: any
  ): Promise<void> {
    await this.log({
      entityType: 'payment',
      entityId: paymentId,
      action,
      userId,
      description: description || `Payment ${action}`,
      metadata,
    });
  }

  /**
   * Log cart action
   */
  public async logCartAction(
    cartId: string,
    action: string,
    userId?: string,
    description: string = '',
    metadata?: any
  ): Promise<void> {
    await this.log({
      entityType: 'cart',
      entityId: cartId,
      action,
      userId,
      description: description || `Cart ${action}`,
      metadata,
    });
  }

  /**
   * Log product action
   */
  public async logProductAction(
    productId: string,
    action: string,
    userId?: string,
    description: string = '',
    metadata?: any
  ): Promise<void> {
    await this.log({
      entityType: 'product',
      entityId: productId,
      action,
      userId,
      description: description || `Product ${action}`,
      metadata,
    });
  }

  /**
   * Log security event
   */
  public async logSecurityEvent(
    action: string,
    ipAddress?: string,
    userAgent?: string,
    description: string = '',
    metadata?: any
  ): Promise<void> {
    await this.log({
      entityType: 'security',
      entityId: 'global',
      action,
      ipAddress,
      userAgent,
      description: description || `Security event: ${action}`,
      metadata,
    });
  }

  /**
   * Get audit logs for an entity
   */
  public async getEntityLogs(entityType: string, entityId: string): Promise<AuditLog[]> {
    try {
      return await prisma.activityLog.findMany({
        where: {
          entityType,
          entityId,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    } catch (error) {
      logger.error('Failed to fetch audit logs', { error, entityType, entityId });
      return [];
    }
  }

  /**
   * Get audit logs for a user
   */
  public async getUserLogs(userId: string): Promise<AuditLog[]> {
    try {
      // Note: The current schema doesn't have a direct user field in activityLog
      // This would require schema changes to properly link to users
      return await prisma.activityLog.findMany({
        where: {
          metadata: {
            path: ['userId'],
            equals: userId,
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    } catch (error) {
      logger.error('Failed to fetch user audit logs', { error, userId });
      return [];
    }
  }

  /**
   * Get recent audit logs
   */
  public async getRecentLogs(limit: number = 100): Promise<AuditLog[]> {
    try {
      return await prisma.activityLog.findMany({
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
      });
    } catch (error) {
      logger.error('Failed to fetch recent audit logs', { error, limit });
      return [];
    }
  }
}

// Singleton audit logger instance
export const auditLogger = new AuditLogger();

export default auditLogger;