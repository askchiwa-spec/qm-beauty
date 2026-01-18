/**
 * Tests for utility functions
 */

// Mock the external dependencies
jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn((data) => ({ body: data })),
    next: jest.fn(() => ({ body: null })),
  },
  NextRequest: jest.fn(),
}));

jest.mock('next/cache', () => ({
  revalidateTag: jest.fn(),
}));

jest.mock('@/lib/redis', () => ({
  redisClient: {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
    quit: jest.fn(),
    connect: jest.fn(),
  },
}));

describe('Utility Functions Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Logging Utility', () => {
    it('should have logging functions available', () => {
      const loggingModule = require('@/lib/logging');
      expect(loggingModule.logger).toBeDefined();
      expect(typeof loggingModule.logger.info).toBe('function');
      expect(typeof loggingModule.logger.warn).toBe('function');
      expect(typeof loggingModule.logger.error).toBe('function');
      expect(typeof loggingModule.logger.debug).toBe('function');
    });
  });

  describe('CORS Utility', () => {
    it('should have CORS functions available', () => {
      const corsModule = require('@/lib/cors');
      expect(corsModule.corsOptions).toBeDefined();
      expect(corsModule.validateOrigin).toBeDefined();
    });
  });

  describe('CSRF Utility', () => {
    it('should have CSRF functions available', () => {
      const csrfModule = require('@/lib/csrf');
      expect(csrfModule.generateToken).toBeDefined();
      expect(csrfModule.validateToken).toBeDefined();
      expect(csrfModule.getSessionId).toBeDefined();
    });
  });

  describe('Rate Limiter Utility', () => {
    it('should have rate limiter available', () => {
      const rateLimiterModule = require('@/lib/rate-limiter');
      expect(rateLimiterModule.RateLimiter).toBeDefined();
      expect(rateLimiterModule.apiLimiter).toBeDefined();
      expect(rateLimiterModule.authLimiter).toBeDefined();
      expect(rateLimiterModule.globalLimiter).toBeDefined();
    });
  });

  describe('Audit Utility', () => {
    it('should have audit functions available', () => {
      const auditModule = require('@/lib/audit');
      expect(auditModule.logAudit).toBeDefined();
      expect(auditModule.logOrderAction).toBeDefined();
      expect(auditModule.logPaymentAction).toBeDefined();
    });
  });

  describe('Cache Utility', () => {
    it('should have cache functions available', () => {
      const cacheModule = require('@/lib/cache');
      expect(cacheModule.cache).toBeDefined();
      expect(cacheModule.CacheKeys).toBeDefined();
    });
  });
});