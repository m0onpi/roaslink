import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Get user's domains
export async function GET(req: Request) {
  try {
    const cookieHeader = req.headers.get('cookie');
    if (!cookieHeader) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const tokenMatch = cookieHeader.match(/token=([^;]+)/);
    if (!tokenMatch) {
      return NextResponse.json({ error: 'No token found' }, { status: 401 });
    }

    const token = tokenMatch[1];
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }

    const decoded = jwt.verify(token, jwtSecret) as any;
    
    // Get user's domains
    const domains = await (prisma as any).domain.findMany({
      where: { userId: decoded.userId },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ domains });
  } catch (error) {
    console.error('Get domains error:', error);
    return NextResponse.json({ error: 'Failed to fetch domains' }, { status: 500 });
  }
}

// Add new domain
export async function POST(req: Request) {
  try {
    const cookieHeader = req.headers.get('cookie');
    if (!cookieHeader) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const tokenMatch = cookieHeader.match(/token=([^;]+)/);
    if (!tokenMatch) {
      return NextResponse.json({ error: 'No token found' }, { status: 401 });
    }

    const token = tokenMatch[1];
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }

    const decoded = jwt.verify(token, jwtSecret) as any;
    const { domain, redirectUrl } = await req.json();

    // Validate input
    if (!domain || !redirectUrl) {
      return NextResponse.json({ error: 'Domain and redirect URL are required' }, { status: 400 });
    }

    // Basic domain validation
    const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9](?:\.[a-zA-Z]{2,})+$/;
    if (!domainRegex.test(domain)) {
      return NextResponse.json({ error: 'Invalid domain format' }, { status: 400 });
    }

    // Basic URL validation
    try {
      new URL(redirectUrl);
    } catch {
      return NextResponse.json({ error: 'Invalid redirect URL format' }, { status: 400 });
    }

    // Check if domain already exists
    const existingDomain = await (prisma as any).domain.findUnique({
      where: { domain: domain.toLowerCase() },
    });

    if (existingDomain) {
      return NextResponse.json({ error: 'Domain already exists' }, { status: 400 });
    }

    // Create domain
    const newDomain = await (prisma as any).domain.create({
      data: {
        domain: domain.toLowerCase(),
        redirectUrl,
        userId: decoded.userId,
      },
    });

    return NextResponse.json({ 
      message: 'Domain added successfully',
      domain: newDomain 
    });
  } catch (error) {
    console.error('Add domain error:', error);
    return NextResponse.json({ error: 'Failed to add domain' }, { status: 500 });
  }
}
