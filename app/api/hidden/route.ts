import { NextRequest, NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import { join } from 'path';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const target = searchParams.get('target');
  const userAgent = request.headers.get('user-agent') || '';

  if (!target) {
    return new NextResponse('Missing target', { status: 400 });
  }

  // Basic target domain validation (prevent JS injection abuse)
  const cleanTarget = target.replace(/^https?:\/\//, '');
  const domainRegex = /^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!domainRegex.test(cleanTarget)) {
    return new NextResponse('Invalid target domain', { status: 400 });
  }

  // Server-side detection
  const ua = userAgent.toLowerCase();
  const isNativeBrowser =
    (ua.includes('safari') && !ua.includes('chrome')) ||
    (ua.includes('chrome') &&
      !ua.includes('instagram') &&
      !ua.includes('facebook') &&
      !ua.includes('twitter')) ||
    ua.includes('firefox') ||
    ua.includes('edge') ||
    ua.includes('opera');

  // ✅ Native browser: do server redirect
  if (isNativeBrowser) {
    return NextResponse.redirect(target);
  }

  // ❌ In-app: return obfuscated JS
  try {
    const obfuscatedPath = join(process.cwd(), 'test.obf.js');
    const rawScript = readFileSync(obfuscatedPath, 'utf8');
    const scriptWithTarget = rawScript.replace(/__TARGET__/g, target);

    return new NextResponse(scriptWithTarget, {
      headers: {
        'Content-Type': 'application/javascript',
        'Cache-Control': 'public, max-age=3600',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  } catch (error) {
    return new NextResponse('Obfuscated script not found', { status: 500 });
  }
}
