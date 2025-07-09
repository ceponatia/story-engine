import { Redis } from "ioredis";
export class RedisClient {
    constructor(url) {
        this.client = null;
        if (url) {
            this.client = new Redis(url);
        }
    }
    getClient() {
        return this.client;
    }
    async get(key) {
        var _a, _b;
        return (_b = (_a = this.client) === null || _a === void 0 ? void 0 : _a.get(key)) !== null && _b !== void 0 ? _b : null;
    }
    async set(key, value, ttl) {
        if (!this.client)
            throw new Error("Redis not connected");
        if (ttl) {
            await this.client.setex(key, ttl, value);
        }
        else {
            await this.client.set(key, value);
        }
    }
    async del(key) {
        var _a, _b;
        return (_b = (_a = this.client) === null || _a === void 0 ? void 0 : _a.del(key)) !== null && _b !== void 0 ? _b : 0;
    }
    async exists(key) {
        var _a, _b;
        return (_b = (_a = this.client) === null || _a === void 0 ? void 0 : _a.exists(key)) !== null && _b !== void 0 ? _b : 0;
    }
    async testConnection() {
        var _a;
        try {
            await ((_a = this.client) === null || _a === void 0 ? void 0 : _a.ping());
            return true;
        }
        catch (_b) {
            return false;
        }
    }
    async connect() {
        if (this.client) {
            await this.client.ping();
        }
    }
    async disconnect() {
        if (this.client) {
            await this.client.quit();
        }
    }
}
