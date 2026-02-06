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
   * Initialize global error handling to suppress sensitive console logs
   */
  static initializeGlobalErrorHandling(): void {
    if (!this.isDevelopment) {
      // Override console.error in production to filter sensitive information
      const originalConsoleError = console.error;
      console.error = (...args: any[]) => {
        const message = args.join(' ');
        
        // Filter out sensitive error messages
        const sensitivePatterns = [
          /supabase\.co/gi,
          /Internal Server Error/gi,
          /500|502|503|504/gi,
          /auth\/v1\//gi,
          /localhost:\d+/gi,
          /frame_ant\.js/gi
        ];

        const hasSensitiveInfo = sensitivePatterns.some(pattern => 
          pattern.test(message)
        );

        if (!hasSensitiveInfo) {
          originalConsoleError.apply(console, args);
        }
      };

      // Handle unhandled promise rejections
      window.addEventListener('unhandledrejection', (event) => {
        const reason = event.reason;
        if (reason?.message) {
          const sanitized = this.getUserMessage(reason, 'An error occurred');
          // Only log non-sensitive errors
          if (!sanitized.includes('occurred')) {
            originalConsoleError('Unhandled error:', sanitized);
          }
        }
        event.preventDefault();
      });
    }
  }

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
        /auth[_-]?header/gi,
        /internal\s+server\s+error/gi,
        /500|502|503|504/gi,
        /\/auth\/v1\//gi,
        /otp\?redirect_to/gi
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