import fs from "fs";
export class DatabaseConfig {
    constructor() {
    }
    static getInstance() {
        if (!this.instance) {
            this.instance = new DatabaseConfig();
            this.validateEnvironment();
            this.validated = true;
        }
        return this.instance;
    }
    static validateEnvironment() {
        const errors = [];
        const warnings = [];
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
                allowEmpty: true,
            },
            {
                name: "QDRANT_URL",
                description: "Qdrant vector database URL",
                example: "http://localhost:6333",
                allowEmpty: true,
            },
            {
                name: "MONGODB_URL",
                description: "MongoDB connection string",
                example: "mongodb://user:password@localhost:27017/database",
                allowEmpty: true,
            },
        ];
        for (const variable of requiredVars) {
            const value = process.env[variable.name];
            if (!value || value.trim() === "") {
                if (!variable.allowEmpty) {
                    errors.push({
                        variable: variable.name,
                        message: `Missing required environment variable: ${variable.name}\n` +
                            `Description: ${variable.description}\n` +
                            `Example: ${variable.example}`,
                        severity: "error",
                    });
                }
                else {
                    warnings.push({
                        variable: variable.name,
                        message: `Optional environment variable not set: ${variable.name}\n` +
                            `Will use default configuration for ${variable.description}\n` +
                            `Example: ${variable.example}`,
                        severity: "warning",
                    });
                }
            }
            else {
                if (variable.name.includes("URL")) {
                    try {
                        new URL(value);
                    }
                    catch (_a) {
                        errors.push({
                            variable: variable.name,
                            message: `Invalid URL format for ${variable.name}: ${value}\n` +
                                `Expected format: ${variable.example}`,
                            severity: "error",
                        });
                    }
                }
            }
        }
        const sslCertPath = process.env.DB_SSL_CA_PATH;
        if (sslCertPath && !fs.existsSync(sslCertPath)) {
            errors.push({
                variable: "DB_SSL_CA_PATH",
                message: `SSL certificate file not found: ${sslCertPath}`,
                severity: "error",
            });
        }
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
                        message: `Invalid numeric value for ${numVar.name}: ${value}\n` +
                            `Expected: number between ${numVar.min} and ${numVar.max}`,
                        severity: "error",
                    });
                }
            }
        }
        const result = {
            isValid: errors.length === 0,
            errors,
            warnings,
        };
        if (warnings.length > 0 && process.env.NODE_ENV !== "production") {
            console.warn("\n⚠️  Database Configuration Warnings:");
            warnings.forEach((warning) => {
                console.warn(`\n${warning.message}`);
            });
        }
        if (!result.isValid) {
            const errorMessage = "❌ Database Configuration Validation Failed:\n\n" +
                errors.map((error) => error.message).join("\n\n") +
                "\n\nPlease check your environment variables and try again.";
            throw new Error(errorMessage);
        }
        return result;
    }
    getPostgresConfig() {
        const connectionString = process.env.DATABASE_URL;
        const poolSize = parseInt(process.env.DB_POOL_SIZE || "20", 10);
        let sslConfig = false;
        if (process.env.NODE_ENV === "production") {
            sslConfig = { rejectUnauthorized: true };
            const sslCertPath = process.env.DB_SSL_CA_PATH;
            if (sslCertPath && fs.existsSync(sslCertPath)) {
                try {
                    sslConfig.ca = fs.readFileSync(sslCertPath, "utf8");
                }
                catch (error) {
                    console.warn("Failed to read SSL certificate file:", error);
                }
            }
        }
        return {
            connectionString,
            max: poolSize,
            idleTimeoutMillis: 30000,
            connectionTimeoutMillis: 2000,
            ssl: sslConfig,
        };
    }
    getRedisConfig() {
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
            enableOfflineQueue: false,
            maxRetriesPerRequest: 3,
            connectTimeout: 2000,
            commandTimeout: 1000,
        };
    }
    getQdrantConfig() {
        const host = process.env.QDRANT_HOST || "localhost";
        const port = parseInt(process.env.QDRANT_PORT || "6333", 10);
        const url = process.env.QDRANT_URL || `http://${host}:${port}`;
        return {
            url,
            host,
            port,
            apiKey: process.env.QDRANT_API_KEY,
            timeout: parseInt(process.env.QDRANT_TIMEOUT_MS || "30000", 10),
            checkCompatibility: false,
        };
    }
    getMongoConfig() {
        const mongoUrl = process.env.MONGODB_URI || "mongodb://localhost:27017";
        const database = process.env.MONGODB_DATABASE || "storyengine";
        return {
            url: mongoUrl,
            database,
            options: {
                maxPoolSize: parseInt(process.env.MONGODB_MAX_POOL_SIZE || "10", 10),
                minPoolSize: parseInt(process.env.MONGODB_MIN_POOL_SIZE || "1", 10),
                maxIdleTimeMS: 30000,
                serverSelectionTimeoutMS: 5000,
                socketTimeoutMS: 45000,
                retryWrites: true,
                retryReads: true,
            },
        };
    }
    getAllConfigs() {
        return {
            postgres: this.getPostgresConfig(),
            redis: this.getRedisConfig(),
            qdrant: this.getQdrantConfig(),
            mongodb: this.getMongoConfig(),
        };
    }
    getEnvironmentSettings() {
        const nodeEnv = process.env.NODE_ENV || "development";
        return {
            isDevelopment: nodeEnv === "development",
            isProduction: nodeEnv === "production",
            isTest: nodeEnv === "test",
            logLevel: process.env.LOG_LEVEL || (nodeEnv === "production" ? "info" : "debug"),
            enableDebugLogging: process.env.DEBUG_DB === "true" || nodeEnv === "development",
        };
    }
    getConfigurationStatus() {
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
                hasAuth: mongoConfig.url.includes("@"),
            },
        };
    }
    static revalidate() {
        this.validated = false;
        return this.validateEnvironment();
    }
    static isValidated() {
        return this.validated;
    }
    static reset() {
        this.instance = null;
        this.validated = false;
    }
}
DatabaseConfig.instance = null;
DatabaseConfig.validated = false;
export function getDatabaseConfig() {
    return DatabaseConfig.getInstance();
}
export function validateDatabaseConfig() {
    return DatabaseConfig.validateEnvironment();
}
export default DatabaseConfig;
