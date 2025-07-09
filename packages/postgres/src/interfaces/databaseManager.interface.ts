/**
 * Database Manager Interface
 *
 * Core interface for multi-database coordination and management.
 * Supports PostgreSQL, Redis, Qdrant, and MongoDB with unified access patterns.
 */

import { PoolClient } from "pg";

// Health Status Types
export interface HealthStatus {
  status: "healthy" | "degraded" | "unhealthy";
  latency?: number;
  lastChecked: Date;
  details?: Record<string, unknown>;
}

export interface MultiDatabaseHealth {
  postgres: HealthStatus;
  redis: HealthStatus;
  qdrant: HealthStatus;
  mongodb: HealthStatus;
  overall: "healthy" | "degraded" | "unhealthy";
}

// Database Configuration Types
export interface PostgresConfig {
  connectionString: string;
  max: number;
  ssl?: boolean | { rejectUnauthorized: boolean };
}

export interface RedisConfig {
  url: string;
  password?: string;
  maxMemory?: string;
  evictionPolicy?: string;
}

export interface QdrantConfig {
  url: string;
  apiKey?: string;
  timeout?: number;
}

export interface MongoConfig {
  url: string;
  database: string;
  options?: Record<string, unknown>;
}

export interface DatabaseConfig {
  postgres: PostgresConfig;
  redis: RedisConfig;
  qdrant: QdrantConfig;
  mongodb: MongoConfig;
}

// Core Database Manager Interface
export interface IDatabaseManager<T> {
  getClient(): T;
  testConnection(): Promise<boolean>;
  shutdown(): Promise<void>;
  getHealthStatus(): Promise<HealthStatus>;
  onError(callback: (error: Error) => void): void;
}

// Specialized Manager Interfaces
export interface IPostgresManager extends IDatabaseManager<any> {
  getClient(): any; // Returns Pool or PoolClient
  getTransaction(): Promise<PoolClient>;
  query(text: string, params?: any[]): Promise<any>;
}

export interface IRedisManager extends IDatabaseManager<any> {
  getClient(): any;
  get(key: string): Promise<string | null>;
  set(key: string, value: string, ttl?: number): Promise<void>;
  del(key: string): Promise<number>;
  exists(key: string): Promise<number>;
  flushall(): Promise<void>;
}

export interface IQdrantManager extends IDatabaseManager<any> {
  getClient(): any;
  createCollection(name: string, config: any): Promise<void>;
  searchPoints(collection: string, query: any): Promise<any>;
  upsertPoints(collection: string, points: any[]): Promise<void>;
  deletePoints(collection: string, ids: string[]): Promise<void>;
}

export interface IMongoManager extends IDatabaseManager<any> {
  getClient(): any;
  getDatabase(): any;
  getCollection(name: string): any;
  insertOne(collection: string, document: any): Promise<any>;
  findOne(collection: string, filter: any): Promise<any>;
  updateOne(collection: string, filter: any, update: any): Promise<any>;
  deleteOne(collection: string, filter: any): Promise<any>;
}

// Multi-Database Manager Interface
export interface IMultiDatabaseManager {
  postgres: IPostgresManager;
  redis: IRedisManager;
  qdrant: IQdrantManager;
  mongodb: IMongoManager;

  // Health and Status
  getHealthStatus(): Promise<MultiDatabaseHealth>;
  testAllConnections(): Promise<boolean>;

  // Transaction Coordination
  executeWithFallback<T>(
    operation: DatabaseOperation<T>,
    strategy?: FallbackStrategy
  ): Promise<Result<T>>;

  // Lifecycle Management
  initialize(): Promise<void>;
  shutdown(): Promise<void>;
}

// Operation Types
export type DatabaseOperation<T> = (manager: IMultiDatabaseManager) => Promise<T>;

export enum FallbackStrategy {
  CACHE_THEN_ERROR = "cache_then_error",
  CACHE_THEN_FALLBACK = "cache_then_fallback",
  ERROR_IMMEDIATELY = "error_immediately",
  DEGRADE_GRACEFULLY = "degrade_gracefully",
}

export interface Result<T> {
  success: boolean;
  data?: T;
  error?: string;
  fromCache?: boolean;
  degraded?: boolean;
}

// Circuit Breaker Types
export enum CircuitState {
  CLOSED = "closed",
  OPEN = "open",
  HALF_OPEN = "half_open",
}

export interface CircuitBreakerOptions {
  failureThreshold?: number;
  recoveryTimeout?: number;
  monitoringPeriod?: number;
}

export interface ICircuitBreaker {
  execute<T>(
    operationName: string,
    operation: () => Promise<T>,
    options?: CircuitBreakerOptions
  ): Promise<T>;

  getState(operationName: string): CircuitState;
  reset(operationName: string): void;
}

// Error Handling Types
export enum DatabaseErrorType {
  CONNECTION_ERROR = "connection_error",
  TIMEOUT_ERROR = "timeout_error",
  CONSTRAINT_VIOLATION = "constraint_violation",
  RATE_LIMIT_ERROR = "rate_limit_error",
  UNKNOWN_ERROR = "unknown_error",
}

export interface SafeErrorResponse {
  success: false;
  error: string;
  errorCode: string;
  timestamp: string;
  debugInfo?: string;
}

export interface IDatabaseErrorHandler {
  classify(error: Error): DatabaseErrorType;
  createSafeErrorResponse(error: Error): SafeErrorResponse;
  shouldRetry(error: Error): boolean;
}
