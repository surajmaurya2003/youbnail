/**
 * Security Configuration
 * Defines security policies and sensitive data patterns
 */

export const SECURITY_CONFIG = {
  // Patterns that should never appear in logs or error messages
  SENSITIVE_PATTERNS: [
    /supabase\.co/gi,
    /localhost:\d+/gi,
    /api[_-]?key/gi,
    /token/gi,
    /secret/gi,
    /password/gi,
    /auth[_-]?header/gi,
    /bearer\s+[a-zA-Z0-9-_]+/gi,
    /sk_[a-zA-Z0-9]+/gi, // Stripe secret keys
    /pk_[a-zA-Z0-9]+/gi, // Stripe public keys (still sensitive)
    /[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}/gi, // UUIDs
    /[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+/gi, // IP addresses
  ],

  // Safe error messages for different contexts
  SAFE_ERROR_MESSAGES: {
    AUTH_ERROR: 'Authentication failed. Please try again.',
    NETWORK_ERROR: 'Network error. Please check your connection.',
    PAYMENT_ERROR: 'Payment processing failed. Please try again.',
    UPLOAD_ERROR: 'File upload failed. Please try again.',
    GENERATION_ERROR: 'Thumbnail generation failed. Please try again.',
    DATABASE_ERROR: 'Data operation failed. Please try again.',
    PERMISSION_ERROR: 'Access denied. Please check your permissions.',
    RATE_LIMIT_ERROR: 'Too many requests. Please try again later.',
    VALIDATION_ERROR: 'Invalid input. Please check your data.',
    UNKNOWN_ERROR: 'An unexpected error occurred. Please try again.',
  },

  // Development vs Production behavior
  IS_PRODUCTION: import.meta.env.PROD,
  IS_DEVELOPMENT: import.meta.env.DEV,

  // Security headers for requests
  SECURE_HEADERS: {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
  },
} as const;

/**
 * Sanitize any string to remove sensitive information
 */
export function sanitizeForLogging(input: any): string {
  if (typeof input !== 'string') {
    input = String(input);
  }

  let sanitized = input;
  
  // Replace sensitive patterns with placeholders
  SECURITY_CONFIG.SENSITIVE_PATTERNS.forEach(pattern => {
    sanitized = sanitized.replace(pattern, '[REDACTED]');
  });

  return sanitized;
}

/**
 * Check if a string contains sensitive information
 */
export function containsSensitiveInfo(input: string): boolean {
  return SECURITY_CONFIG.SENSITIVE_PATTERNS.some(pattern => pattern.test(input));
}

/**
 * Get a safe error message based on error type
 */
export function getSafeErrorMessage(errorType: keyof typeof SECURITY_CONFIG.SAFE_ERROR_MESSAGES): string {
  return SECURITY_CONFIG.SAFE_ERROR_MESSAGES[errorType];
}