import { config } from '@config/env';

enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
}

class Logger {
  private shouldLog(level: LogLevel): boolean {
    const levels = [LogLevel.DEBUG, LogLevel.INFO, LogLevel.WARN, LogLevel.ERROR];
    const currentLevel = config.logLevel;
    return levels.indexOf(level) >= levels.indexOf(currentLevel as LogLevel);
  }

  private formatMessage(level: LogLevel, message: string, meta?: any): string {
    const timestamp = new Date().toISOString();
    const metaStr = meta ? `\n${JSON.stringify(meta, null, 2)}` : '';
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${metaStr}`;
  }

  debug(message: string, meta?: any): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      console.log(this.formatMessage(LogLevel.DEBUG, message, meta));
    }
  }

  info(message: string, meta?: any): void {
    if (this.shouldLog(LogLevel.INFO)) {
      console.log(this.formatMessage(LogLevel.INFO, message, meta));
    }
  }

  warn(message: string, meta?: any): void {
    if (this.shouldLog(LogLevel.WARN)) {
      console.warn(this.formatMessage(LogLevel.WARN, message, meta));
    }
  }

  error(message: string, error?: Error | any): void {
    if (this.shouldLog(LogLevel.ERROR)) {
      console.error(this.formatMessage(LogLevel.ERROR, message, error));
      if (error?.stack) {
        console.error(error.stack);
      }
    }
  }
}

export const logger = new Logger();