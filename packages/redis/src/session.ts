import { RedisManager } from "./client";

export interface SessionData {
  userId: string;
  email: string;
  [key: string]: any;
}

export interface SessionService {
  create(sessionId: string, data: SessionData, ttl?: number): Promise<void>;
  get(sessionId: string): Promise<SessionData | null>;
  update(sessionId: string, data: Partial<SessionData>): Promise<void>;
  destroy(sessionId: string): Promise<void>;
  refresh(sessionId: string, ttl?: number): Promise<void>;
}

export class RedisSessionService implements SessionService {
  private readonly keyPrefix = "session:";
  private readonly defaultTtl = 60 * 60 * 24 * 7; // 7 days

  constructor(private redis: RedisManager) {}

  private getKey(sessionId: string): string {
    return `${this.keyPrefix}${sessionId}`;
  }

  async create(sessionId: string, data: SessionData, ttl?: number): Promise<void> {
    const key = this.getKey(sessionId);
    await this.redis.set(key, JSON.stringify(data), ttl || this.defaultTtl);
  }

  async get(sessionId: string): Promise<SessionData | null> {
    const key = this.getKey(sessionId);
    const value = await this.redis.get(key);

    if (!value) return null;

    try {
      return JSON.parse(value) as SessionData;
    } catch {
      return null;
    }
  }

  async update(sessionId: string, data: Partial<SessionData>): Promise<void> {
    const existing = await this.get(sessionId);
    if (!existing) {
      throw new Error("Session not found");
    }

    const updated = { ...existing, ...data };
    const key = this.getKey(sessionId);
    await this.redis.set(key, JSON.stringify(updated));
  }

  async destroy(sessionId: string): Promise<void> {
    const key = this.getKey(sessionId);
    await this.redis.del(key);
  }

  async refresh(sessionId: string, ttl?: number): Promise<void> {
    const data = await this.get(sessionId);
    if (data) {
      await this.create(sessionId, data, ttl || this.defaultTtl);
    }
  }
}
