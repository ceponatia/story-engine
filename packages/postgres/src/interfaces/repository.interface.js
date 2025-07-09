export class BaseRepository {
    constructor(dbManager) {
        this.dbManager = dbManager;
    }
    getCacheKey(id) {
        return `${this.getCachePrefix()}:${id}`;
    }
    getUserCacheKey(userId) {
        return `${this.getCachePrefix()}:user:${userId}`;
    }
    async withCache(key, operation, ttl = 300) {
        const cached = await this.dbManager.redis.get(key);
        if (cached) {
            return JSON.parse(cached);
        }
        const result = await operation();
        if (result) {
            await this.dbManager.redis.set(key, JSON.stringify(result), ttl);
        }
        return result;
    }
    async invalidateCache(key) {
        await this.dbManager.redis.del(key);
    }
}
