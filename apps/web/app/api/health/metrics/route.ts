/**
 * Database Health API Endpoint
 *
 * Provides basic database health status for monitoring dashboards
 */

import { NextRequest, NextResponse } from "next/server";
import { checkAllDatabaseHealth, getOverallHealthStatus } from "@/lib/database";
import { createSecureApiMiddleware } from "@story-engine/utils";
import { healthCheckQuerySchema } from "@story-engine/validation";
import { requireAuth } from "@story-engine/auth";

// Create secure middleware for health endpoints
const secureHealthMiddleware = createSecureApiMiddleware({
  rateLimit: {
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 100, // 100 requests per 5 minutes
    keyPrefix: "health-metrics",
  },
});

export async function GET(request: NextRequest) {
  // Apply security middleware
  const middlewareResponse = await secureHealthMiddleware(request);
  if (middlewareResponse.status !== 200) {
    return middlewareResponse;
  }

  try {
    // Get query parameters for filtering
    const { searchParams } = new URL(request.url);

    // Validate query parameters
    const queryValidation = healthCheckQuerySchema.safeParse({
      detail: searchParams.get("detail") || "summary",
      format: searchParams.get("format") || "json",
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

    const { detail } = queryValidation.data;

    // Get multi-database health status
    const healthStatus = await checkAllDatabaseHealth();
    const overallHealth = await getOverallHealthStatus();

    // Base response structure
    const response = {
      timestamp: new Date().toISOString(),
      health: {
        databases: healthStatus,
        overall: overallHealth,
      },
      uptime: process.uptime() * 1000, // Convert to milliseconds
    };

    // Add detailed information if requested
    if (detail === "full") {
      const detailedResponse = {
        ...response,
        environment: {
          nodeVersion: process.version,
          platform: process.platform,
          memoryUsage: process.memoryUsage(),
        },
      };

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
 * DELETE /api/health/metrics - Admin endpoint (placeholder for future metrics reset)
 */
export async function DELETE(request: NextRequest) {
  // Apply security middleware
  const middlewareResponse = await secureHealthMiddleware(request);
  if (middlewareResponse.status !== 200) {
    return middlewareResponse;
  }

  try {
    // Require proper authentication for admin endpoints
    await requireAuth();

    // Additional admin role check would go here in production
    // For now, any authenticated user can perform this operation

    // Placeholder for future metrics reset functionality
    return NextResponse.json({
      success: true,
      message: "Health check endpoint - no metrics to reset",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Failed to process reset request:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to process reset request",
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
