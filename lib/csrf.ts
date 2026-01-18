/**
 * CSRF Protection for QM Beauty Application
 */

import { randomBytes, createHash } from 'crypto';

export interface CsrfTokenOptions {
  saltLength?: number;
  validityPeriod?: number; // in milliseconds
}

class CsrfProtection {
  private saltLength: number;
  private validityPeriod: number;

  constructor(options: CsrfTokenOptions = {}) {
    this.saltLength = options.saltLength || 32;
    this.validityPeriod = options.validityPeriod || 24 * 60 * 60 * 1000; // 24 hours
  }

  /**
   * Generate a CSRF token for a given session/user
   */
  public generateToken(sessionId: string): string {
    const salt = randomBytes(this.saltLength).toString('hex');
    const timestamp = Date.now().toString();
    const tokenData = `${sessionId}${salt}${timestamp}`;
    
    const hash = createHash('sha256').update(tokenData).digest('hex');
    return `${hash}|${timestamp}|${salt}`;
  }

  /**
   * Validate a CSRF token
   */
  public validateToken(token: string, sessionId: string): boolean {
    if (!token || !sessionId) {
      return false;
    }

    const parts = token.split('|');
    if (parts.length !== 3) {
      return false;
    }

    const [expectedHash, timestampStr, salt] = parts;
    const timestamp = parseInt(timestampStr, 10);

    // Check if token has expired
    if (Date.now() - timestamp > this.validityPeriod) {
      return false;
    }

    // Recreate the expected hash
    const tokenData = `${sessionId}${salt}${timestampStr}`;
    const actualHash = createHash('sha256').update(tokenData).digest('hex');

    return this.timingSafeEqual(actualHash, expectedHash);
  }

  /**
   * Timing-safe string comparison to prevent timing attacks
   */
  private timingSafeEqual(a: string, b: string): boolean {
    if (a.length !== b.length) {
      // Do some dummy computation to make the timing consistent
      let result = 0;
      for (let i = 0; i < b.length; i++) {
        result |= b.charCodeAt(i);
      }
      return false;
    }

    let result = 0;
    for (let i = 0; i < a.length; i++) {
      result |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }
    return result === 0;
  }
}

// Default CSRF protection instance
export const csrfProtection = new CsrfProtection({
  validityPeriod: 24 * 60 * 60 * 1000, // 24 hours
});

/**
 * CSRF middleware for Next.js API routes
 */
export function validateCsrfToken(token: string, sessionId: string): boolean {
  return csrfProtection.validateToken(token, sessionId);
}

/**
 * Generate CSRF token for a session
 */
export function generateCsrfToken(sessionId: string): string {
  return csrfProtection.generateToken(sessionId);
}

/**
 * Get session ID from request (this would depend on your session implementation)
 */
export function getSessionIdFromRequest(request: Request): string | null {
  // In a real implementation, you would extract session ID from cookies, headers, etc.
  // This is a simplified version
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7); // Extract session/token from Bearer token
  }
  
  // Or from a custom header
  const sessionId = request.headers.get('x-session-id');
  if (sessionId) {
    return sessionId;
  }
  
  return null;
}

/**
 * CSRF validation helper for API routes
 */
export async function validateCsrfInApiRoute(request: Request): Promise<boolean> {
  const csrfToken = request.headers.get('x-csrf-token');
  if (!csrfToken) {
    return false;
  }

  const sessionId = getSessionIdFromRequest(request);
  if (!sessionId) {
    return false;
  }

  return validateCsrfToken(csrfToken, sessionId);
}