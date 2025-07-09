import { QdrantClient } from "@qdrant/js-client-rest";

export interface QdrantManager {
  getClient(): QdrantClient | null;
  searchPoints(collection: string, query: any): Promise<any>;
  upsertPoints(collection: string, points: any[]): Promise<any>;
  testConnection(): Promise<boolean>;
}

export class QdrantService implements QdrantManager {
  private client: QdrantClient | null = null;

  constructor(url?: string) {
    if (url) {
      this.client = new QdrantClient({ url });
    }
  }

  getClient(): QdrantClient | null {
    return this.client;
  }

  async searchPoints(collection: string, query: any): Promise<any> {
    if (!this.client) throw new Error("Qdrant not connected");
    return this.client.search(collection, query);
  }

  async upsertPoints(collection: string, points: any[]): Promise<any> {
    if (!this.client) throw new Error("Qdrant not connected");
    return this.client.upsert(collection, { points });
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.client?.getCollections();
      return true;
    } catch {
      return false;
    }
  }

  async createCollection(name: string, config: any): Promise<void> {
    if (!this.client) throw new Error("Qdrant not connected");
    await this.client.createCollection(name, config);
  }

  async deleteCollection(name: string): Promise<void> {
    if (!this.client) throw new Error("Qdrant not connected");
    await this.client.deleteCollection(name);
  }

  async getCollections(): Promise<any> {
    if (!this.client) throw new Error("Qdrant not connected");
    return this.client.getCollections();
  }
}
