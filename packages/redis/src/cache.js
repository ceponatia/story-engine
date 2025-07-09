export class RedisCacheService {
    constructor(redis) {
        this.redis = redis;
    }
    async get(key) {
        const value = await this.redis.get(key);
        if (!value)
            return null;
        try {
            return JSON.parse(value);
        }
        catch (_a) {
            return value;
        }
    }
    async set(key, value, ttl) {
        const serialized = typeof value === "string" ? value : JSON.stringify(value);
        await this.redis.set(key, serialized, ttl);
    }
    async del(key) {
        await this.redis.del(key);
    }
    async clear() {
        throw new Error("Clear not implemented - use specific key patterns");
    }
}
