import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req: Request) {
  try {
    // 1. Check JWT authentication
    const cookieHeader = req.headers.get('cookie');
    let authStatus = 'No cookies';
    let userInfo = null;
    let hasAccess = false;

    if (cookieHeader) {
      const tokenMatch = cookieHeader.match(/token=([^;]+)/);
      if (tokenMatch) {
        try {
          const token = tokenMatch[1];
          const jwtSecret = process.env.JWT_SECRET;
          if (jwtSecret) {
            const decoded = jwt.verify(token, jwtSecret) as any;
            authStatus = 'JWT valid';
            userInfo = decoded;
            hasAccess = decoded.hasAccess || decoded.subscriptionStatus === 'active';
          } else {
            authStatus = 'No JWT_SECRET';
          }
        } catch {
          authStatus = 'JWT invalid';
        }
      } else {
        authStatus = 'No token in cookies';
      }
    }

    // 2. Check database connection
    let dbStatus = 'Unknown';
    let userCount = 0;
    try {
      userCount = await (prisma as any).user.count();
      dbStatus = 'Connected';
    } catch (error: any) {
      dbStatus = `Error: ${error.message}`;
    }

    // 3. Check specific user if authenticated
    let dbUser = null;
    if (userInfo?.userId) {
      try {
        dbUser = await (prisma as any).user.findUnique({
          where: { id: userInfo.userId },
          select: {
            id: true,
            email: true,
            subscriptionStatus: true,
            planType: true,
          },
        });
      } catch (error: any) {
        dbUser = `Error: ${error.message}`;
      }
    }

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      auth: {
        status: authStatus,
        userInfo,
        hasAccess,
      },
      database: {
        status: dbStatus,
        userCount,
        currentUser: dbUser,
      },
      environment: {
        hasJwtSecret: !!process.env.JWT_SECRET,
        hasStripeSecret: !!process.env.STRIPE_SECRET_KEY,
        hasDatabaseUrl: !!process.env.DATABASE_URL,
        nodeEnv: process.env.NODE_ENV,
      },
    });
  } catch (error: any) {
    return NextResponse.json({
      error: error.message,
      stack: error.stack,
    }, { status: 500 });
  }
}
