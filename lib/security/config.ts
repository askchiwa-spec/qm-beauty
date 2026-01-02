/**
 * Security configuration for QM Beauty application
 */

// Security configuration constants
export const SECURITY_CONFIG = {
  // Rate limiting
  RATE_LIMIT: {
    requests: 100,    // requests per window
    windowMs: 15 * 60 * 1000, // 15 minutes
    apiRequests: 50,  // API-specific rate limit
  },

  // Input validation
  VALIDATION: {
    MAX_STRING_LENGTH: 500,
    MAX_ARRAY_LENGTH: 50,
    MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  },

  // Security headers
  SECURITY_HEADERS: {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  },

  // CORS configuration (when implemented)
  CORS: {
    allowedOrigins: process.env.NODE_ENV === 'production' 
      ? ['https://qmbeauty.co.tz', 'https://*.vercel.app'] 
      : ['http://localhost:3000', 'http://localhost:3001'],
    allowedMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  },

  // Authentication
  AUTH: {
    JWT_EXPIRES_IN: '24h',
    REFRESH_TOKEN_EXPIRES_IN: '7d',
    PASSWORD_MIN_LENGTH: 8,
    PASSWORD_REQUIRE_SPECIAL_CHARS: true,
  },

  // Logging
  LOGGING: {
    LOG_LEVEL: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    LOG_SENSITIVE_DATA: false, // Never log sensitive data in production
  },

  // API Security
  API_SECURITY: {
    ALLOWED_CONTENT_TYPES: [
      'application/json',
      'application/x-www-form-urlencoded',
      'multipart/form-data',
    ],
    BLOCKED_CONTENT_TYPES: [
      'text/html',
      'text/javascript',
      'application/javascript',
    ],
  },
};

// Blocked user agents and patterns
export const BLOCKED_PATTERNS = {
  USER_AGENTS: [
    'sqlmap',
    'nmap',
    'nikto',
    'dirb',
    'dirbuster',
    'gobuster',
    'w3af',
    'acunetix',
    'nessus',
    'netsparker',
    'burp',
    'owasp',
    'zaproxy',
  ],
  
  URL_PATTERNS: [
    '../',
    '..\\',
    'etc/passwd',
    '.git',
    'config.php',
    'wp-config.php',
    'admin.php',
    'login.php',
    'shell.php',
  ],
  
  HEADER_PATTERNS: [
    'union select',
    'select * from',
    'drop table',
    'create table',
    'insert into',
    'update set',
    'delete from',
    'exec(',
    'execute(',
    'sp_',
    'xp_',
  ],
};

// Security utilities
export const isContentTypeAllowed = (contentType: string): boolean => {
  if (!contentType) return false;
  
  const allowed = SECURITY_CONFIG.API_SECURITY.ALLOWED_CONTENT_TYPES;
  const blocked = SECURITY_CONFIG.API_SECURITY.BLOCKED_CONTENT_TYPES;
  
  const lowerType = contentType.toLowerCase();
  
  // Check if it's explicitly blocked
  if (blocked.some(blockedType => lowerType.includes(blockedType))) {
    return false;
  }
  
  // Check if it's allowed
  return allowed.some(allowedType => lowerType.includes(allowedType));
};

// Validate request body size
export const isValidBodySize = (size: number): boolean => {
  return size <= SECURITY_CONFIG.VALIDATION.MAX_FILE_SIZE;
};

// Check for suspicious patterns in input
export const hasSuspiciousPattern = (input: string): boolean => {
  if (!input || typeof input !== 'string') {
    return false;
  }
  
  const lowerInput = input.toLowerCase();
  
  // Check URL patterns
  if (BLOCKED_PATTERNS.URL_PATTERNS.some(pattern => lowerInput.includes(pattern.toLowerCase()))) {
    return true;
  }
  
  // Check header patterns
  if (BLOCKED_PATTERNS.HEADER_PATTERNS.some(pattern => lowerInput.includes(pattern.toLowerCase()))) {
    return true;
  }
  
  return false;
};

// Sanitize redirect URL to prevent open redirect
export const sanitizeRedirectUrl = (url: string, allowedDomains: string[]): string => {
  try {
    const parsedUrl = new URL(url);
    
    // Only allow HTTPS in production
    if (process.env.NODE_ENV === 'production' && parsedUrl.protocol !== 'https:') {
      return '/';
    }
    
    // Check if domain is allowed
    if (!allowedDomains.some(domain => 
      parsedUrl.hostname === domain || parsedUrl.hostname.endsWith('.' + domain)
    )) {
      return '/';
    }
    
    return url;
  } catch (error) {
    // If URL parsing fails, return safe default
    return '/';
  }
};

// Generate secure random token
export const generateSecureToken = (length: number = 32): string => {
  const crypto = require('crypto') as typeof import('crypto');
  return crypto.randomBytes(length).toString('hex');
};

// Validate session token format (basic validation)
export const isValidSessionToken = (token: string): boolean => {
  if (!token || typeof token !== 'string') {
    return false;
  }
  
  // Basic format check: should be a hex string of appropriate length
  const tokenRegex = /^[a-f0-9]{64}$/; // Assuming 32-byte hex token
  return tokenRegex.test(token);
};