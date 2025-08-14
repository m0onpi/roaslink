import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    
    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 });
    }

    // Find user and update with active subscription for testing
    const user = await (prisma as any).user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Update user with active subscription
    const updatedUser = await (prisma as any).user.update({
      where: { email: email.toLowerCase() },
      data: {
        subscriptionStatus: 'active',
        planType: 'month',
        subscriptionEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      },
    });

    // Generate new JWT
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      return NextResponse.json({ error: 'JWT_SECRET not configured' }, { status: 500 });
    }

    const newToken = jwt.sign(
      { 
        userId: updatedUser.id,
        email: updatedUser.email,
        subscriptionStatus: updatedUser.subscriptionStatus,
        planType: updatedUser.planType,
        hasAccess: updatedUser.subscriptionStatus === 'active'
      },
      jwtSecret,
      { expiresIn: '1d' }
    );

    const response = NextResponse.json({
      message: 'User updated with active subscription',
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        subscriptionStatus: updatedUser.subscriptionStatus,
        planType: updatedUser.planType,
      }
    });

    // Set the new token
    response.cookies.set({
      name: 'token',
      value: newToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 1 * 24 * 60 * 60,
      path: '/',
    });

    return response;
  } catch (error: any) {
    console.error('Fix user error:', error);
    return NextResponse.json({
      error: error.message,
    }, { status: 500 });
  }
}
