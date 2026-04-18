import { NextResponse } from "next/server";

const AUTH_COOKIE_NAME = "token";
const protectedPrefixes = ["/checkout", "/wishlist", "/account", "/admin"];

const matchesPrefix = (pathname, prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`);

export function proxy(request) {
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  const { pathname, search } = request.nextUrl;

  if (protectedPrefixes.some((prefix) => matchesPrefix(pathname, prefix)) && !token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", `${pathname}${search}`);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/checkout/:path*", "/wishlist/:path*", "/account/:path*", "/admin/:path*"],
};
