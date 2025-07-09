export class RedisSessionService {
    constructor(redis) {
        this.redis = redis;
        this.keyPrefix = "session:";
        this.defaultTtl = 60 * 60 * 24 * 7;
    }
    getKey(sessionId) {
        return `${this.keyPrefix}${sessionId}`;
    }
    async create(sessionId, data, ttl) {
        const key = this.getKey(sessionId);
        await this.redis.set(key, JSON.stringify(data), ttl || this.defaultTtl);
    }
    async get(sessionId) {
        const key = this.getKey(sessionId);
        const value = await this.redis.get(key);
        if (!value)
            return null;
        try {
            return JSON.parse(value);
        }
        catch (_a) {
            return null;
        }
    }
    async update(sessionId, data) {
        const existing = await this.get(sessionId);
        if (!existing) {
            throw new Error("Session not found");
        }
        const updated = Object.assign(Object.assign({}, existing), data);
        const key = this.getKey(sessionId);
        await this.redis.set(key, JSON.stringify(updated));
    }
    async destroy(sessionId) {
        const key = this.getKey(sessionId);
        await this.redis.del(key);
    }
    async refresh(sessionId, ttl) {
        const data = await this.get(sessionId);
        if (data) {
            await this.create(sessionId, data, ttl || this.defaultTtl);
        }
    }
}
