import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export async function GET(req: Request) {
  try {
    const cookieHeader = req.headers.get('cookie') || '';
    const tokenMatch = cookieHeader.match(/(?:^|;\s*)token=([^;]+)/);
    const token = tokenMatch ? decodeURIComponent(tokenMatch[1]) : null;

    if (!token) {
      return NextResponse.json({ authenticated: false }, { status: 200 });
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error('JWT_SECRET is not set');
      return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 });
    }

    const payload = jwt.verify(token, jwtSecret) as {
      userId: string;
      email: string;
      emailVerified?: boolean;
      [key: string]: unknown;
    };

    return NextResponse.json({ authenticated: true, user: payload });
  } catch (error) {
    // Invalid/expired token -> treat as not authenticated
    return NextResponse.json({ authenticated: false }, { status: 200 });
  }
}


