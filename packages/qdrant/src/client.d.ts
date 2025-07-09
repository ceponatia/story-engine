import { QdrantClient } from "@qdrant/js-client-rest";
export interface QdrantManager {
    getClient(): QdrantClient | null;
    searchPoints(collection: string, query: any): Promise<any>;
    upsertPoints(collection: string, points: any[]): Promise<any>;
    testConnection(): Promise<boolean>;
}
export declare class QdrantService implements QdrantManager {
    private client;
    constructor(url?: string);
    getClient(): QdrantClient | null;
    searchPoints(collection: string, query: any): Promise<any>;
    upsertPoints(collection: string, points: any[]): Promise<any>;
    testConnection(): Promise<boolean>;
    createCollection(name: string, config: any): Promise<void>;
    deleteCollection(name: string): Promise<void>;
    getCollections(): Promise<any>;
}
//# sourceMappingURL=client.d.ts.map