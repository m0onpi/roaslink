import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();
    
    if (!email || !password) {
      return NextResponse.json({ 
        error: 'Email and password required',
        debug: 'Provide email and password in request body'
      }, { status: 400 });
    }

    // Find user
    const user = await (prisma as any).user.findUnique({
      where: { email: email.toLowerCase() },
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
      return NextResponse.json({
        error: 'User not found',
        debug: `No user found with email: ${email}`
      }, { status: 404 });
    }

    if (!user.password) {
      return NextResponse.json({
        error: 'No password set for user',
        debug: 'User exists but has no password'
      }, { status: 400 });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return NextResponse.json({
        error: 'Invalid password',
        debug: 'Password does not match'
      }, { status: 401 });
    }

    // Generate JWT
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      return NextResponse.json({
        error: 'JWT_SECRET not configured'
      }, { status: 500 });
    }

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

    const response = NextResponse.json({
      success: true,
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        subscriptionStatus: user.subscriptionStatus,
        planType: user.planType,
        hasAccess: user.subscriptionStatus === 'active'
      },
      debug: 'Fresh JWT token set in cookies'
    });

    // Set fresh token
    response.cookies.set({
      name: 'token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 1 * 24 * 60 * 60, // 1 day
      path: '/',
    });

    return response;
  } catch (error: any) {
    console.error('Test login error:', error);
    return NextResponse.json({
      error: error.message,
      debug: 'Login test failed'
    }, { status: 500 });
  }
}
