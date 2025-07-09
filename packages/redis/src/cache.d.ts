import { RedisManager } from "./client";
export interface CacheService {
    get<T>(key: string): Promise<T | null>;
    set<T>(key: string, value: T, ttl?: number): Promise<void>;
    del(key: string): Promise<void>;
    clear(): Promise<void>;
}
export declare class RedisCacheService implements CacheService {
    private redis;
    constructor(redis: RedisManager);
    get<T>(key: string): Promise<T | null>;
    set<T>(key: string, value: T, ttl?: number): Promise<void>;
    del(key: string): Promise<void>;
    clear(): Promise<void>;
}
//# sourceMappingURL=cache.d.ts.map