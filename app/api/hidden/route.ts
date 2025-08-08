import { NextRequest, NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import { join } from 'path';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const target = searchParams.get('target');

  if (!target) {
    return new NextResponse('Missing target', { status: 400 });
  }

  try {
    const rawScript = readFileSync(join(process.cwd(), 'test.obf.js'), 'utf8');
    const script = rawScript.replace(/__TARGET__/g, target);

    return new NextResponse(script, {
      headers: {
        'Content-Type': 'application/javascript',
        'Cache-Control': 'public, max-age=3600',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  } catch (error) {
    return new NextResponse('Script file not found', { status: 500 });
  }
}
