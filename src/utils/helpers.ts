import crypto from 'crypto';
import { Types } from 'mongoose';

export class Helpers {
  /**
   * Generate a random token
   */
  static generateToken(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex');
  }

  /**
   * Generate a random alphanumeric code
   */
  static generateCode(length: number = 6): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < length; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  /**
   * Check if string is valid MongoDB ObjectId
   */
  static isValidObjectId(id: string): boolean {
    return Types.ObjectId.isValid(id);
  }

  /**
   * Convert string to ObjectId
   */
  static toObjectId(id: string): Types.ObjectId {
    return new Types.ObjectId(id);
  }

  /**
   * Sleep for specified milliseconds
   */
  static sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Format currency
   */
  static formatCurrency(amount: number, currency: string = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(amount);
  }

  /**
   * Calculate percentage
   */
  static calculatePercentage(value: number, total: number): number {
    if (total === 0) return 0;
    return Math.round((value / total) * 100 * 100) / 100;
  }

  /**
   * Sanitize user input
   */
  static sanitize(input: string): string {
    return input.trim().replace(/[<>]/g, '');
  }

  /**
   * Parse pagination params
   */
  static parsePagination(page?: string, limit?: string) {
    const parsedPage = parseInt(page || '1', 10);
    const parsedLimit = parseInt(limit || '20', 10);

    return {
      page: parsedPage > 0 ? parsedPage : 1,
      limit: parsedLimit > 0 && parsedLimit <= 100 ? parsedLimit : 20,
      skip: (parsedPage - 1) * parsedLimit,
    };
  }

  /**
   * Generate date range for month
   */
  static getMonthDateRange(month: number, year: number) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);
    return { startDate, endDate };
  }

  /**
   * Check if date is in range
   */
  static isDateInRange(date: Date, startDate: Date, endDate: Date): boolean {
    return date >= startDate && date <= endDate;
  }

  /**
   * Mask email for privacy
   */
  static maskEmail(email: string): string {
    const [username, domain] = email.split('@');
    if (username.length <= 2) return email;
    const masked = username[0] + '*'.repeat(username.length - 2) + username[username.length - 1];
    return `${masked}@${domain}`;
  }

  /**
   * Remove undefined/null values from object
   */
  static cleanObject<T extends Record<string, any>>(obj: T): Partial<T> {
    return Object.entries(obj).reduce((acc, [key, value]) => {
      if (value !== undefined && value !== null) {
        acc[key as keyof T] = value;
      }
      return acc;
    }, {} as Partial<T>);
  }

  /**
   * Delay execution (for testing)
   */
  static async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}