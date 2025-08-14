import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public routes that don't require authentication
  const publicRoutes = ['/', '/signin', '/signup'];
  const isPublicRoute = publicRoutes.includes(pathname);

  // Check if user is authenticated
  const token = request.cookies.get('token')?.value;
  


  if (!token && !isPublicRoute) {
    // Redirect to signin if trying to access protected route without token
    console.log('Redirecting to signin - no token found');
    return NextResponse.redirect(new URL('/signin', request.url));
  }

  if (token && isPublicRoute && pathname !== '/') {
    // Redirect to dashboard if user is already authenticated and trying to access public routes
    console.log('Redirecting to dashboard - user already authenticated');
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
