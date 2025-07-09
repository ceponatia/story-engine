import fs from "fs";
import path from "path";

// Centralized configuration interfaces for all database services
export interface PostgresConfig {
  connectionString: string;
  max: number;
  idleTimeoutMillis: number;
  connectionTimeoutMillis: number;
  ssl: boolean | { rejectUnauthorized: boolean; ca?: string };
}

export interface RedisConfig {
  url: string;
  host: string;
  port: number;
  password?: string;
  db: number;
  maxRetries: number;
  retryDelayOnFailover: number;
  enableOfflineQueue: boolean;
  maxRetriesPerRequest: number;
  connectTimeout: number;
  commandTimeout: number;
}

export interface QdrantConfig {
  url: string;
  host: string;
  port: number;
  apiKey?: string;
  timeout: number;
  checkCompatibility: boolean;
}

export interface MongoConfig {
  url: string;
  database: string;
  options: {
    maxPoolSize: number;
    minPoolSize: number;
    maxIdleTimeMS: number;
    serverSelectionTimeoutMS: number;
    socketTimeoutMS: number;
    retryWrites: boolean;
    retryReads: boolean;
  };
}

export interface DatabaseConfigBundle {
  postgres: PostgresConfig;
  redis: RedisConfig;
  qdrant: QdrantConfig;
  mongodb: MongoConfig;
}

// Environment validation and error types
export interface ValidationError {
  variable: string;
  message: string;
  severity: "error" | "warning";
}

export interface ConfigValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
}

/**
 * Centralized Database Configuration Manager
 *
 * Implements singleton pattern for consistent configuration access across the application.
 * Provides type-safe configuration objects for PostgreSQL, Redis, Qdrant, and MongoDB.
 * Validates environment variables on initialization with clear error messages.
 *
 * Key Features:
 * - Environment variable validation with descriptive error messages
 * - Production vs development environment handling
 * - Security-first SSL configuration
 * - Consistent timeout and connection defaults
 * - Type-safe configuration access
 *
 * Usage:
 * ```typescript
 * const config = DatabaseConfig.getInstance();
 * const pgConfig = config.getPostgresConfig();
 * const redisConfig = config.getRedisConfig();
 * ```
 */
export class DatabaseConfig {
  private static instance: DatabaseConfig | null = null;
  private static validated = false;

  private constructor() {
    // Private constructor enforces singleton pattern
  }

  /**
   * Get the singleton DatabaseConfig instance
   * Validates environment variables on first access
   */
  static getInstance(): DatabaseConfig {
    if (!this.instance) {
      this.instance = new DatabaseConfig();
      this.validateEnvironment();
      this.validated = true;
    }
    return this.instance;
  }

