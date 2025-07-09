import { MongoClient, Db, Collection } from "mongodb";

interface MongoConfig {
  url: string;
  options?: any;
}

export interface MongoManager {
  getClient(): MongoClient | null;
  getDatabase(): Db | null;
  getCollection<T = any>(name: string): Collection<T>;
  testConnection(): Promise<boolean>;
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  isConnected(): boolean;
}

export class MongoConnection implements MongoManager {
  private client: MongoClient | null = null;
  private database: Db | null = null;
  private connected = false;

  constructor() {
    this.initialize();
  }

  private initialize(): void {
    const mongoConfig = this.getMongoConfig();
    this.client = new MongoClient(mongoConfig.url, mongoConfig.options);
  }

  private getMongoConfig(): MongoConfig {
    const url = process.env.MONGODB_URL || "mongodb://localhost:27017/storyengine";
    return {
      url,
      options: {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      },
    };
  }

  async connect(): Promise<void> {
    if (this.connected) return;

    try {
      await this.client?.connect();
      this.database = this.client?.db("storyengine") || null;
      this.connected = true;
    } catch (error) {
      console.error("MongoDB connection failed:", error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (!this.connected) return;

    try {
      await this.client?.close();
      this.connected = false;
      this.database = null;
    } catch (error) {
      console.error("MongoDB disconnect failed:", error);
    }
  }

  isConnected(): boolean {
    return this.connected;
  }

  getClient(): MongoClient | null {
    return this.client;
  }

  getDatabase(): Db | null {
    return this.database;
  }

  getCollection<T = any>(name: string): Collection<T> {
    if (!this.database) {
      throw new Error("MongoDB not connected");
    }
    return this.database.collection<T>(name);
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.client?.db().admin().ping();
      return true;
    } catch {
      return false;
    }
  }
}

// Export singleton instance
let mongoInstance: MongoConnection | null = null;

export function getMongoConnection(): MongoConnection {
  if (!mongoInstance) {
    mongoInstance = new MongoConnection();
  }
  return mongoInstance;
}

// Auto-connect in production
if (process.env.NODE_ENV === "production") {
  getMongoConnection().connect().catch(console.error);
}
