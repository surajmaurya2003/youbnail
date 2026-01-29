/**
 * Secure error handling utility
 * Prevents sensitive information from being exposed in console logs
 */

interface ErrorContext {
  operation?: string;
  component?: string;
  metadata?: Record<string, any>;
}

export class SecureErrorHandler {
  private static isDevelopment = import.meta.env.DEV;

  /**
   * Log error securely - detailed in dev, generic in production
   */
  static logError(message: string, error?: any, context?: ErrorContext): void {
    if (this.isDevelopment) {
      console.error(`[${context?.component || 'App'}] ${message}:`, error);
      if (context?.metadata) {
        console.error('Context:', context.metadata);
      }
    } else {
      // Production: Only log generic messages without sensitive details
      console.error(`[${context?.component || 'App'}] Operation failed: ${context?.operation || 'unknown'}`);
    }
  }

  /**
   * Log warning securely
   */
  static logWarning(message: string, context?: ErrorContext): void {
    if (this.isDevelopment) {
      console.warn(`[${context?.component || 'App'}] ${message}`);
    } else {
      console.warn(`[${context?.component || 'App'}] Warning occurred`);
    }
  }

  /**
   * Get user-friendly error message without exposing internal details
   */
  static getUserMessage(error: any, fallback: string = 'An unexpected error occurred'): string {
    // Don't expose internal error details to users
    if (typeof error?.message === 'string') {
      // Filter out sensitive patterns
      const message = error.message;
      const sensitivePatterns = [
        /supabase\.co/gi,
        /localhost:\d+/gi,
        /api[_-]?key/gi,
        /token/gi,
        /secret/gi,
        /password/gi,
        /auth[_-]?header/gi
      ];

      const hasSensitiveInfo = sensitivePatterns.some(pattern => pattern.test(message));
      
      if (!hasSensitiveInfo && message.length < 200) {
        return message;
      }
    }

    return fallback;
  }

  /**
   * Safe console.log for development only
   */
  static devLog(message: string, data?: any): void {
    if (this.isDevelopment) {
      console.log(message, data);
    }
  }
}

// Convenience exports
export const logError = SecureErrorHandler.logError.bind(SecureErrorHandler);
export const logWarning = SecureErrorHandler.logWarning.bind(SecureErrorHandler);
export const getUserMessage = SecureErrorHandler.getUserMessage.bind(SecureErrorHandler);
export const devLog = SecureErrorHandler.devLog.bind(SecureErrorHandler);