import { getDatabase } from "../pool";
import { PoolClient } from "pg";

/**
 * Job Repository
 *
 * Handles all database operations for background job queue management.
 * Implements Repository pattern for clean separation of concerns.
 * Supports multi-database architecture through adapter pattern.
 *
 * Features:
 * - Embedding job queue management
 * - Retry logic with exponential backoff
 * - Job status tracking
 * - Performance monitoring and cleanup
 */

export interface EmbeddingJobPayload {
  adventureCharacterId: string;
  traitType: "appearance" | "personality" | "scents_aromas";
  traitPath: string;
  traitValue: unknown;
  context?: string;
}

export interface EmbeddingJob {
  id: string;
  job_type: string;
  status: "pending" | "running" | "completed" | "failed" | "retrying";
  priority: number;
  payload: EmbeddingJobPayload;
  adventure_character_id: string;
  trait_type: string;
  trait_path: string;
  attempts: number;
  max_attempts: number;
  last_error?: string;
  created_at: string;
  scheduled_at: string;
  started_at?: string;
  completed_at?: string;
}

export interface IJobRepository {
  createEmbeddingJob(payload: EmbeddingJobPayload, client?: PoolClient): Promise<string>;
  getNextPendingJob(client?: PoolClient): Promise<EmbeddingJob | null>;
  markCompleted(jobId: string, client?: PoolClient): Promise<void>;
  markFailed(
    jobId: string,
    error: string,
    shouldRetry?: boolean,
    client?: PoolClient
  ): Promise<void>;
  logEvent(
    jobId: string,
    eventType: string,
    message?: string,
    metadata?: Record<string, unknown>,
    client?: PoolClient
  ): Promise<void>;
  getStats(): Promise<{
    pending: number;
    running: number;
    completed: number;
    failed: number;
    retrying: number;
  }>;
  cleanupOldJobs(olderThanDays?: number, client?: PoolClient): Promise<number>;
}

export class JobRepository implements IJobRepository {
  async createEmbeddingJob(payload: EmbeddingJobPayload, client?: PoolClient): Promise<string> {
    const dbClient = client || getDatabase();

    const result = await dbClient.query(
      `INSERT INTO embedding_jobs (
        job_type, payload, adventure_character_id, trait_type, trait_path
      ) VALUES ($1, $2, $3, $4, $5)
      RETURNING id`,
      [
        "character_trait_embedding",
        JSON.stringify(payload),
        payload.adventureCharacterId,
        payload.traitType,
        payload.traitPath,
      ]
    );

    return result.rows[0].id;
  }

  async getNextPendingJob(client?: PoolClient): Promise<EmbeddingJob | null> {
    const dbClient = client || getDatabase();

    // Use SELECT FOR UPDATE SKIP LOCKED to prevent race conditions
    const result = await dbClient.query(
      `UPDATE embedding_jobs 
       SET status = 'running', started_at = NOW()
       WHERE id = (
         SELECT id FROM embedding_jobs 
         WHERE status IN ('pending', 'retrying') 
           AND scheduled_at <= NOW()
         ORDER BY priority DESC, created_at ASC
         FOR UPDATE SKIP LOCKED
         LIMIT 1
       )
       RETURNING *`,
      []
    );

    if (!result.rows[0]) return null;

    const job = result.rows[0];
    return {
      ...job,
      payload: typeof job.payload === "string" ? JSON.parse(job.payload) : job.payload,
      created_at: job.created_at.toISOString(),
      scheduled_at: job.scheduled_at.toISOString(),
      started_at: job.started_at?.toISOString(),
      completed_at: job.completed_at?.toISOString(),
    };
  }

  async markCompleted(jobId: string, client?: PoolClient): Promise<void> {
    const dbClient = client || getDatabase();

    await dbClient.query(
      "UPDATE embedding_jobs SET status = $1, completed_at = NOW() WHERE id = $2",
      ["completed", jobId]
    );
  }

  async markFailed(
    jobId: string,
    error: string,
    shouldRetry: boolean = true,
    client?: PoolClient
  ): Promise<void> {
    const dbClient = client || getDatabase();

    // Get current attempts count
    const jobResult = await dbClient.query(
      "SELECT attempts, max_attempts FROM embedding_jobs WHERE id = $1",
      [jobId]
    );

    if (!jobResult.rows[0]) return;

    const { attempts, max_attempts } = jobResult.rows[0];
    const newAttempts = attempts + 1;

    if (shouldRetry && newAttempts < max_attempts) {
      // Schedule retry with exponential backoff
      const retryDelayMinutes = Math.min(Math.pow(2, newAttempts), 60); // Max 1 hour delay

      await dbClient.query(
        `UPDATE embedding_jobs 
         SET status = 'retrying', attempts = $1, last_error = $2, 
             scheduled_at = NOW() + INTERVAL '${retryDelayMinutes} minutes'
         WHERE id = $3`,
        [newAttempts, error, jobId]
      );
    } else {
      // Mark as permanently failed
      await dbClient.query(
        `UPDATE embedding_jobs 
         SET status = 'failed', attempts = $1, last_error = $2, completed_at = NOW()
         WHERE id = $3`,
        [newAttempts, error, jobId]
      );
    }
  }

  async logEvent(
    jobId: string,
    eventType: string,
    message?: string,
    metadata?: Record<string, unknown>,
    client?: PoolClient
  ): Promise<void> {
    const dbClient = client || getDatabase();

    await dbClient.query(
      "INSERT INTO job_processing_log (job_id, event_type, message, metadata) VALUES ($1, $2, $3, $4)",
      [jobId, eventType, message || null, metadata ? JSON.stringify(metadata) : "{}"]
    );
  }

  async getStats(): Promise<{
    pending: number;
    running: number;
    completed: number;
    failed: number;
    retrying: number;
  }> {
    const db = getDatabase();

    const result = await db.query(
      `SELECT 
         status,
         COUNT(*) as count
       FROM embedding_jobs 
       WHERE created_at > NOW() - INTERVAL '24 hours'
       GROUP BY status`
    );

    const stats = {
      pending: 0,
      running: 0,
      completed: 0,
      failed: 0,
      retrying: 0,
    };

    result.rows.forEach((row) => {
      stats[row.status as keyof typeof stats] = parseInt(row.count);
    });

    return stats;
  }

  async cleanupOldJobs(olderThanDays: number = 7, client?: PoolClient): Promise<number> {
    const dbClient = client || getDatabase();

    const result = await dbClient.query(
      `DELETE FROM embedding_jobs 
       WHERE status IN ('completed', 'failed') 
         AND completed_at < NOW() - INTERVAL '${olderThanDays} days'`,
      []
    );

    return result.rowCount || 0;
  }
}

// Export repository instance
export const jobRepository = new JobRepository();

// Note: Individual function exports removed to reduce code duplication.
// Use jobRepository.methodName() instead.
