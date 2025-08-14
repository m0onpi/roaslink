import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req: Request) {
  try {
    const cookieHeader = req.headers.get('cookie');
    console.log('Cookie header:', cookieHeader);

    if (!cookieHeader) {
      return NextResponse.json({ error: 'No cookies found' });
    }

    // Extract token from cookies
    const tokenMatch = cookieHeader.match(/token=([^;]+)/);
    console.log('Token match:', tokenMatch);

    if (!tokenMatch) {
      return NextResponse.json({ error: 'No token found in cookies' });
    }

    const token = tokenMatch[1];
    const jwtSecret = process.env.JWT_SECRET;
    
    if (!jwtSecret) {
      return NextResponse.json({ error: 'JWT_SECRET not configured' });
    }

    // Verify JWT
    const decoded = jwt.verify(token, jwtSecret) as any;
    console.log('Decoded JWT:', decoded);
    
    // Test database connection
    const userCount = await (prisma as any).user.count();
    console.log('Total users in database:', userCount);

    // Get user from database
    const user = await (prisma as any).user.findUnique({
      where: { id: decoded.userId },
    });
    
    console.log('Found user:', user);

    return NextResponse.json({
      success: true,
      decoded,
      user,
      userCount,
      hasJwtSecret: !!jwtSecret,
    });
  } catch (error: any) {
    console.error('Debug error:', error);
    return NextResponse.json({
      error: error.message,
      stack: error.stack,
    });
  }
}
