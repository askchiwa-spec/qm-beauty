/**
 * Security validation utilities for QM Beauty application
 */

// Input sanitization and validation functions
export const sanitizeInput = (input: string): string => {
  if (typeof input !== 'string') {
    return '';
  }
  
  // Remove potentially dangerous characters
  return input.replace(/[<>"'&;]/g, (match) => {
    const escapeMap: Record<string, string> = {
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#x27;',
      '&': '&amp;',
      ';': '&#x3B;',
    };
    return escapeMap[match] || match;
  });
};

// Validate email format
export const isValidEmail = (email: string): boolean => {
  if (!email || typeof email !== 'string') {
    return false;
  }
  
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
};

// Validate phone number for Tanzania format
export const isValidTanzaniaPhone = (phone: string): boolean => {
  if (!phone || typeof phone !== 'string') {
    return false;
  }
  
  // Remove spaces and dashes
  const cleaned = phone.replace(/[\s-]/g, '');
  
  // Valid formats:
  // +255XXXXXXXXX (13 digits)
  // 0XXXXXXXXX (10 digits)
  // 7XXXXXXXX or 6XXXXXXXX (9 digits - mobile)
  
  const patterns = [
    /^\+255[67]\d{8}$/,  // +255 7XX XXX XXX
    /^0[67]\d{8}$/,       // 0 7XX XXX XXX
    /^[67]\d{8}$/,        // 7XX XXX XXX
  ];
  
  return patterns.some(pattern => pattern.test(cleaned));
};

// Validate amount (positive numbers only)
export const isValidAmount = (amount: number): boolean => {
  return typeof amount === 'number' && amount > 0 && !isNaN(amount) && isFinite(amount);
};

// Validate order code format
export const isValidOrderCode = (orderCode: string): boolean => {
  if (!orderCode || typeof orderCode !== 'string') {
    return false;
  }
  
  // Expected format: QB-XXXXXXXXXX (QB- followed by alphanumeric characters)
  const orderCodeRegex = /^QB-\w+$/;
  return orderCodeRegex.test(orderCode);
};

// Validate product name (basic validation)
export const isValidProductName = (name: string): boolean => {
  if (!name || typeof name !== 'string') {
    return false;
  }
  
  // Check for minimum and maximum length
  if (name.length < 1 || name.length > 200) {
    return false;
  }
  
  // Basic sanitization check
  return name === sanitizeInput(name);
};

// Validate quantity (positive integers only)
export const isValidQuantity = (quantity: number): boolean => {
  return Number.isInteger(quantity) && quantity > 0;
};

// Validate payment status
export const isValidPaymentStatus = (status: string): status is 'pending' | 'completed' | 'failed' | 'refunded' => {
  const validStatuses = ['pending', 'completed', 'failed', 'refunded'];
  return validStatuses.includes(status);
};

// Validate fulfillment status
export const isValidFulfillmentStatus = (status: string): status is 'new' | 'processing' | 'shipped' | 'delivered' | 'cancelled' => {
  const validStatuses = ['new', 'processing', 'shipped', 'delivered', 'cancelled'];
  return validStatuses.includes(status);
};

// Validate webhook signature using HMAC
export const validateWebhookSignature = (payload: string, signature: string, secret: string): boolean => {
  if (!signature || !secret) {
    return false;
  }

  try {
    // In a real implementation, you would use crypto to verify the signature
    // This is a simplified version for demonstration
    // For production, use proper HMAC verification
    return typeof signature === 'string' && signature.length > 0;
  } catch (error) {
    console.error('Webhook signature validation error:', error);
    return false;
  }
};

// Rate limiting helper (for use with external storage like Redis in production)
export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: number;
  error?: string;
}

export const checkRateLimit = async (
  key: string,
  limit: number = 100,
  windowMs: number = 15 * 60 * 1000 // 15 minutes
): Promise<RateLimitResult> => {
  try {
    // In production, use Redis or database for distributed rate limiting
    // This is a simplified in-memory version for demonstration
    const now = Date.now();
    const windowStart = now - windowMs;
    
    // For this demo, we'll return allowed (in a real app, implement proper storage)
    return {
      allowed: true,
      remaining: limit,
      resetTime: now + windowMs,
    };
  } catch (error) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: Date.now() + windowMs,
      error: 'Rate limit check failed',
    };
  }
};

// Validate user agent for security
export const isSuspiciousUserAgent = (userAgent: string): boolean => {
  if (!userAgent) return false;
  
  const suspiciousPatterns = [
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
  ];
  
  const lowerUserAgent = userAgent.toLowerCase();
  return suspiciousPatterns.some(pattern => lowerUserAgent.includes(pattern));
};

// Validate IP address format
export const isValidIpAddress = (ip: string): boolean => {
  if (!ip || typeof ip !== 'string') {
    return false;
  }
  
  // Basic IPv4 validation
  const ipv4Regex = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  
  // Basic IPv6 validation (simplified)
  const ipv6Regex = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$|^::1$|^::$/;
  
  return ipv4Regex.test(ip) || ipv6Regex.test(ip);
};