  /**
   * Validate all required environment variables
   * Throws detailed error messages for missing or invalid variables
   */
  static validateEnvironment(): ConfigValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];

    // Required environment variables for each database service
    const requiredVars = [
      {
        name: "DATABASE_URL",
        description: "PostgreSQL connection string",
        example: "postgresql://user:password@localhost:5432/database",
      },
      {
        name: "REDIS_URL",
        description: "Redis connection URL",
        example: "redis://localhost:6379",
        allowEmpty: true, // Redis can use defaults
      },
      {
        name: "QDRANT_URL",
        description: "Qdrant vector database URL",
        example: "http://localhost:6333",
        allowEmpty: true, // Qdrant can use defaults
      },
      {
        name: "MONGODB_URL",
        description: "MongoDB connection string",
        example: "mongodb://user:password@localhost:27017/database",
        allowEmpty: true, // MongoDB can use defaults
      },
    ];

    // Validate each required variable
    for (const variable of requiredVars) {
      const value = process.env[variable.name];

      if (!value || value.trim() === "") {
        if (!variable.allowEmpty) {
          errors.push({
            variable: variable.name,
            message:
              `Missing required environment variable: ${variable.name}\n` +
              `Description: ${variable.description}\n` +
              `Example: ${variable.example}`,
            severity: "error",
          });
        } else {
          warnings.push({
            variable: variable.name,
            message:
              `Optional environment variable not set: ${variable.name}\n` +
              `Will use default configuration for ${variable.description}\n` +
              `Example: ${variable.example}`,
            severity: "warning",
          });
        }
      } else {
        // Validate URL format for connection strings
        if (variable.name.includes("URL")) {
          try {
            new URL(value);
          } catch {
            errors.push({
              variable: variable.name,
              message:
                `Invalid URL format for ${variable.name}: ${value}\n` +
                `Expected format: ${variable.example}`,
              severity: "error",
            });
          }
        }
      }
    }

    // Validate SSL certificate path if specified
    const sslCertPath = process.env.DB_SSL_CA_PATH;
    if (sslCertPath && !fs.existsSync(sslCertPath)) {
      errors.push({
        variable: "DB_SSL_CA_PATH",
        message: `SSL certificate file not found: ${sslCertPath}`,
        severity: "error",
      });
    }

    // Validate numeric environment variables
    const numericVars = [
      { name: "DB_POOL_SIZE", defaultValue: "20", min: 1, max: 100 },
      { name: "REDIS_PORT", defaultValue: "6379", min: 1, max: 65535 },
      { name: "QDRANT_PORT", defaultValue: "6333", min: 1, max: 65535 },
      { name: "QDRANT_TIMEOUT_MS", defaultValue: "30000", min: 1000, max: 300000 },
    ];

    for (const numVar of numericVars) {
      const value = process.env[numVar.name];
      if (value) {
        const parsed = parseInt(value, 10);
        if (isNaN(parsed) || parsed < numVar.min || parsed > numVar.max) {
          errors.push({
            variable: numVar.name,
            message:
              `Invalid numeric value for ${numVar.name}: ${value}\n` +
              `Expected: number between ${numVar.min} and ${numVar.max}`,
            severity: "error",
          });
        }
      }
    }

    const result: ConfigValidationResult = {
      isValid: errors.length === 0,
      errors,
      warnings,
    };

    // Log warnings in development
    if (warnings.length > 0 && process.env.NODE_ENV !== "production") {
      console.warn("\n⚠️  Database Configuration Warnings:");
      warnings.forEach((warning) => {
        console.warn(`\n${warning.message}`);
      });
    }

    // Throw error if validation fails
    if (!result.isValid) {
      const errorMessage =
        "❌ Database Configuration Validation Failed:\n\n" +
        errors.map((error) => error.message).join("\n\n") +
        "\n\nPlease check your environment variables and try again.";

      throw new Error(errorMessage);
    }

    return result;
  }

  /**
   * Get PostgreSQL configuration with security-first SSL handling
   */
  getPostgresConfig(): PostgresConfig {
    const connectionString = process.env.DATABASE_URL!;
    const poolSize = parseInt(process.env.DB_POOL_SIZE || "20", 10);

    // Production SSL configuration with proper certificate handling
    let sslConfig: boolean | { rejectUnauthorized: boolean; ca?: string } = false;

    if (process.env.NODE_ENV === "production") {
      sslConfig = { rejectUnauthorized: true };

      // Add CA certificate if provided
      const sslCertPath = process.env.DB_SSL_CA_PATH;
      if (sslCertPath && fs.existsSync(sslCertPath)) {
        try {
          sslConfig.ca = fs.readFileSync(sslCertPath, "utf8");
        } catch (error) {
          console.warn("Failed to read SSL certificate file:", error);
          // Continue with SSL enabled but without custom CA
        }
      }
    }

    return {
      connectionString,
      max: poolSize,
      idleTimeoutMillis: 30000, // 30 seconds
      connectionTimeoutMillis: 2000, // 2 seconds
      ssl: sslConfig,
    };
  }

  /**
   * Get Redis configuration with comprehensive connection options
   */
  getRedisConfig(): RedisConfig {
    const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";
    const host = process.env.REDIS_HOST || "localhost";
    const port = parseInt(process.env.REDIS_PORT || "6379", 10);

    return {
      url: redisUrl,
      host,
      port,
      password: process.env.REDIS_PASSWORD,
      db: parseInt(process.env.REDIS_DB || "0", 10),
      maxRetries: 3,
      retryDelayOnFailover: 100,
      enableOfflineQueue: false, // Fail fast for better error handling
      maxRetriesPerRequest: 3,
      connectTimeout: 2000, // 2 seconds, matches PostgreSQL
      commandTimeout: 1000, // 1 second for fast cache operations
    };
  }

  /**
   * Get Qdrant configuration with timeout and API key handling
   */
  getQdrantConfig(): QdrantConfig {
    const host = process.env.QDRANT_HOST || "localhost";
    const port = parseInt(process.env.QDRANT_PORT || "6333", 10);
    const url = process.env.QDRANT_URL || `http://${host}:${port}`;

    return {
      url,
      host,
      port,
      apiKey: process.env.QDRANT_API_KEY,
      timeout: parseInt(process.env.QDRANT_TIMEOUT_MS || "30000", 10),
      checkCompatibility: false, // Allow version mismatch between client and server
    };
  }

  /**
   * Get MongoDB configuration with connection pooling and retry options
   */
  getMongoConfig(): MongoConfig {
    const mongoUrl = process.env.MONGODB_URI || "mongodb://localhost:27017";
    const database = process.env.MONGODB_DATABASE || "storyengine";

    return {
      url: mongoUrl,
      database,
      options: {
        maxPoolSize: parseInt(process.env.MONGODB_MAX_POOL_SIZE || "10", 10),
        minPoolSize: parseInt(process.env.MONGODB_MIN_POOL_SIZE || "1", 10),
        maxIdleTimeMS: 30000, // 30 seconds
        serverSelectionTimeoutMS: 5000, // 5 seconds
        socketTimeoutMS: 45000, // 45 seconds
        retryWrites: true,
        retryReads: true,
      },
    };
  }

  /**
   * Get all database configurations as a bundle
   * Useful for passing to MultiDatabaseManager constructor
   */
  getAllConfigs(): DatabaseConfigBundle {
    return {
      postgres: this.getPostgresConfig(),
      redis: this.getRedisConfig(),
      qdrant: this.getQdrantConfig(),
      mongodb: this.getMongoConfig(),
    };
  }

  /**
   * Get environment-specific configuration settings
   */
  getEnvironmentSettings(): {
    isDevelopment: boolean;
    isProduction: boolean;
    isTest: boolean;
    logLevel: string;
    enableDebugLogging: boolean;
  } {
    const nodeEnv = process.env.NODE_ENV || "development";

    return {
      isDevelopment: nodeEnv === "development",
      isProduction: nodeEnv === "production",
      isTest: nodeEnv === "test",
      logLevel: process.env.LOG_LEVEL || (nodeEnv === "production" ? "info" : "debug"),
      enableDebugLogging: process.env.DEBUG_DB === "true" || nodeEnv === "development",
    };
  }

  /**
   * Test if all database services are configured
   * Returns configuration status for monitoring/health checks
   */
  getConfigurationStatus(): {
    postgres: { configured: boolean; hasSSL: boolean };
    redis: { configured: boolean; hasAuth: boolean };
    qdrant: { configured: boolean; hasAuth: boolean };
    mongodb: { configured: boolean; hasAuth: boolean };
  } {
    const postgresConfig = this.getPostgresConfig();
    const redisConfig = this.getRedisConfig();
    const qdrantConfig = this.getQdrantConfig();
    const mongoConfig = this.getMongoConfig();

    return {
      postgres: {
        configured: !!postgresConfig.connectionString,
        hasSSL: !!postgresConfig.ssl,
      },
      redis: {
        configured: !!redisConfig.url,
        hasAuth: !!redisConfig.password,
      },
      qdrant: {
        configured: !!qdrantConfig.url,
        hasAuth: !!qdrantConfig.apiKey,
      },
      mongodb: {
        configured: !!mongoConfig.url,
        hasAuth: mongoConfig.url.includes("@"), // Simple check for username/password
      },
    };
  }

  /**
   * Force re-validation of environment variables
   * Useful for testing or configuration changes
   */
  static revalidate(): ConfigValidationResult {
    this.validated = false;
    return this.validateEnvironment();
  }

  /**
   * Check if configuration has been validated
   */
  static isValidated(): boolean {
    return this.validated;
  }

  /**
   * Reset singleton instance (for testing purposes)
   */
  static reset(): void {
    this.instance = null;
    this.validated = false;
  }
}

// Export convenience functions for backward compatibility
export function getDatabaseConfig(): DatabaseConfig {
  return DatabaseConfig.getInstance();
}

export function validateDatabaseConfig(): ConfigValidationResult {
  return DatabaseConfig.validateEnvironment();
}

// Default export
export default DatabaseConfig;
