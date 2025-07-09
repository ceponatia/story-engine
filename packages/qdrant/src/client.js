import { QdrantClient } from "@qdrant/js-client-rest";
export class QdrantService {
    constructor(url) {
        this.client = null;
        if (url) {
            this.client = new QdrantClient({ url });
        }
    }
    getClient() {
        return this.client;
    }
    async searchPoints(collection, query) {
        if (!this.client)
            throw new Error("Qdrant not connected");
        return this.client.search(collection, query);
    }
    async upsertPoints(collection, points) {
        if (!this.client)
            throw new Error("Qdrant not connected");
        return this.client.upsert(collection, { points });
    }
    async testConnection() {
        var _a;
        try {
            await ((_a = this.client) === null || _a === void 0 ? void 0 : _a.getCollections());
            return true;
        }
        catch (_b) {
            return false;
        }
    }
    async createCollection(name, config) {
        if (!this.client)
            throw new Error("Qdrant not connected");
        await this.client.createCollection(name, config);
    }
    async deleteCollection(name) {
        if (!this.client)
            throw new Error("Qdrant not connected");
        await this.client.deleteCollection(name);
    }
    async getCollections() {
        if (!this.client)
            throw new Error("Qdrant not connected");
        return this.client.getCollections();
    }
}
