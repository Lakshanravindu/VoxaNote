import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  let res = NextResponse.next({
    request: {
      headers: req.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          res = NextResponse.next({
            request: {
              headers: req.headers,
            },
          });
          res.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: any) {
          res = NextResponse.next({
            request: {
              headers: req.headers,
            },
          });
          res.cookies.set({
            name,
            value: '',
            ...options,
          });
        },
      },
    }
  );

  // Refresh session if expired - required for Server Components
  const { data: { session } } = await supabase.auth.getSession();

  const { pathname } = req.nextUrl;

  // Define protected routes and their required roles
  const protectedRoutes = {
    '/reader': ['reader'],
    '/writer': ['writer'], 
    '/admin': ['admin'],
    '/dashboard': ['reader', 'writer', 'admin'] // General dashboard accessible to all roles
  };

  // Check if current path is a protected route
  const matchedRoute = Object.keys(protectedRoutes).find(route => 
    pathname.startsWith(route)
  );

  if (matchedRoute) {
    // Check if we're in development mode and have simulation data
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    // If no session, redirect to login (unless in development with simulation)
    if (!session && !isDevelopment) {
      const redirectUrl = new URL('/login', req.url);
      redirectUrl.searchParams.set('redirectTo', pathname);
      return NextResponse.redirect(redirectUrl);
    }

    // In development mode, allow access if no session (simulation mode)
    if (!session && isDevelopment) {
      console.log('Development mode: allowing access without session for simulation');
      return res;
    }

    // Get user profile to check role
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role, status')
        .eq('id', session.user.id)
        .single();

      if (!profile) {
        return NextResponse.redirect(new URL('/login', req.url));
      }

      // Check if user is approved
      if (profile.status !== 'approved') {
        if (profile.status === 'email_verified') {
          return NextResponse.redirect(new URL('/onboarding', req.url));
        } else {
          return NextResponse.redirect(new URL('/login', req.url));
        }
      }

      // Check role permissions
      const allowedRoles = protectedRoutes[matchedRoute as keyof typeof protectedRoutes];
      if (!allowedRoles.includes(profile.role)) {
        // Redirect to appropriate dashboard based on user's role
        switch (profile.role) {
          case 'reader':
            return NextResponse.redirect(new URL('/reader', req.url));
          case 'writer':
            return NextResponse.redirect(new URL('/writer', req.url));
          case 'admin':
            return NextResponse.redirect(new URL('/admin', req.url));
          default:
            return NextResponse.redirect(new URL('/login', req.url));
        }
      }
    } catch (error) {
      console.error('Middleware error:', error);
      return NextResponse.redirect(new URL('/login', req.url));
    }
  }

  // Allow access to public routes and API routes
  return res;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - api routes (handled separately)
     */
    '/((?!_next/static|_next/image|favicon.ico|public|api).*)',
  ],
};
