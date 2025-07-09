import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

const CSRF_COOKIE_NAME = "csrf_token";

export function generateCsrfToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

export function withCsrfCookie(response: NextResponse): NextResponse {
  const token = generateCsrfToken();
  response.cookies.set(CSRF_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "Lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });
  return response;
}

export function verifyCsrfToken(req: NextRequest): boolean {
  const cookie = req.cookies.get(CSRF_COOKIE_NAME);
  const header = req.headers.get("x-csrf-token");

  if (!cookie || !header) {
    return false;
  }

  // Use constant-time comparison to prevent timing attacks
  try {
    const cookieValue = cookie.value || cookie;
    return crypto.timingSafeEqual(Buffer.from(cookieValue, "utf8"), Buffer.from(header, "utf8"));
  } catch (error) {
    // If buffers are different lengths, timingSafeEqual throws
    return false;
  }
}

export function csrfMiddleware(req: NextRequest) {
  if (req.method === "GET") return NextResponse.next();

  if (!verifyCsrfToken(req)) {
    return new NextResponse("Invalid CSRF token", { status: 403 });
  }

  return NextResponse.next();
}
