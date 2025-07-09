export { getDatabase as postgres, DatabasePoolManager } from "@story-engine/postgres";
export { getMongoConnection as mongodb, MongoConnection } from "@story-engine/mongodb";
export { RedisClient as redis } from "@story-engine/redis";
export { QdrantService as qdrant } from "@story-engine/qdrant";
export { DatabaseConfig } from "@story-engine/postgres";
export declare function checkAllDatabaseHealth(): Promise<{
    postgres: boolean;
    mongodb: boolean;
    redis: boolean;
    qdrant: boolean;
}>;
export declare function getOverallHealthStatus(): Promise<"healthy" | "degraded" | "unhealthy">;
//# sourceMappingURL=database.d.ts.map