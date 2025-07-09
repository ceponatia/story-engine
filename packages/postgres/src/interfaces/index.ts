/**
 * Database Interfaces Index
 *
 * Central export point for all database interfaces.
 * Provides clean imports for multi-database architecture components.
 */

// Database Manager Interfaces - TODO: implement missing interface
// export * from "./databaseManager.interface";
export * from "./repository.interface";

// Re-export key interfaces for convenience - TODO: implement missing interface
// export type {
//   IDatabaseManager,
//   IMultiDatabaseManager,
//   IPostgresManager,
//   IRedisManager,
//   IQdrantManager,
//   IMongoManager,
//   DatabaseConfig,
//   HealthStatus,
//   MultiDatabaseHealth,
//   DatabaseOperation,
//   FallbackStrategy,
//   Result,
//   CircuitState,
//   IDatabaseErrorHandler,
// } from "./database-manager.interface";

export type {
  IRepository,
  IRepositoryWithCache,
  IRepositoryWithTransaction,
  IAdvancedRepository,
  IRepositoryFactory,
  IRepositoryRegistry,
  ICharacterRepository,
  IAdventureRepository,
  IEmbeddingRepository,
  BaseRepository,
  CreateDTO,
  UpdateDTO,
  FilterOptions,
  PaginationOptions,
  PaginatedResult,
  RepositoryHealthStatus,
  RepositoryMetrics,
  RepositoryConfig,
} from "./repository.interface";
