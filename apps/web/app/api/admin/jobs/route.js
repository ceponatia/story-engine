import { NextResponse } from "next/server";
import { getJobStats, cleanupOldJobs, getNextPendingJob } from "@/lib/postgres/repositories";
import { createEmbeddingWorker } from "@/lib/ai/background-worker";
import { requireAuth } from "@/lib/auth-helper";
let apiWorker = null;
export async function GET(request) {
    try {
        await requireAuth();
        const url = new URL(request.url);
        const action = url.searchParams.get("action");
        if (action === "stats") {
            const stats = await getJobStats();
            const workerStatus = {
                isRunning: apiWorker !== null,
                startedAt: (apiWorker === null || apiWorker === void 0 ? void 0 : apiWorker.startedAt) || null,
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
        return NextResponse.json({
            success: false,
            error: "Invalid action parameter",
        }, { status: 400 });
    }
    catch (err) {
        console.error("Job API error:", err);
        return NextResponse.json({
            success: false,
            error: "Internal server error",
        }, { status: 500 });
    }
}
export async function POST(request) {
    try {
        await requireAuth();
        const body = await request.json();
        const { action } = body;
        switch (action) {
            case "start-worker":
                if (apiWorker) {
                    return NextResponse.json({
                        success: false,
                        error: "Worker is already running",
                    }, { status: 400 });
                }
                try {
                    apiWorker = createEmbeddingWorker({
                        pollIntervalMs: 2000,
                        maxConcurrentJobs: 2,
                        enableGracefulShutdown: false,
                        logLevel: "info",
                    });
                    apiWorker.startedAt = new Date().toISOString();
                    apiWorker.start().catch((err) => {
                        console.error("API Worker failed:", err);
                        apiWorker = null;
                    });
                    return NextResponse.json({
                        success: true,
                        message: "Worker started successfully",
                    });
                }
                catch (err) {
                    console.error("Worker start error:", err);
                    return NextResponse.json({
                        success: false,
                        error: "Failed to start worker",
                    }, { status: 500 });
                }
            case "stop-worker":
                if (!apiWorker) {
                    return NextResponse.json({
                        success: false,
                        error: "No worker is running",
                    }, { status: 400 });
                }
                try {
                    await apiWorker.stop();
                    apiWorker = null;
                    return NextResponse.json({
                        success: true,
                        message: "Worker stopped successfully",
                    });
                }
                catch (err) {
                    console.error("Worker stop error:", err);
                    return NextResponse.json({
                        success: false,
                        error: "Failed to stop worker",
                    }, { status: 500 });
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
                }
                catch (err) {
                    console.error("Job cleanup error:", err);
                    return NextResponse.json({
                        success: false,
                        error: "Failed to cleanup jobs",
                    }, { status: 500 });
                }
            default:
                return NextResponse.json({
                    success: false,
                    error: "Invalid action",
                }, { status: 400 });
        }
    }
    catch (err) {
        console.error("Job management error:", err);
        return NextResponse.json({
            success: false,
            error: "Internal server error",
        }, { status: 500 });
    }
}
