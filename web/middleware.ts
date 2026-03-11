// Next.js middleware — runs on every request matching the config
// Used here to protect /dashboard/* routes
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Note: Firebase client SDK cannot run in Edge runtime (middleware).
// We use a simple cookie-based check here. The real auth check happens
// client-side in the Dashboard component via AuthContext.
// For production, use Firebase Admin SDK with custom tokens and httpOnly cookies.

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect /dashboard routes — redirect to /sign-in if no session cookie
  // Firebase sets a session cookie named "session" when using session cookies
  // or you can set a custom cookie after login.
  // For now, client-side guard handles auth — middleware is a placeholder.
  if (pathname.startsWith("/dashboard")) {
    // TODO: Verify Firebase session cookie with Admin SDK for true server-side protection
    // const sessionCookie = request.cookies.get("session")?.value;
    // if (!sessionCookie) return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
