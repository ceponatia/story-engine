import { RedisManager } from "./client";

export interface CacheService {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttl?: number): Promise<void>;
  del(key: string): Promise<void>;
  clear(): Promise<void>;
}

export class RedisCacheService implements CacheService {
  constructor(private redis: RedisManager) {}

  async get<T>(key: string): Promise<T | null> {
    const value = await this.redis.get(key);
    if (!value) return null;

    try {
      return JSON.parse(value) as T;
    } catch {
      return value as T;
    }
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    const serialized = typeof value === "string" ? value : JSON.stringify(value);
    await this.redis.set(key, serialized, ttl);
  }

  async del(key: string): Promise<void> {
    await this.redis.del(key);
  }

  async clear(): Promise<void> {
    // Implementation would depend on Redis client capabilities
    // For now, this is a placeholder
    throw new Error("Clear not implemented - use specific key patterns");
  }
}
