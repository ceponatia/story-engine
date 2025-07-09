/**
 * Background Worker for Embedding Job Processing
 *
 * Polls the database for pending embedding jobs and processes them asynchronously.
 * Handles job retry logic, error logging, and graceful shutdown.
 *
 * Usage:
 * - Run as separate Node.js process: `node -r ts-node/register lib/ai/background-worker.ts`
 * - Or integrate into Next.js app with worker threads
 * - Can be deployed alongside main application or as separate service
 */

import {
  getNextPendingJob,
  markJobCompleted,
  markJobFailed,
  logJobEvent,
  type EmbeddingJob,
} from "@/lib/postgres/repositories";
import { generateCharacterTraitEmbedding, type CharacterTraitData } from "./embedding-service";
import { EMBEDDING_CONFIG } from "./config/embeddings";

export interface WorkerConfig {
  pollIntervalMs: number;
  maxConcurrentJobs: number;
  enableGracefulShutdown: boolean;
  logLevel: "debug" | "info" | "warn" | "error";
}

export class EmbeddingWorker {
  private isRunning = false;
  private isShuttingDown = false;
  private activeJobs = new Set<string>();
  private config: WorkerConfig;

  constructor(config: Partial<WorkerConfig> = {}) {
    this.config = {
      pollIntervalMs: parseInt(process.env.WORKER_POLL_INTERVAL_MS || "5000"),
      maxConcurrentJobs: parseInt(process.env.WORKER_MAX_CONCURRENT_JOBS || "3"),
      enableGracefulShutdown: true,
      logLevel: (process.env.WORKER_LOG_LEVEL as any) || "info",
      ...config,
    };

    if (this.config.enableGracefulShutdown) {
      this.setupGracefulShutdown();
    }
  }

  /**
   * Start the worker process
   */
  async start(): Promise<void> {
    if (this.isRunning) {
      this.log("warn", "Worker is already running");
      return;
    }

    this.isRunning = true;
    this.log("info", `Starting embedding worker with config:`, this.config);

    try {
      await this.processJobsLoop();
    } catch (error) {
      this.log("error", "Worker crashed:", error);
      throw error;
    }
  }

  /**
   * Stop the worker process gracefully
   */
  async stop(): Promise<void> {
    if (!this.isRunning) {
      return;
    }

    this.log("info", "Stopping worker...");
    this.isShuttingDown = true;
    this.isRunning = false;

    // Wait for active jobs to complete
    if (this.activeJobs.size > 0) {
      this.log("info", `Waiting for ${this.activeJobs.size} active jobs to complete...`);

      const timeout = 30000; // 30 seconds timeout
      const startTime = Date.now();

      while (this.activeJobs.size > 0 && Date.now() - startTime < timeout) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }

      if (this.activeJobs.size > 0) {
        this.log("warn", `Force stopping with ${this.activeJobs.size} jobs still active`);
      }
    }

    this.log("info", "Worker stopped");
  }

  /**
   * Main job processing loop
   */
  private async processJobsLoop(): Promise<void> {
    while (this.isRunning && !this.isShuttingDown) {
      try {
        // Check if we can process more jobs
        if (this.activeJobs.size >= this.config.maxConcurrentJobs) {
          await this.sleep(this.config.pollIntervalMs);
          continue;
        }

        // Get next pending job
        const job = await getNextPendingJob();
        if (!job) {
          await this.sleep(this.config.pollIntervalMs);
          continue;
        }

        // Process job asynchronously
        this.processJob(job).catch((error) => {
          this.log("error", `Unhandled error processing job ${job.id}:`, error);
        });
      } catch (error) {
        this.log("error", "Error in job processing loop:", error);
        await this.sleep(this.config.pollIntervalMs);
      }
    }
  }

  /**
   * Process a single embedding job
   */
  private async processJob(job: EmbeddingJob): Promise<void> {
    this.activeJobs.add(job.id);
    this.log("debug", `Processing job ${job.id} (${job.trait_path})`);

    try {
      await logJobEvent(job.id, "job_started", `Worker started processing job`);

      // Convert job payload to CharacterTraitData format
      const traitData: CharacterTraitData = {
        adventureCharacterId: job.payload.adventureCharacterId,
        traitType: job.payload.traitType,
        traitPath: job.payload.traitPath,
        traitValue: job.payload.traitValue,
        context: job.payload.context,
      };

      // Generate embedding
      const embeddingId = await generateCharacterTraitEmbedding(traitData);

      if (embeddingId) {
        await markJobCompleted(job.id);
        await logJobEvent(job.id, "job_completed", `Embedding generated successfully`, {
          embeddingId,
          processingTime: Date.now() - new Date(job.started_at!).getTime(),
        });
        this.log("info", `✅ Job ${job.id} completed (embedding: ${embeddingId})`);
      } else {
        throw new Error("Embedding generation returned null");
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      await markJobFailed(job.id, errorMessage);
      await logJobEvent(job.id, "job_failed", `Job failed: ${errorMessage}`);
      this.log("error", `❌ Job ${job.id} failed:`, error);
    } finally {
      this.activeJobs.delete(job.id);
    }
  }

  /**
   * Setup graceful shutdown handlers
   */
  private setupGracefulShutdown(): void {
    const shutdownSignals = ["SIGTERM", "SIGINT", "SIGUSR2"];

    shutdownSignals.forEach((signal) => {
      process.on(signal, async () => {
        this.log("info", `Received ${signal}, shutting down gracefully...`);
        await this.stop();
        process.exit(0);
      });
    });

    process.on("uncaughtException", async (error) => {
      this.log("error", "Uncaught exception:", error);
      await this.stop();
      process.exit(1);
    });

    process.on("unhandledRejection", async (reason) => {
      this.log("error", "Unhandled rejection:", reason);
      await this.stop();
      process.exit(1);
    });
  }

  /**
   * Utility sleep function
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Logging utility
   */
  private log(level: string, message: string, data?: any): void {
    const logLevels = { debug: 0, info: 1, warn: 2, error: 3 };
    const currentLevel = logLevels[this.config.logLevel];
    const messageLevel = logLevels[level as keyof typeof logLevels];

    if (messageLevel >= currentLevel) {
      const timestamp = new Date().toISOString();
      const prefix = `[${timestamp}] [${level.toUpperCase()}] [EmbeddingWorker]`;

      if (data) {
        console.log(`${prefix} ${message}`, data);
      } else {
        console.log(`${prefix} ${message}`);
      }
    }
  }
}

/**
 * CLI entry point when run as standalone script
 */
if (require.main === module) {
  const worker = new EmbeddingWorker();

  worker.start().catch((error) => {
    console.error("Failed to start worker:", error);
    process.exit(1);
  });
}

/**
 * Factory function for creating workers with custom config
 */
export function createEmbeddingWorker(config?: Partial<WorkerConfig>): EmbeddingWorker {
  return new EmbeddingWorker(config);
}

/**
 * Start worker in Next.js API route context
 */
export async function startWorkerInAPIRoute(): Promise<EmbeddingWorker> {
  const worker = new EmbeddingWorker({
    pollIntervalMs: 2000, // Faster polling for API route context
    maxConcurrentJobs: 1, // Conservative for serverless
    enableGracefulShutdown: false, // Let Next.js handle lifecycle
  });

  // Start worker but don't await - let it run in background
  worker.start().catch((error) => {
    console.error("Worker failed in API route context:", error);
  });

  return worker;
}
