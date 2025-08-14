import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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
    
    // Fetch user details including domain limit from database
    const user = await (prisma as any).user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        name: true,
        email: true,
        subscriptionStatus: true,
        planType: true,
        subscriptionEndsAt: true,
        domainLimit: true,
      },
    });

    if (!user) {
      return NextResponse.json({ hasAccess: false, reason: 'User not found' }, { status: 404 });
    }

    // Check access based on subscription status
    const hasAccess = user.subscriptionStatus === 'active';

    return NextResponse.json({
      hasAccess,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        subscriptionStatus: user.subscriptionStatus,
        planType: user.planType,
        subscriptionEndsAt: user.subscriptionEndsAt,
        domainLimit: user.domainLimit,
      },
      reason: hasAccess ? 'Access granted' : 'No active subscription',
    });
  } catch (error) {
    console.error('Access check error:', error);
    return NextResponse.json({ hasAccess: false, reason: 'Auth check failed' }, { status: 401 });
  }
}
