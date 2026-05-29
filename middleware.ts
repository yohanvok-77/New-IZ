import { NextRequest, NextResponse } from "next/server";

const SESSION_COOKIE_NAME = "trading_ideas_session";
const protectedPaths = ["/signals", "/admin", "/no-access"];
const guestPaths = ["/login", "/register"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSessionCookie = Boolean(request.cookies.get(SESSION_COOKIE_NAME)?.value);
  const isProtected = protectedPaths.some((path) => pathname === path || pathname.startsWith(`${path}/`));
  const isGuest = guestPaths.some((path) => pathname === path || pathname.startsWith(`${path}/`));

  if (isGuest && hasSessionCookie) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (isProtected && !hasSessionCookie) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/signals/:path*", "/admin/:path*", "/login", "/register", "/no-access"],
};
