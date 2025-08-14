import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Delete domain
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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
    const { id } = await params;

    // Check if domain exists and belongs to user
    const domain = await prisma.domain.findFirst({
      where: {
        id,
        userId: decoded.userId,
      },
    });

    if (!domain) {
      return NextResponse.json({ error: 'Domain not found' }, { status: 404 });
    }

    // Delete domain
    await prisma.domain.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Domain deleted successfully' });
  } catch (error) {
    console.error('Delete domain error:', error);
    return NextResponse.json({ error: 'Failed to delete domain' }, { status: 500 });
  }
}

// Update domain
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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
    const { id } = await params;
    const { redirectUrl, isActive } = await req.json();

    // Check if domain exists and belongs to user
    const domain = await prisma.domain.findFirst({
      where: {
        id,
        userId: decoded.userId,
      },
    });

    if (!domain) {
      return NextResponse.json({ error: 'Domain not found' }, { status: 404 });
    }

    // Validate redirect URL if provided
    if (redirectUrl) {
      try {
        new URL(redirectUrl);
      } catch {
        return NextResponse.json({ error: 'Invalid redirect URL format' }, { status: 400 });
      }
    }

    // Update domain
    const updatedDomain = await prisma.domain.update({
      where: { id },
      data: {
        ...(redirectUrl && { redirectUrl }),
        ...(typeof isActive === 'boolean' && { isActive }),
      },
    });

    return NextResponse.json({ 
      message: 'Domain updated successfully',
      domain: updatedDomain 
    });
  } catch (error) {
    console.error('Update domain error:', error);
    return NextResponse.json({ error: 'Failed to update domain' }, { status: 500 });
  }
}
