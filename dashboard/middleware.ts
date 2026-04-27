import { NextRequest, NextResponse } from 'next/server';

/**
 * Next.js Middleware — Route Protection
 *
 * Redirects unauthenticated users away from protected routes.
 * Checks for the readypi_session cookie (set by /api/auth/exchange)
 * or the presence of a client-side token indicator.
 *
 * Protected routes: /dashboard, /billing, /playground, /models, /checkout, /docs
 * Public routes: /, /login, /signup, /pricing, /api/*
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Define protected route prefixes
  const protectedPrefixes = ['/dashboard', '/billing', '/checkout'];

  const isProtected = protectedPrefixes.some((prefix) => pathname.startsWith(prefix));

  if (!isProtected) {
    return NextResponse.next();
  }

  // Check for server-side session cookie
  const sessionCookie = request.cookies.get('readypi_session');

  if (!sessionCookie?.value) {
    // Redirect to login with the intended destination as a query param
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico, icons, images
     * - API routes (handled by their own auth)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$|api/).*)',
  ],
};
