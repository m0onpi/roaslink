import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  // For tracking API endpoints, ensure requests can reach the API routes
  // The API routes themselves will handle the dynamic CORS logic
  if (request.nextUrl.pathname.startsWith('/api/tracking')) {
    
    // Simply let all requests through to reach the API routes
    // This prevents any middleware-level redirects that could cause CORS issues
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/api/tracking/:path*',
  ],
};
