/**
 * Redis Client for QM Beauty Application
 * Used for caching, session storage, and rate limiting
 */

import { createClient, RedisClientType } from 'redis';

interface RedisConfig {
  host: string;
  port: number;
  password?: string;
  username?: string;
  db?: number;
  tls?: boolean;
}

class RedisManager {
  private client: RedisClientType | null = null;
  private isConnected = false;
  private config: RedisConfig;

  constructor(config?: Partial<RedisConfig>) {
    this.config = {
      host: process.env.REDIS_HOST || config?.host || '127.0.0.1',
      port: parseInt(process.env.REDIS_PORT || config?.port?.toString() || '6379'),
      password: process.env.REDIS_PASSWORD || config?.password,
      username: process.env.REDIS_USERNAME || config?.username,
      db: config?.db || 0,
      tls: config?.tls || false,
    };
  }

  /**
   * Connect to Redis
   */
  public async connect(): Promise<void> {
    if (this.isConnected) {
      return;
    }

    try {
      // Create Redis client
      const clientOptions: any = {
        socket: {
          host: this.config.host,
          port: this.config.port,
        },
      };

      if (this.config.password) {
        clientOptions.password = this.config.password;
      }

      if (this.config.username) {
        clientOptions.username = this.config.username;
      }

      if (this.config.tls) {
        clientOptions.socket.tls = true;
      }

      this.client = createClient(clientOptions);

      // Handle connection events
      this.client.on('error', (err) => {
        console.error('Redis Client Error:', err);
      });

      this.client.on('connect', () => {
        console.log('Redis connected');
      });

      this.client.on('ready', () => {
        console.log('Redis ready');
      });

      await this.client.connect();
      this.isConnected = true;
      console.log('Redis connection established');
    } catch (error) {
      console.error('Failed to connect to Redis:', error);
      throw error;
    }
  }

  /**
   * Get Redis client (ensure it's connected)
   */
  public getClient(): RedisClientType {
    if (!this.isConnected || !this.client) {
      throw new Error('Redis client not connected. Call connect() first.');
    }
    return this.client;
  }

  /**
   * Check if Redis is connected
   */
  public isReady(): boolean {
    return this.isConnected && !!this.client;
  }

  /**
   * Disconnect from Redis
   */
  public async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.quit();
      this.isConnected = false;
    }
  }

  /**
   * Get value by key
   */
  public async get(key: string): Promise<string | null> {
    if (!this.isReady()) {
      throw new Error('Redis not ready');
    }
    return await this.client!.get(key);
  }

  /**
   * Set value with expiration
   */
  public async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    if (!this.isReady()) {
      throw new Error('Redis not ready');
    }

    if (ttlSeconds) {
      await this.client!.set(key, value, { EX: ttlSeconds });
    } else {
      await this.client!.set(key, value);
    }
  }

  /**
   * Delete key
   */
  public async del(key: string): Promise<number> {
    if (!this.isReady()) {
      throw new Error('Redis not ready');
    }
    return await this.client!.del(key);
  }

  /**
   * Check if key exists
   */
  public async exists(key: string): Promise<boolean> {
    if (!this.isReady()) {
      throw new Error('Redis not ready');
    }
    const result = await this.client!.exists(key);
    return result === 1;
  }

  /**
   * Increment value
   */
  public async incr(key: string): Promise<number> {
    if (!this.isReady()) {
      throw new Error('Redis not ready');
    }
    return await this.client!.incr(key);
  }

}

// Singleton Redis manager instance
export const redisManager = new RedisManager();

// Initialize Redis connection
if (process.env.REDIS_ENABLED === 'true') {
  redisManager.connect().catch(error => {
    console.error('Failed to connect to Redis during initialization:', error);
  });
}

export default redisManager;