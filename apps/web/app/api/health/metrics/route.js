import { NextResponse } from "next/server";
import { checkAllDatabaseHealth, getOverallHealthStatus } from "@/lib/database";
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const detail = searchParams.get("detail") || "summary";
        const healthStatus = await checkAllDatabaseHealth();
        const overallHealth = await getOverallHealthStatus();
        const response = {
            timestamp: new Date().toISOString(),
            health: {
                databases: healthStatus,
                overall: overallHealth,
            },
            uptime: process.uptime() * 1000,
        };
        if (detail === "full") {
            const detailedResponse = Object.assign(Object.assign({}, response), { environment: {
                    nodeVersion: process.version,
                    platform: process.platform,
                    memoryUsage: process.memoryUsage(),
                } });
            return NextResponse.json(detailedResponse, {
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
        return NextResponse.json({
            success: true,
            message: "Health check endpoint - no metrics to reset",
            timestamp: new Date().toISOString(),
        });
    }
    catch (error) {
        console.error("Failed to process reset request:", error);
        return NextResponse.json({
            success: false,
            error: "Failed to process reset request",
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
