export { getDatabase as postgres } from "@story-engine/postgres";
export { getMongoConnection as mongodb, MongoConnection } from "@story-engine/mongodb";
export { RedisClient as redis } from "@story-engine/redis";
export { QdrantService as qdrant } from "@story-engine/qdrant";
export { DatabaseConfig } from "@story-engine/postgres";
export async function checkAllDatabaseHealth() {
    const results = {
        postgres: false,
        mongodb: false,
        redis: false,
        qdrant: false,
    };
    try {
        const pgPool = postgres();
        results.postgres = await pgPool
            .query("SELECT 1")
            .then(() => true)
            .catch(() => false);
    }
    catch (_a) {
        results.postgres = false;
    }
    try {
        const mongoConn = mongodb();
        results.mongodb = await mongoConn.testConnection();
    }
    catch (_b) {
        results.mongodb = false;
    }
    try {
        const redisClient = new redis();
        results.redis = await redisClient.testConnection();
    }
    catch (_c) {
        results.redis = false;
    }
    try {
        const qdrantClient = new qdrant();
        results.qdrant = await qdrantClient.testConnection();
    }
    catch (_d) {
        results.qdrant = false;
    }
    return results;
}
export async function getOverallHealthStatus() {
    const health = await checkAllDatabaseHealth();
    const healthyCount = Object.values(health).filter(Boolean).length;
    const totalCount = Object.keys(health).length;
    if (healthyCount === totalCount)
        return "healthy";
    if (healthyCount > 0)
        return "degraded";
    return "unhealthy";
}
