/**
 * Database Metrics API Endpoint
 *
 * Implements Step 5.2 from 71.md: Dashboard Implementation
 * Provides comprehensive performance metrics for monitoring dashboards
 */

import { NextRequest, NextResponse } from "next/server";
import { databaseMetrics } from "@story-engine/postgres/metrics";
import { getDatabase } from "@story-engine/postgres";

export async function GET(request: NextRequest) {
  try {
    // Get query parameters for filtering
    const { searchParams } = new URL(request.url);
    const detail = searchParams.get("detail") || "summary";
    const repository = searchParams.get("repository");

    // Get comprehensive metrics
    const metrics = databaseMetrics.getAllMetrics();

    // Get multi-database health status
    const { checkAllDatabaseHealth, getOverallHealthStatus } = await import("@/lib/database");
    const healthStatus = await checkAllDatabaseHealth();
    const overallHealth = await getOverallHealthStatus();

    // Base response structure
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

    // Add detailed information based on query parameters
    if (detail === "full") {
      // TODO: Add queryHistory and slowQueries to metrics type
      // response.metrics.queryHistory = databaseMetrics.getRecentQueries(100);
      // response.metrics.slowQueries = databaseMetrics.getSlowQueries();

      // Repository-specific metrics if requested
      if (repository) {
        // response.metrics.repositoryDetail = databaseMetrics.getRepositoryMetrics(repository);
      }
    }

    // Add performance summary
    // TODO: Add summary to response type
    // response.summary = {
    //   totalQueries: metrics.overall.totalRequestsPerSecond * (metrics.overall.uptime / 1000),
    //   averageLatency: metrics.overall.averageLatency,
    //   cacheHitRate: metrics.redis.hitRate,
    //   healthScore: metrics.overall.healthScore,
    //   uptime: formatUptime(metrics.overall.uptime),
    //   lastUpdated: metrics.timestamp,
    // };

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
  } catch (error) {
    console.error("Failed to get database metrics:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to retrieve database metrics",
        timestamp: new Date().toISOString(),
      },
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
}

/**
 * GET /api/health/metrics/reset - Reset metrics (admin only)
 */
export async function DELETE(request: NextRequest) {
  try {
    // Basic security check - in production, add proper admin authentication
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.includes("admin")) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized - Admin access required",
        },
        { status: 401 }
      );
    }

    // Reset all metrics
    databaseMetrics.resetMetrics();

    return NextResponse.json({
      success: true,
      message: "Database metrics reset successfully",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Failed to reset database metrics:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to reset database metrics",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

/**
 * Utility function to format uptime in human-readable format
 */
function formatUptime(uptimeMs: number): string {
  const seconds = Math.floor(uptimeMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return `${days}d ${hours % 24}h ${minutes % 60}m`;
  } else if (hours > 0) {
    return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  } else {
    return `${seconds}s`;
  }
}
