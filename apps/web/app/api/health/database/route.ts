import { NextResponse } from "next/server";
import { checkAllDatabaseHealth, getOverallHealthStatus } from "@/lib/database";

/**
 * Database Health Check API Endpoint
 *
 * Provides comprehensive health status for all database services:
 * - PostgreSQL (core relational data)
 * - Redis (caching and sessions)
 * - Qdrant (vector search)
 * - MongoDB (document storage)
 *
 * Returns HTTP 200 if all services are healthy, 503 if degraded/unhealthy
 *
 * @route GET /api/health/database
 */
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

    // Return 200 for healthy, 503 for degraded/unhealthy
    const statusCode = overall === "healthy" ? 200 : 503;

    return NextResponse.json(response, {
      status: statusCode,
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Health check failed:", error);

    return NextResponse.json(
      {
        timestamp: new Date().toISOString(),
        overall: "unhealthy",
        error: "Health check failed",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      {
        status: 503,
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          "Content-Type": "application/json",
        },
      }
    );
  }
}
