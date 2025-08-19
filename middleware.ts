import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  // Handle CORS preflight requests at the edge to prevent redirects
  if (request.nextUrl.pathname.startsWith('/api/tracking')) {
    
    // Handle OPTIONS requests immediately to prevent any redirects
    if (request.method === 'OPTIONS') {
      return new NextResponse(null, {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
          'Access-Control-Max-Age': '86400',
        },
      });
    }

    // For non-OPTIONS requests, let them through to the API routes
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/api/tracking/:path*',
  ],
};
