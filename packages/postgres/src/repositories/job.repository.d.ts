import { PoolClient } from "pg";
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
    markFailed(jobId: string, error: string, shouldRetry?: boolean, client?: PoolClient): Promise<void>;
    logEvent(jobId: string, eventType: string, message?: string, metadata?: Record<string, unknown>, client?: PoolClient): Promise<void>;
    getStats(): Promise<{
        pending: number;
        running: number;
        completed: number;
        failed: number;
        retrying: number;
    }>;
    cleanupOldJobs(olderThanDays?: number, client?: PoolClient): Promise<number>;
}
export declare class JobRepository implements IJobRepository {
    createEmbeddingJob(payload: EmbeddingJobPayload, client?: PoolClient): Promise<string>;
    getNextPendingJob(client?: PoolClient): Promise<EmbeddingJob | null>;
    markCompleted(jobId: string, client?: PoolClient): Promise<void>;
    markFailed(jobId: string, error: string, shouldRetry?: boolean, client?: PoolClient): Promise<void>;
    logEvent(jobId: string, eventType: string, message?: string, metadata?: Record<string, unknown>, client?: PoolClient): Promise<void>;
    getStats(): Promise<{
        pending: number;
        running: number;
        completed: number;
        failed: number;
        retrying: number;
    }>;
    cleanupOldJobs(olderThanDays?: number, client?: PoolClient): Promise<number>;
}
export declare const jobRepository: JobRepository;
//# sourceMappingURL=job.repository.d.ts.map