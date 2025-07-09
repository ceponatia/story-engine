/**
 * Job Management API Routes
 *
 * Provides REST endpoints for managing embedding jobs and worker processes.
 * Includes job statistics, worker status, and manual job processing.
 */

import { NextRequest, NextResponse } from "next/server";
import { getJobStats, cleanupOldJobs, getNextPendingJob } from "@story-engine/postgres";
import { createEmbeddingWorker } from "@/lib/ai/background-worker";
import { requireAdminAuth } from "@story-engine/auth";
import { createSecureApiMiddleware } from "@story-engine/utils";
import { adminJobActionSchema, healthCheckQuerySchema } from "@story-engine/validation";

// Global worker instance for API route management
interface WorkerInstance {
  start: () => Promise<void>;
  stop: () => Promise<void>;
  startedAt?: string;
}

let apiWorker: WorkerInstance | null = null;

// Create secure middleware for admin endpoints
const secureAdminMiddleware = createSecureApiMiddleware({
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 50, // 50 requests per 15 minutes
    keyPrefix: "admin-jobs",
  },
  csrf: true, // Enable CSRF protection
});

/**
 * GET /api/admin/jobs - Get job statistics and worker status
 */
export async function GET(request: NextRequest) {
  // Apply security middleware
  const middlewareResponse = await secureAdminMiddleware(request);
  if (middlewareResponse.status !== 200) {
    return middlewareResponse;
  }

  try {
    // Require admin authentication for admin endpoints
    await requireAdminAuth();

    const url = new URL(request.url);
    const action = url.searchParams.get("action");

    // Validate query parameters
    const queryValidation = healthCheckQuerySchema.safeParse({
      detail: url.searchParams.get("detail") || "summary",
      format: url.searchParams.get("format") || "json",
    });

    if (!queryValidation.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid query parameters",
          details: queryValidation.error.issues,
        },
        { status: 400 }
      );
    }

    if (action === "stats") {
      const stats = await getJobStats();
      const workerStatus = {
        isRunning: apiWorker !== null,
        startedAt: apiWorker?.startedAt || null,
      };

      return NextResponse.json({
        success: true,
        stats,
        worker: workerStatus,
      });
    }

    if (action === "next-job") {
      const nextJob = await getNextPendingJob();
      return NextResponse.json({
        success: true,
        nextJob,
      });
    }

    return NextResponse.json(
      {
        success: false,
        error: "Invalid action parameter",
      },
      { status: 400 }
    );
  } catch (err) {
    console.error("Job API error:", err);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/jobs - Manage worker process and jobs
 */
export async function POST(request: NextRequest) {
  // Apply security middleware
  const middlewareResponse = await secureAdminMiddleware(request);
  if (middlewareResponse.status !== 200) {
    return middlewareResponse;
  }

  try {
    // Require admin authentication for admin endpoints
    await requireAdminAuth();

    const body = await request.json();

    // Validate request body
    const bodyValidation = adminJobActionSchema.safeParse(body);
    if (!bodyValidation.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid request body",
          details: bodyValidation.error.issues,
        },
        { status: 400 }
      );
    }

    const { action } = bodyValidation.data;

    switch (action) {
      case "start-worker":
        if (apiWorker) {
          return NextResponse.json(
            {
              success: false,
              error: "Worker is already running",
            },
            { status: 400 }
          );
        }

        try {
          apiWorker = createEmbeddingWorker({
            pollIntervalMs: 2000,
            maxConcurrentJobs: 2,
            enableGracefulShutdown: false,
            logLevel: "info",
          });

          // Add started timestamp
          apiWorker.startedAt = new Date().toISOString();

          // Start worker in background (don't await)
          apiWorker.start().catch((err: unknown) => {
            console.error("API Worker failed:", err);
            apiWorker = null;
          });

          return NextResponse.json({
            success: true,
            message: "Worker started successfully",
          });
        } catch (err) {
          console.error("Worker start error:", err);
          return NextResponse.json(
            {
              success: false,
              error: "Failed to start worker",
            },
            { status: 500 }
          );
        }

      case "stop-worker":
        if (!apiWorker) {
          return NextResponse.json(
            {
              success: false,
              error: "No worker is running",
            },
            { status: 400 }
          );
        }

        try {
          await apiWorker.stop();
          apiWorker = null;

          return NextResponse.json({
            success: true,
            message: "Worker stopped successfully",
          });
        } catch (err) {
          console.error("Worker stop error:", err);
          return NextResponse.json(
            {
              success: false,
              error: "Failed to stop worker",
            },
            { status: 500 }
          );
        }

      case "cleanup-jobs":
        try {
          const { olderThanDays = 7 } = body;
          const deletedCount = await cleanupOldJobs(olderThanDays);

          return NextResponse.json({
            success: true,
            deletedCount,
            message: `Cleaned up ${deletedCount} old jobs`,
          });
        } catch (err) {
          console.error("Job cleanup error:", err);
          return NextResponse.json(
            {
              success: false,
              error: "Failed to cleanup jobs",
            },
            { status: 500 }
          );
        }

      default:
        return NextResponse.json(
          {
            success: false,
            error: "Invalid action",
          },
          { status: 400 }
        );
    }
  } catch (err) {
    console.error("Job management error:", err);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}
