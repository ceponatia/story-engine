/**
 * Database Facade - Clean Re-export Layer
 *
 * Provides convenient access to all database clients without the complexity
 * of a centralized manager. Each database package manages its own connections
 * and lifecycle independently.
 */

// PostgreSQL
export { getDatabase as postgres, DatabasePoolManager } from "@story-engine/postgres";

// MongoDB
export { getMongoConnection as mongodb, MongoConnection } from "@story-engine/mongodb";

// Redis
export { RedisClient as redis } from "@story-engine/redis";

// Qdrant
export { QdrantService as qdrant } from "@story-engine/qdrant";

// Database configuration
export { DatabaseConfig } from "@story-engine/postgres";

// Health check utility
export async function checkAllDatabaseHealth() {
  const results = {
    postgres: false,
    mongodb: false,
    redis: false,
    qdrant: false,
  };

  try {
    // Check PostgreSQL
    const pgPool = postgres();
    results.postgres = await pgPool
      .query("SELECT 1")
      .then(() => true)
      .catch(() => false);
  } catch {
    results.postgres = false;
  }

  try {
    // Check MongoDB
    const mongoConn = mongodb();
    results.mongodb = await mongoConn.testConnection();
  } catch {
    results.mongodb = false;
  }

  try {
    // Check Redis
    const redisClient = new redis();
    results.redis = await redisClient.testConnection();
  } catch {
    results.redis = false;
  }

  try {
    // Check Qdrant
    const qdrantClient = new qdrant();
    results.qdrant = await qdrantClient.testConnection();
  } catch {
    results.qdrant = false;
  }

  return results;
}

// Overall health status
export async function getOverallHealthStatus() {
  const health = await checkAllDatabaseHealth();
  const healthyCount = Object.values(health).filter(Boolean).length;
  const totalCount = Object.keys(health).length;

  if (healthyCount === totalCount) return "healthy";
  if (healthyCount > 0) return "degraded";
  return "unhealthy";
}
