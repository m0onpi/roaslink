import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    // Find user with subscription info
    const user = await (prisma as any).user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        password: true,
        subscriptionStatus: true,
        planType: true,
        subscriptionEndsAt: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 400 }
      );
    }



    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password!);

    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 400 }
      );
    }

    // Check for JWT secret
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error('JWT_SECRET is not set in environment variables');
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }

    // Generate JWT with subscription info
    const token = jwt.sign(
      { 
        userId: user.id,
        email: user.email,
        subscriptionStatus: user.subscriptionStatus,
        planType: user.planType,
        hasAccess: user.subscriptionStatus === 'active'
      },
      jwtSecret,
      { expiresIn: '1d' }
    );

    // Create response with user data
    const response = NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    });

    // Set the token as an HTTP-only cookie
    response.cookies.set({
      name: 'token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 1 * 24 * 60 * 60, // 1 day
      path: '/', // Ensure cookie is available site-wide
    });

    console.log('Login successful for user:', user.email);

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Login failed' },
      { status: 500 }
    );
  }
}