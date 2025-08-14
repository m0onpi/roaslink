import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export async function GET(req: Request) {
  try {
    const cookieHeader = req.headers.get('cookie');
    if (!cookieHeader) {
      return NextResponse.json({ hasAccess: false, reason: 'Not authenticated' }, { status: 401 });
    }

    // Extract token from cookies
    const tokenMatch = cookieHeader.match(/token=([^;]+)/);
    if (!tokenMatch) {
      return NextResponse.json({ hasAccess: false, reason: 'No token found' }, { status: 401 });
    }

    const token = tokenMatch[1];
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }

    // Verify JWT
    const decoded = jwt.verify(token, jwtSecret) as any;
    
    // Check access directly from JWT data (no database call needed)
    const hasAccess = decoded.hasAccess || decoded.subscriptionStatus === 'active';

    return NextResponse.json({
      hasAccess,
      user: {
        id: decoded.userId,
        email: decoded.email,
        subscriptionStatus: decoded.subscriptionStatus,
        planType: decoded.planType,
      },
      reason: hasAccess ? 'Access granted' : 'No active subscription',
    });
  } catch (error) {
    console.error('Access check error:', error);
    return NextResponse.json({ hasAccess: false, reason: 'Auth check failed' }, { status: 401 });
  }
}
