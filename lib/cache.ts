/**
 * Cache Manager for QM Beauty Application
 * Uses Redis for production and in-memory for development
 */

import { redisManager } from './redis';

interface CacheOptions {
  ttl?: number; // Time to live in seconds
  staleWhileRevalidate?: number; // Time to serve stale cache while revalidating
}

class CacheManager {
  private isRedisEnabled: boolean;

  constructor() {
    this.isRedisEnabled = (typeof process !== 'undefined' && process.env.REDIS_ENABLED === 'true') || false;
  }

  /**
   * Get value from cache
   */
  public async get<T>(key: string): Promise<T | null> {
    if (this.isRedisEnabled && redisManager.isReady()) {
      try {
        const cachedValue = await redisManager.get(key);
        if (cachedValue) {
          return JSON.parse(cachedValue) as T;
        }
      } catch (error) {
        console.error('Cache get error:', error);
        // Fall back to in-memory cache if Redis fails
      }
    }

    // Fallback to in-memory cache
    return this.getInMemoryCache<T>(key);
  }

  /**
   * Set value in cache
   */
  public async set<T>(key: string, value: T, options?: CacheOptions): Promise<void> {
    if (this.isRedisEnabled && redisManager.isReady()) {
      try {
        const ttl = options?.ttl || 3600; // Default 1 hour
        await redisManager.set(key, JSON.stringify(value), ttl);
        return;
      } catch (error) {
        console.error('Cache set error:', error);
        // Fall back to in-memory cache if Redis fails
      }
    }

    // Fallback to in-memory cache
    this.setInMemoryCache(key, value, options);
  }

  /**
   * Delete value from cache
   */
  public async delete(key: string): Promise<void> {
    if (this.isRedisEnabled && redisManager.isReady()) {
      try {
        await redisManager.del(key);
        // Also delete from in-memory cache
        this.deleteInMemoryCache(key);
        return;
      } catch (error) {
        console.error('Cache delete error:', error);
      }
    }

    // Delete from in-memory cache
    this.deleteInMemoryCache(key);
  }

  /**
   * Clear all cache
   */
  public async clear(): Promise<void> {
    if (this.isRedisEnabled && redisManager.isReady()) {
      try {
        // Note: This would clear the entire Redis database
        // In a real implementation, you'd want to be more selective
        // For now, we'll just clear our in-memory cache
      } catch (error) {
        console.error('Cache clear error:', error);
      }
    }

    // Clear in-memory cache
    this.clearInMemoryCache();
  }

  /**
   * Check if key exists in cache
   */
  public async has(key: string): Promise<boolean> {
    if (this.isRedisEnabled && redisManager.isReady()) {
      try {
        return await redisManager.exists(key);
      } catch (error) {
        console.error('Cache has error:', error);
      }
    }

    // Check in-memory cache
    return this.hasInMemoryCache(key);
  }

  /**
   * Get cache with TTL handling
   */
  public async getWithTtl<T>(key: string, ttlSeconds: number, fetchFn: () => Promise<T>): Promise<T> {
    // Try to get from cache
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    // Fetch fresh data
    const freshData = await fetchFn();
    
    // Store in cache
    await this.set(key, freshData, { ttl: ttlSeconds });
    
    return freshData;
  }

  // In-memory cache fallback implementation
  private inMemoryCache = new Map<string, { value: any; expiry: number }>();

  private getInMemoryCache<T>(key: string): T | null {
    const item = this.inMemoryCache.get(key);
    if (!item) {
      return null;
    }

    if (Date.now() > item.expiry) {
      this.inMemoryCache.delete(key);
      return null;
    }

    return item.value as T;
  }

  private setInMemoryCache<T>(key: string, value: T, options?: CacheOptions): void {
    const ttl = options?.ttl || 3600; // Default 1 hour
    const expiry = Date.now() + (ttl * 1000);
    this.inMemoryCache.set(key, { value, expiry });
  }

  private deleteInMemoryCache(key: string): void {
    this.inMemoryCache.delete(key);
  }

  private hasInMemoryCache(key: string): boolean {
    const item = this.inMemoryCache.get(key);
    if (!item) {
      return false;
    }

    if (Date.now() > item.expiry) {
      this.inMemoryCache.delete(key);
      return false;
    }

    return true;
  }

  private clearInMemoryCache(): void {
    this.inMemoryCache.clear();
  }
}

// Singleton cache manager instance
export const cacheManager = new CacheManager();

// Predefined cache keys for common data
export const CACHE_KEYS = {
  PRODUCTS: 'products:all',
  PRODUCT_BY_ID: (id: string) => `product:${id}`,
  CATEGORIES: 'categories:all',
  CART_BY_ID: (cartId: string) => `cart:${cartId}`,
  USER_BY_ID: (userId: string) => `user:${userId}`,
  ORDER_BY_ID: (orderId: string) => `order:${orderId}`,
  PAYMENT_BY_ID: (paymentId: string) => `payment:${paymentId}`,
  CONFIG: 'app:config',
  SETTINGS: 'app:settings',
};

// Convenience methods for common caching patterns
export const productCache = {
  get: async (id: string) => cacheManager.get<any>(CACHE_KEYS.PRODUCT_BY_ID(id)),
  set: async (id: string, product: any, ttl = 3600) => 
    cacheManager.set(CACHE_KEYS.PRODUCT_BY_ID(id), product, { ttl }),
  delete: async (id: string) => cacheManager.delete(CACHE_KEYS.PRODUCT_BY_ID(id)),
};

export const cartCache = {
  get: async (id: string) => cacheManager.get<any>(CACHE_KEYS.CART_BY_ID(id)),
  set: async (id: string, cart: any, ttl = 1800) => 
    cacheManager.set(CACHE_KEYS.CART_BY_ID(id), cart, { ttl }),
  delete: async (id: string) => cacheManager.delete(CACHE_KEYS.CART_BY_ID(id)),
};

export const orderCache = {
  get: async (id: string) => cacheManager.get<any>(CACHE_KEYS.ORDER_BY_ID(id)),
  set: async (id: string, order: any, ttl = 7200) => 
    cacheManager.set(CACHE_KEYS.ORDER_BY_ID(id), order, { ttl }),
  delete: async (id: string) => cacheManager.delete(CACHE_KEYS.ORDER_BY_ID(id)),
};

export default cacheManager;