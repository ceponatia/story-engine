import { NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";
export async function middleware(request) {
    const sessionCookie = getSessionCookie(request);
    const { pathname } = request.nextUrl;
    const protectedRoutes = ["/characters", "/settings", "/locations", "/adventures", "/library"];
    const authRoutes = ["/auth/login", "/auth/sign-up", "/auth/register"];
    const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));
    const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));
    if (sessionCookie && isAuthRoute) {
        return NextResponse.redirect(new URL("/", request.url));
    }
    if (!sessionCookie && isProtectedRoute) {
        return NextResponse.redirect(new URL("/auth/login", request.url));
    }
    return NextResponse.next();
}
export const config = {
    matcher: [
        "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
        "/api/(.*)",
    ],
};
