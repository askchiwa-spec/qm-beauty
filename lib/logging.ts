/**
 * Structured Logging Utility for QM Beauty Application
 */

export interface LogEntry {
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  context?: Record<string, any>;
  stack?: string;
}

class Logger {
  private static readonly LOG_LEVELS = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
  };

  private currentLogLevel: 'debug' | 'info' | 'warn' | 'error' = 
    (typeof process !== 'undefined' ? (process.env.LOG_LEVEL as any) : 'info') || 'info';

  private getLogLevel(): number {
    return Logger.LOG_LEVELS[this.currentLogLevel] || 1;
  }

  private formatLog(entry: LogEntry): string {
    const logObject: LogEntry & { pid?: number } = {
      ...entry,
      pid: typeof process !== 'undefined' ? process.pid : 0,
    };

    return JSON.stringify(logObject);
  }

  private writeLog(entry: LogEntry): void {
    const logLevel = Logger.LOG_LEVELS[entry.level];
    const currentLogLevel = this.getLogLevel();

    if (logLevel >= currentLogLevel) {
      const formattedLog = this.formatLog(entry);
      
      switch (entry.level) {
        case 'error':
          console.error(formattedLog);
          break;
        case 'warn':
          console.warn(formattedLog);
          break;
        case 'info':
          console.info(formattedLog);
          break;
        case 'debug':
          console.debug(formattedLog);
          break;
        default:
          console.log(formattedLog);
      }
    }
  }

  public debug(message: string, context?: Record<string, any>): void {
    this.writeLog({
      timestamp: new Date().toISOString(),
      level: 'debug',
      message,
      context,
    });
  }

  public info(message: string, context?: Record<string, any>): void {
    this.writeLog({
      timestamp: new Date().toISOString(),
      level: 'info',
      message,
      context,
    });
  }

  public warn(message: string, context?: Record<string, any>): void {
    this.writeLog({
      timestamp: new Date().toISOString(),
      level: 'warn',
      message,
      context,
    });
  }

  public error(message: string, context?: Record<string, any>, error?: Error): void {
    this.writeLog({
      timestamp: new Date().toISOString(),
      level: 'error',
      message,
      context,
      stack: error?.stack,
    });
  }

  public setLevel(level: 'debug' | 'info' | 'warn' | 'error'): void {
    this.currentLogLevel = level;
  }
}

export const logger = new Logger();

// Error handler for uncaught exceptions
if (typeof process !== 'undefined') {
  process.on('uncaughtException', (error: Error) => {
    logger.error('Uncaught Exception', {}, error);
  });

  process.on('unhandledRejection', (reason: any, promise: any) => {
    logger.error('Unhandled Rejection at promise', { promise }, reason as Error);
  });
}