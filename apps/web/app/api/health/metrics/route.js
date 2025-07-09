import { NextResponse } from "next/server";
import { databaseMetrics } from "@story-engine/postgres/metrics";
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const detail = searchParams.get("detail") || "summary";
        const repository = searchParams.get("repository");
        const metrics = databaseMetrics.getAllMetrics();
        const { checkAllDatabaseHealth, getOverallHealthStatus } = await import("@/lib/database");
        const healthStatus = await checkAllDatabaseHealth();
        const overallHealth = await getOverallHealthStatus();
        const response = {
            timestamp: new Date().toISOString(),
            metrics: {
                overall: metrics.overall,
                databases: {
                    postgres: metrics.postgres,
                    redis: metrics.redis,
                    qdrant: metrics.qdrant,
                    mongodb: metrics.mongodb,
                },
                health: {
                    databases: healthStatus,
                    overall: overallHealth,
                },
            },
        };
        if (detail === "full") {
            if (repository) {
            }
        }
        return NextResponse.json(response, {
            status: 200,
            headers: {
                "Content-Type": "application/json",
                "Cache-Control": "no-cache, no-store, must-revalidate",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET",
                "Access-Control-Allow-Headers": "Content-Type",
            },
        });
    }
    catch (error) {
        console.error("Failed to get database metrics:", error);
        return NextResponse.json({
            success: false,
            error: "Failed to retrieve database metrics",
            timestamp: new Date().toISOString(),
        }, {
            status: 500,
            headers: {
                "Content-Type": "application/json",
            },
        });
    }
}
export async function DELETE(request) {
    try {
        const authHeader = request.headers.get("authorization");
        if (!authHeader || !authHeader.includes("admin")) {
            return NextResponse.json({
                success: false,
                error: "Unauthorized - Admin access required",
            }, { status: 401 });
        }
        databaseMetrics.resetMetrics();
        return NextResponse.json({
            success: true,
            message: "Database metrics reset successfully",
            timestamp: new Date().toISOString(),
        });
    }
    catch (error) {
        console.error("Failed to reset database metrics:", error);
        return NextResponse.json({
            success: false,
            error: "Failed to reset database metrics",
            timestamp: new Date().toISOString(),
        }, { status: 500 });
    }
}
function formatUptime(uptimeMs) {
    const seconds = Math.floor(uptimeMs / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    if (days > 0) {
        return `${days}d ${hours % 24}h ${minutes % 60}m`;
    }
    else if (hours > 0) {
        return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    }
    else if (minutes > 0) {
        return `${minutes}m ${seconds % 60}s`;
    }
    else {
        return `${seconds}s`;
    }
}
