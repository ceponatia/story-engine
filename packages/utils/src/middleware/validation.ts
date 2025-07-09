import { NextRequest, NextResponse } from "next/server";
import { ZodSchema, ZodError } from "zod";

interface ValidationOptions {
  body?: ZodSchema;
  query?: ZodSchema;
  headers?: ZodSchema;
}

export function validateRequest(options: ValidationOptions) {
  return async function middleware(req: NextRequest) {
    try {
      // Validate request body if schema provided
      if (
        options.body &&
        (req.method === "POST" || req.method === "PUT" || req.method === "PATCH")
      ) {
        const body = await req.json();
        const result = options.body.safeParse(body);

        if (!result.success) {
          const errors = result.error.issues.map((issue) => ({
            path: issue.path.join("."),
            message: issue.message,
          }));

          return NextResponse.json(
            {
              success: false,
              error: "Validation failed",
              details: errors,
            },
            { status: 400 }
          );
        }
      }

      // Validate query parameters if schema provided
      if (options.query) {
        const { searchParams } = new URL(req.url);
        const query = Object.fromEntries(searchParams.entries());

        const result = options.query.safeParse(query);

        if (!result.success) {
          const errors = result.error.issues.map((issue) => ({
            path: issue.path.join("."),
            message: issue.message,
          }));

          return NextResponse.json(
            {
              success: false,
              error: "Query validation failed",
              details: errors,
            },
            { status: 400 }
          );
        }
      }

      // Validate headers if schema provided
      if (options.headers) {
        const headers = Object.fromEntries(req.headers.entries());

        const result = options.headers.safeParse(headers);

        if (!result.success) {
          const errors = result.error.issues.map((issue) => ({
            path: issue.path.join("."),
            message: issue.message,
          }));

          return NextResponse.json(
            {
              success: false,
              error: "Header validation failed",
              details: errors,
            },
            { status: 400 }
          );
        }
      }

      return NextResponse.next();
    } catch (error) {
      console.error("Validation middleware error:", error);

      if (error instanceof ZodError) {
        return NextResponse.json(
          {
            success: false,
            error: "Validation error",
            details: error.issues,
          },
          { status: 400 }
        );
      }

      return NextResponse.json(
        {
          success: false,
          error: "Internal server error during validation",
        },
        { status: 500 }
      );
    }
  };
}

// Utility function to combine multiple middleware functions
export function combineMiddleware(
  ...middlewares: Array<(req: NextRequest) => Promise<NextResponse>>
) {
  return async function compositeMiddleware(req: NextRequest): Promise<NextResponse> {
    for (const middleware of middlewares) {
      const response = await middleware(req);

      // If middleware returns a response (not NextResponse.next()), return it
      if (response.status !== 200 || response.headers.get("x-middleware-next") !== "true") {
        return response;
      }
    }

    return NextResponse.next();
  };
}

// Helper to create a secure API middleware stack
export function createSecureApiMiddleware(options: {
  rateLimit?: { windowMs: number; max: number; keyPrefix?: string };
  csrf?: boolean;
  validation?: ValidationOptions;
}) {
  const middlewares: Array<(req: NextRequest) => Promise<NextResponse>> = [];

  // Add rate limiting if configured
  if (options.rateLimit) {
    const { rateLimitByIP } = require("./rateLimiter");
    middlewares.push(rateLimitByIP(options.rateLimit));
  }

  // Add CSRF protection if enabled
  if (options.csrf) {
    const { csrfMiddleware } = require("./csrf");
    middlewares.push(csrfMiddleware);
  }

  // Add validation if configured
  if (options.validation) {
    middlewares.push(validateRequest(options.validation));
  }

  return combineMiddleware(...middlewares);
}
