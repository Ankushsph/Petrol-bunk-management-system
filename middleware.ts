import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

// Paths that don't require authentication
const publicPaths = [
  "/",
  "/login",
  "/signup",
  "/api/auth/login",
  "/api/auth/signup",
  "/api/test-db",
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if the path is public
  if (
    publicPaths.some((path) => pathname === path || pathname.startsWith(path))
  ) {
    return NextResponse.next();
  }

  // Get the token from the cookies
  const token = request.cookies.get("auth_token")?.value;

  // If there's no token, redirect to login
  if (!token) {
    const url = new URL("/login", request.url);
    url.searchParams.set("from", pathname);
    return NextResponse.redirect(url);
  }

  try {
    // Verify the token using jose (more compatible with Edge runtime)
    const secret = new TextEncoder().encode(
      process.env.JWT_SECRET || "your-jwt-secret-key"
    );
    await jwtVerify(token, secret);
    return NextResponse.next();
  } catch (error) {
    // If the token is invalid, redirect to login
    console.error("Token verification failed:", error);
    const url = new URL("/login", request.url);
    url.searchParams.set("from", pathname);
    return NextResponse.redirect(url);
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
