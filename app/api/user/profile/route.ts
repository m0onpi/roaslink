import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export async function GET(req: Request) {
  try {
    const cookieHeader = req.headers.get('cookie') || '';
    const tokenMatch = cookieHeader.match(/(?:^|;\s*)token=([^;]+)/);
    const token = tokenMatch ? decodeURIComponent(tokenMatch[1]) : null;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) return NextResponse.json({ error: 'Server error' }, { status: 500 });

    const payload = jwt.verify(token, jwtSecret) as { userId: string; email: string; [k: string]: unknown };
    // If you want DB data, query here with Prisma by userId
    return NextResponse.json({ user: { id: payload.userId, email: payload.email, name: (payload as any).name || '' } });
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}


