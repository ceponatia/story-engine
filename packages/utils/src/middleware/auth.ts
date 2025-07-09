import { NextRequest, NextResponse } from "next/server";
import { requireAuth, requireAdminAuth } from "@story-engine/auth";

/**
 * Middleware to require authentication
 */
export function requireAuthMiddleware() {
  return async function middleware(req: NextRequest) {
    try {
      await requireAuth();
      return NextResponse.next();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Authentication required";

      return NextResponse.json(
        {
          success: false,
          error: errorMessage,
        },
        { status: 401 }
      );
    }
  };
}

/**
 * Middleware to require admin authentication
 */
export function requireAdminAuthMiddleware() {
  return async function middleware(req: NextRequest) {
    try {
      await requireAdminAuth();
      return NextResponse.next();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Admin access required";

      return NextResponse.json(
        {
          success: false,
          error: errorMessage,
        },
        {
          status: error instanceof Error && error.message === "Authentication required" ? 401 : 403,
        }
      );
    }
  };
}

/**
 * Route handler wrapper that requires authentication
 */
export function withAuth<T extends any[]>(handler: (...args: T) => Promise<NextResponse>) {
  return async (...args: T): Promise<NextResponse> => {
    try {
      await requireAuth();
      return handler(...args);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Authentication required";

      return NextResponse.json(
        {
          success: false,
          error: errorMessage,
        },
        { status: 401 }
      );
    }
  };
}

/**
 * Route handler wrapper that requires admin authentication
 */
export function withAdminAuth<T extends any[]>(handler: (...args: T) => Promise<NextResponse>) {
  return async (...args: T): Promise<NextResponse> => {
    try {
      await requireAdminAuth();
      return handler(...args);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Admin access required";

      return NextResponse.json(
        {
          success: false,
          error: errorMessage,
        },
        {
          status: error instanceof Error && error.message === "Authentication required" ? 401 : 403,
        }
      );
    }
  };
}
