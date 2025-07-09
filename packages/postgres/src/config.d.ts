export interface PostgresConfig {
    connectionString: string;
    max: number;
    idleTimeoutMillis: number;
    connectionTimeoutMillis: number;
    ssl: boolean | {
        rejectUnauthorized: boolean;
        ca?: string;
    };
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
export declare class DatabaseConfig {
    private static instance;
    private static validated;
    private constructor();
    static getInstance(): DatabaseConfig;
    static validateEnvironment(): ConfigValidationResult;
    getPostgresConfig(): PostgresConfig;
    getRedisConfig(): RedisConfig;
    getQdrantConfig(): QdrantConfig;
    getMongoConfig(): MongoConfig;
    getAllConfigs(): DatabaseConfigBundle;
    getEnvironmentSettings(): {
        isDevelopment: boolean;
        isProduction: boolean;
        isTest: boolean;
        logLevel: string;
        enableDebugLogging: boolean;
    };
    getConfigurationStatus(): {
        postgres: {
            configured: boolean;
            hasSSL: boolean;
        };
        redis: {
            configured: boolean;
            hasAuth: boolean;
        };
        qdrant: {
            configured: boolean;
            hasAuth: boolean;
        };
        mongodb: {
            configured: boolean;
            hasAuth: boolean;
        };
    };
    static revalidate(): ConfigValidationResult;
    static isValidated(): boolean;
    static reset(): void;
}
export declare function getDatabaseConfig(): DatabaseConfig;
export declare function validateDatabaseConfig(): ConfigValidationResult;
export default DatabaseConfig;
//# sourceMappingURL=config.d.ts.map