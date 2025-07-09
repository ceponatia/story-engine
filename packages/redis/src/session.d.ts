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
export declare class RedisSessionService implements SessionService {
    private redis;
    private readonly keyPrefix;
    private readonly defaultTtl;
    constructor(redis: RedisManager);
    private getKey;
    create(sessionId: string, data: SessionData, ttl?: number): Promise<void>;
    get(sessionId: string): Promise<SessionData | null>;
    update(sessionId: string, data: Partial<SessionData>): Promise<void>;
    destroy(sessionId: string): Promise<void>;
    refresh(sessionId: string, ttl?: number): Promise<void>;
}
//# sourceMappingURL=session.d.ts.map