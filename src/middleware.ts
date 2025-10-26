import { NextRequest, NextResponse } from 'next/server';
import { stackServerApp } from '@/stack/server';

export async function middleware(request: NextRequest) {
  // Allow public routes (sign-in, sign-up, static, API, etc.)
  const publicPaths = [
    '/handler',
    '/api',
    '/favicon.ico',
    '/manifest.json',
    '/next.svg',
    '/vercel.svg',
    '/sample-192x192.png',
    '/sample-512x512.png',
    '/sw.js',
    '/_next',
    '/public',
    '/about',
  ];
  const { pathname } = request.nextUrl;
  if (publicPaths.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // Check for authenticated user
  const user = await stackServerApp.getUser();
  if (!user) {
    const signInUrl = new URL('/handler/sign-in', request.url);
    return NextResponse.redirect(signInUrl);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next|api|public|favicon.ico|manifest.json|handler).*)'],
};
