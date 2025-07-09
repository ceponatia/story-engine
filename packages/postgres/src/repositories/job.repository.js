import { getDatabase } from "../pool";
export class JobRepository {
    async createEmbeddingJob(payload, client) {
        const dbClient = client || getDatabase();
        const result = await dbClient.query(`INSERT INTO embedding_jobs (
        job_type, payload, adventure_character_id, trait_type, trait_path
      ) VALUES ($1, $2, $3, $4, $5)
      RETURNING id`, [
            "character_trait_embedding",
            JSON.stringify(payload),
            payload.adventureCharacterId,
            payload.traitType,
            payload.traitPath,
        ]);
        return result.rows[0].id;
    }
    async getNextPendingJob(client) {
        var _a, _b;
        const dbClient = client || getDatabase();
        const result = await dbClient.query(`UPDATE embedding_jobs 
       SET status = 'running', started_at = NOW()
       WHERE id = (
         SELECT id FROM embedding_jobs 
         WHERE status IN ('pending', 'retrying') 
           AND scheduled_at <= NOW()
         ORDER BY priority DESC, created_at ASC
         FOR UPDATE SKIP LOCKED
         LIMIT 1
       )
       RETURNING *`, []);
        if (!result.rows[0])
            return null;
        const job = result.rows[0];
        return Object.assign(Object.assign({}, job), { payload: typeof job.payload === "string" ? JSON.parse(job.payload) : job.payload, created_at: job.created_at.toISOString(), scheduled_at: job.scheduled_at.toISOString(), started_at: (_a = job.started_at) === null || _a === void 0 ? void 0 : _a.toISOString(), completed_at: (_b = job.completed_at) === null || _b === void 0 ? void 0 : _b.toISOString() });
    }
    async markCompleted(jobId, client) {
        const dbClient = client || getDatabase();
        await dbClient.query("UPDATE embedding_jobs SET status = $1, completed_at = NOW() WHERE id = $2", ["completed", jobId]);
    }
    async markFailed(jobId, error, shouldRetry = true, client) {
        const dbClient = client || getDatabase();
        const jobResult = await dbClient.query("SELECT attempts, max_attempts FROM embedding_jobs WHERE id = $1", [jobId]);
        if (!jobResult.rows[0])
            return;
        const { attempts, max_attempts } = jobResult.rows[0];
        const newAttempts = attempts + 1;
        if (shouldRetry && newAttempts < max_attempts) {
            const retryDelayMinutes = Math.min(Math.pow(2, newAttempts), 60);
            await dbClient.query(`UPDATE embedding_jobs 
         SET status = 'retrying', attempts = $1, last_error = $2, 
             scheduled_at = NOW() + INTERVAL '${retryDelayMinutes} minutes'
         WHERE id = $3`, [newAttempts, error, jobId]);
        }
        else {
            await dbClient.query(`UPDATE embedding_jobs 
         SET status = 'failed', attempts = $1, last_error = $2, completed_at = NOW()
         WHERE id = $3`, [newAttempts, error, jobId]);
        }
    }
    async logEvent(jobId, eventType, message, metadata, client) {
        const dbClient = client || getDatabase();
        await dbClient.query("INSERT INTO job_processing_log (job_id, event_type, message, metadata) VALUES ($1, $2, $3, $4)", [jobId, eventType, message || null, metadata ? JSON.stringify(metadata) : "{}"]);
    }
    async getStats() {
        const db = getDatabase();
        const result = await db.query(`SELECT 
         status,
         COUNT(*) as count
       FROM embedding_jobs 
       WHERE created_at > NOW() - INTERVAL '24 hours'
       GROUP BY status`);
        const stats = {
            pending: 0,
            running: 0,
            completed: 0,
            failed: 0,
            retrying: 0,
        };
        result.rows.forEach((row) => {
            stats[row.status] = parseInt(row.count);
        });
        return stats;
    }
    async cleanupOldJobs(olderThanDays = 7, client) {
        const dbClient = client || getDatabase();
        const result = await dbClient.query(`DELETE FROM embedding_jobs 
       WHERE status IN ('completed', 'failed') 
         AND completed_at < NOW() - INTERVAL '${olderThanDays} days'`, []);
        return result.rowCount || 0;
    }
}
export const jobRepository = new JobRepository();
