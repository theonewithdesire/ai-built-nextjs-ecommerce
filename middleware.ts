import { NextResponse } from "next/server";
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Skip middleware for login page to avoid redirect loops
  if (pathname === "/admin/login") {
    return NextResponse.next();
  }
  
  if (pathname.startsWith("/admin")) {
    // Check for refresh token
    const refreshToken = request.cookies.get('refreshToken');
    
    // If no refresh token, redirect to login
    if (!refreshToken || !refreshToken.value) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
  }
  
  return NextResponse.next();
}

export const config = { matcher: ["/admin/:path*"] };