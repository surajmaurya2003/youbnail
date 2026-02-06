/**
 * Enhanced Security Configuration and Monitoring
 * Defines security policies, sensitive data patterns, and runtime monitoring
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
    /e7aTFwQ8pcN1otcv/gi, // NeetoChat API key
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
    SECURITY_ERROR: 'Security violation detected. Access denied.',
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

  // Rate limiting configuration
  RATE_LIMITS: {
    API_REQUESTS_PER_MINUTE: 60,
    FILE_UPLOADS_PER_MINUTE: 10,
    AUTH_ATTEMPTS_PER_MINUTE: 5,
  },

  // Allowed domains
  ALLOWED_DOMAINS: ['youbnail.com', 'www.youbnail.com', 'localhost', '127.0.0.1'],
} as const;

/**
 * Security Monitoring Class
 * Implements runtime security monitoring and protection
 */
class SecurityMonitor {
  private requestTimes: Map<string, number[]> = new Map();
  private isMonitoring = false;

  constructor() {
    if (typeof window !== 'undefined') {
      this.initializeMonitoring();
    }
  }

  private initializeMonitoring() {
    if (this.isMonitoring) return;
    
    this.setupRequestMonitoring();
    this.setupDOMMonitoring();
    this.setupConsoleProtection();
    this.validateDomain();
    
    this.isMonitoring = true;
  }

  private setupRequestMonitoring() {
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      this.trackRequest('fetch');
      return originalFetch.apply(window, args);
    };
  }

  private setupDOMMonitoring() {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          this.checkForSuspiciousElements(mutation.addedNodes);
        }
      });
    });

    if (document.body) {
      observer.observe(document.body, { childList: true, subtree: true });
    }
  }

  private setupConsoleProtection() {
    if (SECURITY_CONFIG.IS_PRODUCTION) {
      console.log(
        '%cSTOP!',
        'color: red; font-size: 50px; font-weight: bold; text-shadow: 2px 2px 4px rgba(0,0,0,0.5);'
      );
      console.log(
        '%cThis is a browser feature intended for developers. If someone told you to copy-paste something here, it is a scam and could compromise your account.',
        'color: red; font-size: 16px; background: yellow; padding: 5px;'
      );
    }
  }

  private trackRequest(type: string) {
    const now = Date.now();
    const requests = this.requestTimes.get(type) || [];
    
    // Add current request
    requests.push(now);
    
    // Clean requests older than 1 minute
    const filteredRequests = requests.filter(time => now - time < 60000);
    this.requestTimes.set(type, filteredRequests);
    
    // Check rate limits
    const limit = SECURITY_CONFIG.RATE_LIMITS.API_REQUESTS_PER_MINUTE;
    if (filteredRequests.length > limit) {
      this.reportSecurityEvent('RATE_LIMIT_EXCEEDED', { type, count: filteredRequests.length });
    }
  }

  private checkForSuspiciousElements(nodes: NodeList) {
    nodes.forEach((node) => {
      if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as Element;
        
        if (element.tagName === 'SCRIPT') {
          const src = element.getAttribute('src');
          if (src && !this.isAllowedScriptSource(src)) {
            this.reportSecurityEvent('UNAUTHORIZED_SCRIPT', { src });
          }
        }
      }
    });
  }

  private isAllowedScriptSource(src: string): boolean {
    const allowedSources = [
      'https://d13nryxs46eypn.cloudfront.net',
      'https://fonts.googleapis.com',
      'https://fonts.gstatic.com',
      '/assets/',
      window.location.origin,
    ];
    
    return allowedSources.some(allowed => src.startsWith(allowed));
  }

  private validateDomain(): boolean {
    const hostname = window.location.hostname;
    const isValid = SECURITY_CONFIG.ALLOWED_DOMAINS.includes(hostname);
    
    if (!isValid) {
      this.reportSecurityEvent('UNAUTHORIZED_DOMAIN', { hostname });
    }
    
    return isValid;
  }

  public reportSecurityEvent(event: string, details?: any) {
    if (SECURITY_CONFIG.IS_DEVELOPMENT) {
      console.warn(`🔒 Security Event: ${event}`, details);
    }
    
    // In production, send to monitoring service
    if (SECURITY_CONFIG.IS_PRODUCTION) {
      // Example: analytics.track('security_event', { event, details, timestamp: Date.now() });
    }
  }
}

// Initialize security monitoring
const securityMonitor = typeof window !== 'undefined' ? new SecurityMonitor() : null;

export { securityMonitor };
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