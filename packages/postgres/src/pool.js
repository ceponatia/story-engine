import { Pool } from "pg";
import { DatabaseConfig } from "./config";
export class DatabasePoolManager {
    static getPool() {
        if (!this.instance) {
            this.instance = this.createPool();
            this.setupLifecycleManagement();
        }
        return this.instance;
    }
    static createPool() {
        const config = DatabaseConfig.getInstance().getPostgresConfig();
        const pool = new Pool(config);
        pool.on("error", (err) => {
            console.error("Database pool error:", err.message);
        });
        pool.on("connect", () => {
            console.debug("New database connection established");
        });
        pool.on("remove", () => {
            console.debug("Database connection removed from pool");
        });
        return pool;
    }
    static setupLifecycleManagement() {
        if (this.shutdownInitiated)
            return;
        const gracefulShutdown = async (signal) => {
            if (this.shutdownInitiated)
                return;
            this.shutdownInitiated = true;
            console.log(`Received ${signal}, closing database pool gracefully...`);
            try {
                if (this.instance) {
                    await this.instance.end();
                    this.instance = null;
                    console.log("Database pool closed successfully");
                }
            }
            catch (error) {
                console.error("Error closing database pool:", error);
            }
            process.exit(0);
        };
        process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
        process.on("SIGINT", () => gracefulShutdown("SIGINT"));
    }
    static getPoolStats() {
        if (!this.instance)
            return null;
        return {
            totalCount: this.instance.totalCount,
            idleCount: this.instance.idleCount,
            waitingCount: this.instance.waitingCount,
        };
    }
    static async testConnection() {
        try {
            const pool = this.getPool();
            await pool.query("SELECT NOW()");
            return true;
        }
        catch (error) {
            console.error("Database connection test failed:", error);
            return false;
        }
    }
    static async forceShutdown() {
        if (this.instance) {
            await this.instance.end();
            this.instance = null;
            this.shutdownInitiated = false;
        }
    }
    static getDatabase() {
        return this.getPool();
    }
    getDatabase() {
        return DatabasePoolManager.getDatabase();
    }
    getTotalCount() {
        const stats = DatabasePoolManager.getPoolStats();
        return (stats === null || stats === void 0 ? void 0 : stats.totalCount) || 0;
    }
    getIdleCount() {
        const stats = DatabasePoolManager.getPoolStats();
        return (stats === null || stats === void 0 ? void 0 : stats.idleCount) || 0;
    }
    getWaitingCount() {
        const stats = DatabasePoolManager.getPoolStats();
        return (stats === null || stats === void 0 ? void 0 : stats.waitingCount) || 0;
    }
    async end() {
        return DatabasePoolManager.forceShutdown();
    }
}
DatabasePoolManager.instance = null;
DatabasePoolManager.shutdownInitiated = false;
export function getDatabase() {
    return DatabasePoolManager.getDatabase();
}
export async function testConnection() {
    return DatabasePoolManager.testConnection();
}
export default getDatabase;
