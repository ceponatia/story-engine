import { Pool } from "pg";
export interface DatabasePoolConfig {
    connectionString: string;
    max: number;
    idleTimeoutMillis: number;
    connectionTimeoutMillis: number;
    ssl?: boolean | object;
}
export interface PoolStats {
    totalCount: number;
    idleCount: number;
    waitingCount: number;
}
export declare class DatabasePoolManager {
    private static instance;
    private static shutdownInitiated;
    static getPool(): Pool;
    private static createPool;
    private static setupLifecycleManagement;
    static getPoolStats(): PoolStats | null;
    static testConnection(): Promise<boolean>;
    static forceShutdown(): Promise<void>;
    static getDatabase(): Pool;
    getDatabase(): Pool;
    getTotalCount(): number;
    getIdleCount(): number;
    getWaitingCount(): number;
    end(): Promise<void>;
}
export declare function getDatabase(): Pool;
export declare function testConnection(): Promise<boolean>;
export default getDatabase;
//# sourceMappingURL=pool.d.ts.map