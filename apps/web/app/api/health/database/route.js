import { NextResponse } from "next/server";
import { checkAllDatabaseHealth, getOverallHealthStatus } from "@/lib/database";
export async function GET() {
    try {
        const health = await checkAllDatabaseHealth();
        const overall = await getOverallHealthStatus();
        const response = {
            timestamp: new Date().toISOString(),
            databases: health,
            overall,
            service: "story-engine",
            version: process.env.npm_package_version || "1.0.0",
        };
        const statusCode = overall === "healthy" ? 200 : 503;
        return NextResponse.json(response, {
            status: statusCode,
            headers: {
                "Cache-Control": "no-cache, no-store, must-revalidate",
                "Content-Type": "application/json",
            },
        });
    }
    catch (error) {
        console.error("Health check failed:", error);
        return NextResponse.json({
            timestamp: new Date().toISOString(),
            overall: "unhealthy",
            error: "Health check failed",
            message: error instanceof Error ? error.message : "Unknown error",
        }, {
            status: 503,
            headers: {
                "Cache-Control": "no-cache, no-store, must-revalidate",
                "Content-Type": "application/json",
            },
        });
    }
}
