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
    
    // Get user from database with subscription info
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        name: true,
        email: true,
        subscriptionStatus: true,
        planType: true,
        subscriptionEndsAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ hasAccess: false, reason: 'User not found' }, { status: 401 });
    }

    // Check if user has active subscription or lifetime access
    const hasAccess = checkUserAccess(user);

    return NextResponse.json({
      hasAccess,
      user,
      reason: hasAccess ? 'Access granted' : 'No active subscription',
    });
  } catch (error) {
    console.error('Access check error:', error);
    return NextResponse.json({ hasAccess: false, reason: 'Auth check failed' }, { status: 401 });
  }
}

function checkUserAccess(user: any): boolean {
  // Lifetime access
  if (user.planType === 'lifetime') {
    return user.subscriptionStatus === 'active';
  }

  // Subscription access
  if (user.subscriptionStatus === 'active' && user.subscriptionEndsAt) {
    return new Date() < new Date(user.subscriptionEndsAt);
  }

  // Trial access (if applicable)
  if (user.subscriptionStatus === 'trial' && user.subscriptionEndsAt) {
    return new Date() < new Date(user.subscriptionEndsAt);
  }

  return false;
}
