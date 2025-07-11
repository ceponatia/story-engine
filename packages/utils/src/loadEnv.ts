import dotenv from "dotenv";
import path from "path";

/**
 * Standardized environment variable loader for standalone Node.js scripts
 *
 * This utility ensures consistent loading of environment variables from .env.local
 * across all standalone scripts in the monorepo. It follows Next.js conventions
 * where .env.local is used for development environment variables.
 *
 * @param envPath - Path to environment file (default: ".env.local")
 * @param options - Additional dotenv configuration options
 *
 * @example
 * ```typescript
 * import { loadEnv } from "@story-engine/utils";
 *
 * // Load from default .env.local
 * loadEnv();
 *
 * // Load from custom path
 * loadEnv(".env.production");
 * ```
 */
export function loadEnv(
  envPath: string = ".env.local",
  options: dotenv.DotenvConfigOptions = {}
): void {
  const config: dotenv.DotenvConfigOptions = {
    path: envPath,
    ...options,
  };

  const result = dotenv.config(config);

  if (result.error) {
    console.warn(`⚠️  Failed to load environment file: ${envPath}`);
    console.warn(`Error: ${result.error.message}`);

    // Don't throw error for missing .env.local in development
    if (!envPath.includes(".env.local")) {
      throw result.error;
    }
  }

  // Validate critical environment variables are loaded
  const criticalVars = ["DATABASE_URL"];
  const missingVars = criticalVars.filter((varName) => !process.env[varName]);

  if (missingVars.length > 0) {
    console.error("❌ Missing critical environment variables:");
    missingVars.forEach((varName) => {
      console.error(`   - ${varName}`);
    });
    console.error(`\nMake sure these variables are set in ${envPath}`);
    process.exit(1);
  }
}

/**
 * Load environment variables with enhanced error handling for scripts
 * Includes validation of database connection strings and other critical vars
 */
export function loadEnvForScript(envPath: string = ".env.local"): void {
  loadEnv(envPath, { debug: process.env.NODE_ENV === "development" });

  // Additional validation for database URLs
  const databaseUrl = process.env.DATABASE_URL;
  if (databaseUrl) {
    try {
      new URL(databaseUrl);
    } catch (error) {
      console.error("❌ Invalid DATABASE_URL format");
      console.error(`Expected format: postgresql://user:password@host:port/database`);
      process.exit(1);
    }
  }
}
