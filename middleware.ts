import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

/**
 * Public surfaces: the marketing page, Clerk's own auth pages, and the two
 * unauthenticated API routes (`/api/health`, `/api/img`). Everything else —
 * the app and all other API routes — requires a signed-in user.
 */
const isPublicRoute = createRouteMatcher([
  '/welcome',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/health',
  '/api/img',
  '/__clerk(.*)', // Clerk handshake / CLI dev-proxy path
]);

const isApiRoute = createRouteMatcher(['/api/(.*)']);

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();
  const { pathname } = req.nextUrl;

  if (isPublicRoute(req)) {
    // Keep signed-in users out of the marketing splash.
    if (userId && pathname === '/welcome') {
      return NextResponse.redirect(new URL('/', req.url));
    }
    return NextResponse.next();
  }

  if (!userId) {
    if (isApiRoute(req)) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'You must be signed in' } },
        { status: 401 },
      );
    }
    const welcome = new URL('/welcome', req.url);
    return NextResponse.redirect(welcome);
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Run on everything except Next internals and static files with extensions.
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
    '/__clerk/:path*',
  ],
};
