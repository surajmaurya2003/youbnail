/**
 * Application Configuration
 * Centralizes all environment variables and configurations
 */

// Production check
export const isProduction = import.meta.env.PROD;
export const isDevelopment = import.meta.env.DEV;

// Domain validation
export const ALLOWED_DOMAINS = [
  'youbnail.com',
  'www.youbnail.com',
  'localhost',
  '127.0.0.1'
];

export const PRODUCTION_DOMAIN = 'youbnail.com';

// Security configurations
export const SECURITY_CONFIG = {
  enableCSP: true,
  enforceHTTPS: isProduction,
  allowedOrigins: ALLOWED_DOMAINS,
  rateLimits: {
    apiRequests: 100, // per minute
    fileUploads: 10,  // per minute
  }
};

// NeetoChat configuration
export const NEETO_CHAT_CONFIG = {
  // ⚠️ SECURITY: API key moved to environment variables
  // Use VITE_NEETO_CHAT_API_KEY environment variable instead
  apiKey: import.meta.env.VITE_NEETO_CHAT_API_KEY || '',
  enableOnDomains: isProduction ? [PRODUCTION_DOMAIN] : ['localhost', '127.0.0.1'],
  settings: {
    enableHttpsOnly: isProduction,
    restrictDomains: isProduction ? [PRODUCTION_DOMAIN] : undefined,
  }
};

// Validate current domain
export const isValidDomain = (hostname: string): boolean => {
  return ALLOWED_DOMAINS.some(domain => 
    hostname === domain || hostname.endsWith(`.${domain}`)
  );
};

// Get current environment info
export const getEnvironmentInfo = () => ({
  isProduction,
  isDevelopment,
  hostname: typeof window !== 'undefined' ? window.location.hostname : 'server',
  isValidDomain: typeof window !== 'undefined' ? isValidDomain(window.location.hostname) : true,
});