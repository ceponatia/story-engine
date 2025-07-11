#!/usr/bin/env node

/**
 * Production Readiness Validation Script
 *
 * Validates that the Story Engine is properly configured for production deployment.
 * Run this script before deploying to staging or production environments.
 *
 * Usage: node scripts/validate-production-readiness.js
 */

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

// Load environment variables using shared utility
const { loadEnv } = require("../packages/utils/src/loadEnv.js");
loadEnv();

// ANSI color codes for console output
const colors = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  bold: "\x1b[1m",
};

function log(level, message) {
  const timestamp = new Date().toISOString();
  let colorCode = colors.reset;

  switch (level) {
    case "ERROR":
      colorCode = colors.red;
      break;
    case "WARN":
      colorCode = colors.yellow;
      break;
    case "INFO":
      colorCode = colors.blue;
      break;
    case "SUCCESS":
      colorCode = colors.green;
      break;
  }

  console.log(`${colorCode}[${level}]${colors.reset} ${timestamp} - ${message}`);
}

function validateEnvironmentVariables() {
  log("INFO", "Validating environment variables...");

  const errors = [];
  const warnings = [];

  // Critical environment variables
  const criticalVars = ["DATABASE_URL", "BETTER_AUTH_SECRET", "BETTER_AUTH_URL"];

  // Optional but recommended variables
  const optionalVars = ["REDIS_URL", "QDRANT_URL", "MONGODB_URL", "NODE_ENV", "LOG_LEVEL"];

  // Check critical variables
  for (const varName of criticalVars) {
    const value = process.env[varName];

    if (!value || value.trim() === "") {
      errors.push(`Missing critical environment variable: ${varName}`);
      continue;
    }

    // Specific validations
    switch (varName) {
      case "BETTER_AUTH_SECRET":
        if (
          value.includes("your-super-secret-key") ||
          value.includes("change-this-in-production") ||
          value.length < 32
        ) {
          errors.push(
            `BETTER_AUTH_SECRET uses placeholder or is too short (minimum 32 characters)`
          );
        }
        break;

      case "DATABASE_URL":
        if (!value.startsWith("postgresql://")) {
          errors.push(`DATABASE_URL must be a valid PostgreSQL connection string`);
        }
        if (value.includes("localhost") && process.env.NODE_ENV === "production") {
          warnings.push(`DATABASE_URL points to localhost in production environment`);
        }
        break;

      case "BETTER_AUTH_URL":
        try {
          new URL(value);
        } catch {
          errors.push(`BETTER_AUTH_URL is not a valid URL`);
        }
        break;
    }
  }

  // Check optional variables
  for (const varName of optionalVars) {
    const value = process.env[varName];
    if (!value || value.trim() === "") {
      warnings.push(`Optional environment variable not set: ${varName}`);
    }
  }

  // Node environment specific checks
  if (process.env.NODE_ENV === "production") {
    if (process.env.DEBUG_DB === "true") {
      warnings.push("DEBUG_DB is enabled in production");
    }
    if (process.env.LOG_LEVEL === "debug") {
      warnings.push("LOG_LEVEL is set to debug in production");
    }
  }

  return { errors, warnings };
}

function validateFileSystem() {
  log("INFO", "Validating file system configuration...");

  const errors = [];
  const warnings = [];

  // Check required files exist
  const requiredFiles = [
    "package.json",
    "next.config.ts",
    "lib/postgres/config.ts",
    "lib/postgres/pool.ts",
    "app/api/health/database/route.ts",
  ];

  for (const filePath of requiredFiles) {
    if (!fs.existsSync(filePath)) {
      errors.push(`Required file missing: ${filePath}`);
    }
  }

  // Check .env.local doesn't contain production secrets
  if (fs.existsSync(".env.local")) {
    try {
      const envContent = fs.readFileSync(".env.local", "utf8");
      if (envContent.includes("your-super-secret-key-change-this-in-production")) {
        errors.push(".env.local contains placeholder secrets - update before deployment");
      }
    } catch (error) {
      warnings.push(`Could not read .env.local: ${error.message}`);
    }
  }

  // Check .env.example exists
  if (!fs.existsSync(".env.example")) {
    warnings.push(".env.example file missing - create for documentation");
  }

  return { errors, warnings };
}

async function validateDatabaseConnections() {
  log("INFO", "Validating database configurations...");

  const errors = [];
  const warnings = [];

  try {
    // Manual validation since TypeScript module can't be imported directly
    const criticalVars = ["DATABASE_URL", "BETTER_AUTH_SECRET"];
    const optionalVars = ["REDIS_URL", "QDRANT_URL", "MONGODB_URL"];

    // Check critical database variables
    for (const varName of criticalVars) {
      const value = process.env[varName];
      if (!value || value.trim() === "") {
        errors.push(`Missing critical database variable: ${varName}`);
      }
    }

    // Validate DATABASE_URL format
    const dbUrl = process.env.DATABASE_URL;
    if (dbUrl && !dbUrl.startsWith("postgresql://")) {
      errors.push("DATABASE_URL must be a valid PostgreSQL connection string");
    }

    // Check optional database services
    for (const varName of optionalVars) {
      const value = process.env[varName];
      if (!value || value.trim() === "") {
        warnings.push(`Optional database service not configured: ${varName.replace("_URL", "")}`);
      }
    }

    // SSL configuration check for production
    if (process.env.NODE_ENV === "production") {
      const sslCertPath = process.env.DB_SSL_CA_PATH;
      if (!sslCertPath) {
        warnings.push("No SSL certificate configured for production PostgreSQL");
      } else if (!fs.existsSync(sslCertPath)) {
        errors.push(`SSL certificate file not found: ${sslCertPath}`);
      }
    }
  } catch (error) {
    errors.push(`Database configuration validation failed: ${error.message}`);
  }

  return { errors, warnings };
}

