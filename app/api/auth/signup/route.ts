import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { 
      name, 
      email, 
      password, 
      experience, 
      tradingStyle, 
      goals,
      timeCommitment,
      riskTolerance,
      preferredMarkets,
      tradingFrequency,
      currentTools,
      motivation,
      challenges
    } = await req.json();

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');

    // Create user and verification token in a transaction
    const user = await prisma.$transaction(async (prisma: PrismaClient) => {
      // Create user
      const user = await prisma.user.create({
        data: {
          name,
          email: email.toLowerCase(),
          password: hashedPassword,
          onboardingData: {
            experience,
            tradingStyle,
            goals,
            timeCommitment,
            riskTolerance,
            preferredMarkets,
            tradingFrequency,
            currentTools,
            motivation,
            challenges
          }
        },
      });

      // Create verification token
      await prisma.verificationToken.create({
        data: {
          token: verificationToken,
          email: user.email,
          expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        },
      });

      return user;
    });

    // Send verification email

    return NextResponse.json({
      message: 'Registration successful. Please check your email to verify your account.',
    });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Registration failed' },
      { status: 500 }
    );
  }
} 