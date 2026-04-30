import { getToken } from 'next-auth/jwt';
import { NextRequest, NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Skip NextAuth routes
  if (pathname.startsWith('/api/auth')) {
    return NextResponse.next();
  }

  try {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
      secureCookie: process.env.NODE_ENV === 'production',
    });

    const isAuthenticated = !!token;
    const role = token?.role;

    // Protect routes
    const isProtectedRoute =
      pathname.startsWith('/dashboard') ||
      pathname.startsWith('/organizations') ||
      pathname.startsWith('/interviews') ||
      pathname.startsWith('/reports') ||
      pathname.startsWith('/admin');

    if (isProtectedRoute && !isAuthenticated) {
      const loginUrl = new URL('/login', request.url);

      loginUrl.searchParams.set('callbackUrl', request.nextUrl.pathname);

      return NextResponse.redirect(loginUrl);
    }

    // Prevent logged-in users from seeing login/register
    if (
      (pathname === '/login' || pathname === '/register') &&
      isAuthenticated
    ) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    // Role restriction
    if (
      pathname.startsWith('/organizations') &&
      role === 'assessor' &&
      (pathname.endsWith('/new') || pathname.endsWith('/edit'))
    ) {
      return NextResponse.redirect(new URL('/organizations', request.url));
    }

    if (
      pathname.startsWith('/interviews') &&
      role === 'assessor' &&
      pathname.endsWith('/new')
    ) {
      return NextResponse.redirect(new URL('/interviews', request.url));
    }

    // Admin-only restriction
    if (pathname.startsWith('/admin') && role !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    return NextResponse.next();
  } catch (error) {
    console.error('Middleware error:', error);
    return NextResponse.next();
  }
}
