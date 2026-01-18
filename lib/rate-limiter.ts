/**
 * Redis-based Rate Limiter for QM Beauty Application
 */

import { redisManager } from './redis';

interface RateLimitOptions {
  windowMs: number;    // Time window in milliseconds
  max: number;         // Maximum number of requests allowed
  message?: string;    // Custom message to return
  statusCode?: number; // Status code to return
  keyGenerator?: (req: Request) => string; // Function to generate key
}

class RateLimiter {
  private options: RateLimitOptions;

  constructor(options: RateLimitOptions) {
    this.options = {
      windowMs: options.windowMs || 15 * 60 * 1000, // 15 minutes
      max: options.max || 100,
      message: options.message || 'Too many requests, please try again later.',
      statusCode: options.statusCode || 429,
      keyGenerator: options.keyGenerator || this.defaultKeyGenerator,
    };
  }

  /**
   * Default key generator - creates a key based on IP and URL
   */
  private defaultKeyGenerator(req: Request): string {
    // In a real implementation, you would extract the IP from headers
    // This is simplified for now
    const url = req.url ? new URL(req.url).pathname : 'unknown';
    const userAgent = req.headers.get('user-agent') || 'unknown';
    
    // Generate a hash of the IP and URL to create a unique key
    // For now, we'll use a simple approach
    const clientId = `${url}:${userAgent.substring(0, 20)}`;
    return `rate_limit:${clientId}`;
  }

  /**
   * Check if the request should be rate limited
   */
  public async check(request: Request): Promise<{
    allowed: boolean;
    remaining: number;
    resetTime: number;
    error?: string;
  }> {
    try {
      // Connect to Redis if not already connected
      if (!redisManager.isReady()) {
        await redisManager.connect();
      }

      const key = this.options.keyGenerator!(request);
      const windowMs = this.options.windowMs;
      const max = this.options.max;

      // Get current count and expiry time
      const result = await redisManager.get(key);
      let currentCount = 0;
      let expiryTime = Date.now() + windowMs;

      if (result) {
        const data = JSON.parse(result);
        currentCount = data.count || 0;
        expiryTime = data.expire || Date.now() + windowMs;
      }

      // Increment the count
      currentCount++;

      // Calculate remaining requests
      const remaining = Math.max(0, max - currentCount);

      // Update the count in Redis with expiration
      await redisManager.set(
        key,
        JSON.stringify({ count: currentCount, expire: expiryTime }),
        Math.ceil(windowMs / 1000) // Convert to seconds
      );

      // Check if rate limit is exceeded
      const allowed = currentCount <= max;

      return {
        allowed,
        remaining,
        resetTime: expiryTime,
        ...(allowed ? {} : { error: this.options.message })
      };
    } catch (error) {
      console.error('Rate limiter error:', error);
      // If Redis fails, allow the request to pass (fail open)
      return {
        allowed: true,
        remaining: this.options.max,
        resetTime: Date.now() + this.options.windowMs,
      };
    }
  }

  /**
   * Get rate limit info for a request
   */
  public async getRateLimitInfo(request: Request): Promise<{
    allowed: boolean;
    remaining: number;
    resetTime: number;
    error?: string;
  }> {
    return await this.check(request);
  }

  /**
   * Check rate limit and return response if exceeded
   */
  public async checkAndRespond(request: Request): Promise<Response | null> {
    const result = await this.check(request);

    if (!result.allowed) {
      return new Response(
        JSON.stringify({ 
          error: result.error || 'Too many requests, please try again later.' 
        }),
        {
          status: this.options.statusCode || 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': Math.ceil(this.options.windowMs / 1000).toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': result.resetTime.toString(),
          },
        }
      );
    }

    return null; // Continue with the request
  }
}

// Pre-configured rate limiters for different use cases
export const apiRateLimiter = new RateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many API requests, please try again later.',
});

export const authRateLimiter = new RateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit authentication attempts
  message: 'Too many authentication attempts, please try again later.',
});

export const cartRateLimiter = new RateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // Limit cart operations
  message: 'Too many cart operations, please try again later.',
});

export const paymentRateLimiter = new RateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limit payment operations
  message: 'Too many payment requests, please try again later.',
});

export default RateLimiter;