import { NextResponse, NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(req: NextRequest) {
  const secret = process.env.NEXTAUTH_SECRET;
  const allowedEmail = process.env.NEXT_PUBLIC_ALLOWED_EMAIL;

  // Paths to exclude from middleware
  const publicPaths = ['/', '/api/auth'];

  // Check if the current pathname matches any public path
  const isPublicPath = publicPaths.some((path) =>
    req.nextUrl.pathname.startsWith(path),
  );

  if (isPublicPath) {
    return NextResponse.next(); // Allow access to public routes
  }

  try {
    const token = await getToken({ req, secret });
    console.log('Token:', token);

    // If no token or email doesn't match allowed email, redirect to home
    if (!token || (allowedEmail && token.email !== allowedEmail)) {
      return NextResponse.redirect(new URL('/', req.url));
    }

    return NextResponse.next(); // Allow access to protected routes
  } catch (error) {
    console.error('Middleware error:', error);
    return NextResponse.redirect(new URL('/', req.url));
  }
}

// Configure which paths should be processed by middleware
export const config = {
  matcher: [
    /*
     * Match all paths except for:
     * 1. /api/auth/* (authentication routes)
     * 2. /_next/* (Next.js internals)
     * 3. /favicon.ico, /images/* (static files)
     */
    '/((?!api/auth|_next|favicon.ico|images/).*)',
  ],
};
