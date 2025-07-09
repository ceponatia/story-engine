import { Redis } from "ioredis";

export interface RedisManager {
  getClient(): Redis | null;
  get(key: string): Promise<string | null>;
  set(key: string, value: string, ttl?: number): Promise<void>;
  del(key: string): Promise<number>;
  exists(key: string): Promise<number>;
  testConnection(): Promise<boolean>;
}

export class RedisClient implements RedisManager {
  private client: Redis | null = null;

  constructor(url?: string) {
    if (url) {
      this.client = new Redis(url);
    }
  }

  getClient(): Redis | null {
    return this.client;
  }

  async get(key: string): Promise<string | null> {
    return this.client?.get(key) ?? null;
  }

  async set(key: string, value: string, ttl?: number): Promise<void> {
    if (!this.client) throw new Error("Redis not connected");

    if (ttl) {
      await this.client.setex(key, ttl, value);
    } else {
      await this.client.set(key, value);
    }
  }

  async del(key: string): Promise<number> {
    return this.client?.del(key) ?? 0;
  }

  async exists(key: string): Promise<number> {
    return this.client?.exists(key) ?? 0;
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.client?.ping();
      return true;
    } catch {
      return false;
    }
  }

  async connect(): Promise<void> {
    // ioredis connects automatically
    if (this.client) {
      await this.client.ping();
    }
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.quit();
    }
  }
}
