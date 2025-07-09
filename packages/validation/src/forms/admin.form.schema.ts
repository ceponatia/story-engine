import { z } from "zod";

// Schema for admin job management actions
export const adminJobActionSchema = z.object({
  action: z.enum(["start-worker", "stop-worker", "cleanup-jobs"], {
    required_error: "Action is required",
    invalid_type_error: "Invalid action type",
  }),
  olderThanDays: z
    .number()
    .int("Days must be a whole number")
    .min(1, "Days must be at least 1")
    .max(365, "Days must be 365 or less")
    .optional()
    .default(7),
});

// Schema for admin authentication
export const adminAuthSchema = z.object({
  authorization: z
    .string()
    .min(1, "Authorization header is required")
    .regex(/^Bearer\s+[\w-]+$/, "Invalid authorization format. Use 'Bearer <token>'"),
});

// Schema for job cleanup parameters
export const jobCleanupSchema = z.object({
  olderThanDays: z
    .number()
    .int("Days must be a whole number")
    .min(1, "Days must be at least 1")
    .max(365, "Days must be 365 or less")
    .default(7),
  jobTypes: z
    .array(z.enum(["embedding", "processing", "cleanup"]))
    .optional()
    .default(["embedding", "processing"]),
});

// Schema for worker configuration
export const workerConfigSchema = z.object({
  pollIntervalMs: z
    .number()
    .int("Poll interval must be a whole number")
    .min(1000, "Poll interval must be at least 1000ms")
    .max(60000, "Poll interval must be 60000ms or less")
    .default(2000),
  maxConcurrentJobs: z
    .number()
    .int("Max concurrent jobs must be a whole number")
    .min(1, "Max concurrent jobs must be at least 1")
    .max(10, "Max concurrent jobs must be 10 or less")
    .default(2),
  enableGracefulShutdown: z.boolean().default(false),
  logLevel: z.enum(["debug", "info", "warn", "error"]).default("info"),
});

// Schema for health check query parameters
export const healthCheckQuerySchema = z.object({
  detail: z.enum(["summary", "full"]).default("summary"),
  format: z.enum(["json", "text"]).default("json"),
});

// Export types for TypeScript
export type AdminJobActionInput = z.infer<typeof adminJobActionSchema>;
export type AdminAuthInput = z.infer<typeof adminAuthSchema>;
export type JobCleanupInput = z.infer<typeof jobCleanupSchema>;
export type WorkerConfigInput = z.infer<typeof workerConfigSchema>;
export type HealthCheckQueryInput = z.infer<typeof healthCheckQuerySchema>;
