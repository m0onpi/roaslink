import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export async function GET(req: Request) {
  try {
    const cookieHeader = req.headers.get('cookie');
    console.log('🍪 Cookie header:', cookieHeader);

    if (!cookieHeader) {
      return NextResponse.json({ 
        error: 'No cookies found',
        debug: 'User not logged in or cookies not set'
      });
    }

    const tokenMatch = cookieHeader.match(/token=([^;]+)/);
    console.log('🎫 Token match:', tokenMatch ? 'Found' : 'Not found');

    if (!tokenMatch) {
      return NextResponse.json({ 
        error: 'No token found in cookies',
        debug: 'Token cookie not present',
        cookies: cookieHeader
      });
    }

    const token = tokenMatch[1];
    const jwtSecret = process.env.JWT_SECRET;
    
    if (!jwtSecret) {
      return NextResponse.json({ 
        error: 'JWT_SECRET not configured',
        debug: 'Environment variable missing'
      });
    }

    const decoded = jwt.verify(token, jwtSecret) as any;
    console.log('🔓 Decoded JWT:', decoded);

    const hasAccess = decoded.hasAccess || decoded.subscriptionStatus === 'active';
    console.log('✅ Access check:', hasAccess);

    return NextResponse.json({
      success: true,
      decoded,
      hasAccess,
      subscriptionStatus: decoded.subscriptionStatus,
      planType: decoded.planType,
      debug: 'Authentication working correctly'
    });
  } catch (error: any) {
    console.error('❌ Auth test error:', error);
    return NextResponse.json({
      error: error.message,
      stack: error.stack,
      debug: 'JWT verification failed'
    });
  }
}
