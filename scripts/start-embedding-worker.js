#!/usr/bin/env node

/**
 * Standalone Embedding Worker Script
 *
 * Starts the background embedding worker process independently of the Next.js application.
 * Can be deployed as a separate service or run alongside the main application.
 *
 * Usage:
 *   node scripts/start-embedding-worker.js
 *   npm run worker:start
 *
 * Environment Variables:
 *   WORKER_POLL_INTERVAL_MS - How often to check for new jobs (default: 5000)
 *   WORKER_MAX_CONCURRENT_JOBS - Maximum concurrent jobs (default: 3)
 *   WORKER_LOG_LEVEL - Log level: debug, info, warn, error (default: info)
 *   DATABASE_URL - PostgreSQL connection string
 *   OLLAMA_BASE_URL - Ollama server URL (default: http://localhost:11434)
 *   ENABLE_BACKGROUND_EMBEDDINGS - Must be 'true' to process jobs
 */

const { loadEnvForScript } = require("../packages/utils/src/loadEnv.js");
loadEnvForScript();

// Environment validation handled by loadEnvForScript

if (process.env.ENABLE_BACKGROUND_EMBEDDINGS !== "true") {
  console.error('ERROR: ENABLE_BACKGROUND_EMBEDDINGS must be set to "true"');
  console.error("Set this environment variable to enable background processing");
  process.exit(1);
}

// Import worker after environment validation
const { EmbeddingWorker } = require("../lib/ai/background-worker.ts");

async function main() {
  console.log("🚀 Starting Story Engine Embedding Worker");
  console.log("📊 Configuration:");
  console.log(`   - Poll Interval: ${process.env.WORKER_POLL_INTERVAL_MS || 5000}ms`);
  console.log(`   - Max Concurrent: ${process.env.WORKER_MAX_CONCURRENT_JOBS || 3} jobs`);
  console.log(`   - Log Level: ${process.env.WORKER_LOG_LEVEL || "info"}`);
  console.log(`   - Database: ${process.env.DATABASE_URL.replace(/:[^@]*@/, ":***@")}`);
  console.log(`   - Ollama: ${process.env.OLLAMA_BASE_URL || "http://localhost:11434"}`);
  console.log("");

  const worker = new EmbeddingWorker({
    pollIntervalMs: parseInt(process.env.WORKER_POLL_INTERVAL_MS || "5000"),
    maxConcurrentJobs: parseInt(process.env.WORKER_MAX_CONCURRENT_JOBS || "3"),
    enableGracefulShutdown: true,
    logLevel: process.env.WORKER_LOG_LEVEL || "info",
  });

  try {
    await worker.start();
  } catch (error) {
    console.error("❌ Worker failed to start:", error);
    process.exit(1);
  }
}

// Handle unhandled rejections and exceptions
process.on("unhandledRejection", (reason, promise) => {
  console.error("❌ Unhandled Rejection at:", promise, "reason:", reason);
  process.exit(1);
});

process.on("uncaughtException", (error) => {
  console.error("❌ Uncaught Exception:", error);
  process.exit(1);
});

// Start the worker
main().catch((error) => {
  console.error("❌ Failed to start worker:", error);
  process.exit(1);
});
