import { getNextPendingJob, markJobCompleted, markJobFailed, logJobEvent, } from "@/lib/postgres/repositories";
import { generateCharacterTraitEmbedding } from "./embedding-service";
export class EmbeddingWorker {
    constructor(config = {}) {
        this.isRunning = false;
        this.isShuttingDown = false;
        this.activeJobs = new Set();
        this.config = Object.assign({ pollIntervalMs: parseInt(process.env.WORKER_POLL_INTERVAL_MS || "5000"), maxConcurrentJobs: parseInt(process.env.WORKER_MAX_CONCURRENT_JOBS || "3"), enableGracefulShutdown: true, logLevel: process.env.WORKER_LOG_LEVEL || "info" }, config);
        if (this.config.enableGracefulShutdown) {
            this.setupGracefulShutdown();
        }
    }
    async start() {
        if (this.isRunning) {
            this.log("warn", "Worker is already running");
            return;
        }
        this.isRunning = true;
        this.log("info", `Starting embedding worker with config:`, this.config);
        try {
            await this.processJobsLoop();
        }
        catch (error) {
            this.log("error", "Worker crashed:", error);
            throw error;
        }
    }
    async stop() {
        if (!this.isRunning) {
            return;
        }
        this.log("info", "Stopping worker...");
        this.isShuttingDown = true;
        this.isRunning = false;
        if (this.activeJobs.size > 0) {
            this.log("info", `Waiting for ${this.activeJobs.size} active jobs to complete...`);
            const timeout = 30000;
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
    async processJobsLoop() {
        while (this.isRunning && !this.isShuttingDown) {
            try {
                if (this.activeJobs.size >= this.config.maxConcurrentJobs) {
                    await this.sleep(this.config.pollIntervalMs);
                    continue;
                }
                const job = await getNextPendingJob();
                if (!job) {
                    await this.sleep(this.config.pollIntervalMs);
                    continue;
                }
                this.processJob(job).catch((error) => {
                    this.log("error", `Unhandled error processing job ${job.id}:`, error);
                });
            }
            catch (error) {
                this.log("error", "Error in job processing loop:", error);
                await this.sleep(this.config.pollIntervalMs);
            }
        }
    }
    async processJob(job) {
        this.activeJobs.add(job.id);
        this.log("debug", `Processing job ${job.id} (${job.trait_path})`);
        try {
            await logJobEvent(job.id, "job_started", `Worker started processing job`);
            const traitData = {
                adventureCharacterId: job.payload.adventureCharacterId,
                traitType: job.payload.traitType,
                traitPath: job.payload.traitPath,
                traitValue: job.payload.traitValue,
                context: job.payload.context,
            };
            const embeddingId = await generateCharacterTraitEmbedding(traitData);
            if (embeddingId) {
                await markJobCompleted(job.id);
                await logJobEvent(job.id, "job_completed", `Embedding generated successfully`, {
                    embeddingId,
                    processingTime: Date.now() - new Date(job.started_at).getTime(),
                });
                this.log("info", `✅ Job ${job.id} completed (embedding: ${embeddingId})`);
            }
            else {
                throw new Error("Embedding generation returned null");
            }
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Unknown error";
            await markJobFailed(job.id, errorMessage);
            await logJobEvent(job.id, "job_failed", `Job failed: ${errorMessage}`);
            this.log("error", `❌ Job ${job.id} failed:`, error);
        }
        finally {
            this.activeJobs.delete(job.id);
        }
    }
    setupGracefulShutdown() {
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
    sleep(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
    log(level, message, data) {
        const logLevels = { debug: 0, info: 1, warn: 2, error: 3 };
        const currentLevel = logLevels[this.config.logLevel];
        const messageLevel = logLevels[level];
        if (messageLevel >= currentLevel) {
            const timestamp = new Date().toISOString();
            const prefix = `[${timestamp}] [${level.toUpperCase()}] [EmbeddingWorker]`;
            if (data) {
                console.log(`${prefix} ${message}`, data);
            }
            else {
                console.log(`${prefix} ${message}`);
            }
        }
    }
}
if (require.main === module) {
    const worker = new EmbeddingWorker();
    worker.start().catch((error) => {
        console.error("Failed to start worker:", error);
        process.exit(1);
    });
}
export function createEmbeddingWorker(config) {
    return new EmbeddingWorker(config);
}
export async function startWorkerInAPIRoute() {
    const worker = new EmbeddingWorker({
        pollIntervalMs: 2000,
        maxConcurrentJobs: 1,
        enableGracefulShutdown: false,
    });
    worker.start().catch((error) => {
        console.error("Worker failed in API route context:", error);
    });
    return worker;
}
