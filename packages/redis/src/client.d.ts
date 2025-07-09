import { Redis } from "ioredis";
export interface RedisManager {
    getClient(): Redis | null;
    get(key: string): Promise<string | null>;
    set(key: string, value: string, ttl?: number): Promise<void>;
    del(key: string): Promise<number>;
    exists(key: string): Promise<number>;
    testConnection(): Promise<boolean>;
}
export declare class RedisClient implements RedisManager {
    private client;
    constructor(url?: string);
    getClient(): Redis | null;
    get(key: string): Promise<string | null>;
    set(key: string, value: string, ttl?: number): Promise<void>;
    del(key: string): Promise<number>;
    exists(key: string): Promise<number>;
    testConnection(): Promise<boolean>;
    connect(): Promise<void>;
    disconnect(): Promise<void>;
}
//# sourceMappingURL=client.d.ts.map