async function validateHealthEndpoint() {
  log("INFO", "Validating health check endpoint...");

  const errors = [];
  const warnings = [];

  // Check if the health endpoint file exists and is properly structured
  const healthEndpointPath = "app/api/health/database/route.ts";

  if (!fs.existsSync(healthEndpointPath)) {
    errors.push("Health check endpoint missing: /api/health/database");
    return { errors, warnings };
  }

  try {
    const healthEndpointContent = fs.readFileSync(healthEndpointPath, "utf8");

    // Basic content validation
    if (!healthEndpointContent.includes("getHealthStatus")) {
      errors.push("Health endpoint does not call getHealthStatus()");
    }

    if (!healthEndpointContent.includes("503")) {
      warnings.push("Health endpoint may not properly return 503 for unhealthy status");
    }

    if (!healthEndpointContent.includes("DatabaseErrorHandler")) {
      warnings.push("Health endpoint may not use secure error handling");
    }
  } catch (error) {
    errors.push(`Could not validate health endpoint: ${error.message}`);
  }

  return { errors, warnings };
}

function validateSSLConfiguration() {
  log("INFO", "Validating SSL configuration...");

  const errors = [];
  const warnings = [];

  // Check if SSL certificate path is configured for production
  if (process.env.NODE_ENV === "production") {
    const sslCertPath = process.env.DB_SSL_CA_PATH;

    if (sslCertPath) {
      if (!fs.existsSync(sslCertPath)) {
        errors.push(`SSL certificate file not found: ${sslCertPath}`);
      }
    } else {
      warnings.push("No custom SSL certificate configured for production");
    }
  }

  // Validate that pool.ts uses centralized config
  try {
    const poolContent = fs.readFileSync("lib/postgres/pool.ts", "utf8");

    if (poolContent.includes("rejectUnauthorized: false")) {
      errors.push("SSL configuration contains rejectUnauthorized: false");
    }

    if (!poolContent.includes("DatabaseConfig.getInstance()")) {
      errors.push("Database pool does not use centralized configuration");
    }
  } catch (error) {
    errors.push(`Could not validate SSL configuration: ${error.message}`);
  }

  return { errors, warnings };
}

function generateSecurityRecommendations() {
  log("INFO", "Generating security recommendations...");

  const recommendations = [];

  // Check if using development defaults in production
  if (process.env.NODE_ENV === "production") {
    recommendations.push("🔒 Ensure all database credentials are rotated for production");
    recommendations.push("🔒 Enable SSL/TLS for all database connections");
    recommendations.push("🔒 Configure proper firewall rules to restrict database access");
    recommendations.push("🔒 Set up database backup and disaster recovery procedures");
    recommendations.push("🔒 Enable database audit logging");
    recommendations.push("🔒 Configure monitoring and alerting for the health endpoint");
  }

  recommendations.push("🔒 Regularly update BETTER_AUTH_SECRET");
  recommendations.push("🔒 Use environment-specific configuration files");
  recommendations.push(
    "🔒 Implement secrets management (AWS Secrets Manager, HashiCorp Vault, etc.)"
  );
  recommendations.push("🔒 Set up automated security scanning in CI/CD pipeline");

  return recommendations;
}

async function main() {
  console.log(`${colors.bold}${colors.blue}========================================`);
  console.log("Story Engine Production Readiness Check");
  console.log(`========================================${colors.reset}\n`);

  const allErrors = [];
  const allWarnings = [];

  // Run all validations
  const validations = [
    validateEnvironmentVariables(),
    validateFileSystem(),
    await validateDatabaseConnections(),
    await validateHealthEndpoint(),
    validateSSLConfiguration(),
  ];

  for (const { errors, warnings } of validations) {
    allErrors.push(...errors);
    allWarnings.push(...warnings);
  }

  // Display results
  console.log(`${colors.bold}Validation Results:${colors.reset}`);
  console.log(`❌ Errors: ${allErrors.length}`);
  console.log(`⚠️  Warnings: ${allWarnings.length}\n`);

  if (allErrors.length > 0) {
    log("ERROR", "Critical issues found that must be resolved:");
    allErrors.forEach((error) => console.log(`  ❌ ${error}`));
    console.log();
  }

  if (allWarnings.length > 0) {
    log("WARN", "Warnings that should be addressed:");
    allWarnings.forEach((warning) => console.log(`  ⚠️  ${warning}`));
    console.log();
  }

  // Security recommendations
  const recommendations = generateSecurityRecommendations();
  if (recommendations.length > 0) {
    log("INFO", "Security recommendations:");
    recommendations.forEach((rec) => console.log(`  ${rec}`));
    console.log();
  }

  // Final assessment
  if (allErrors.length === 0) {
    log("SUCCESS", "✅ Production readiness validation passed!");

    if (allWarnings.length > 0) {
      log("INFO", "Consider addressing warnings before deployment.");
    }

    process.exit(0);
  } else {
    log("ERROR", "❌ Production readiness validation failed!");
    log("ERROR", `Fix ${allErrors.length} critical issues before deployment.`);
    process.exit(1);
  }
}

// Run the validation
main().catch((error) => {
  log("ERROR", `Validation script failed: ${error.message}`);
  process.exit(1);
});
