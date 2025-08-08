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

  // Server-side browser detection - completely hidden from client
  const isNativeBrowser = 
    userAgent.toLowerCase().includes("safari") && !userAgent.toLowerCase().includes("chrome") ||
    userAgent.toLowerCase().includes("chrome") && !userAgent.toLowerCase().includes("instagram") && !userAgent.toLowerCase().includes("facebook") && !userAgent.toLowerCase().includes("twitter") ||
    userAgent.toLowerCase().includes("firefox") || 
    userAgent.toLowerCase().includes("edge") || 
    userAgent.toLowerCase().includes("opera");

  // For native browsers: direct HTTP redirect
  if (isNativeBrowser) {
    return NextResponse.redirect(target);
  }

  // For in-app browsers: return obfuscated script
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
    // Fallback to minimal script if file read fails
    const minimalScript = `
(function(){
  var t='${target}';
  var p=window.location.pathname+window.location.search;
  var u=t+p;
  window.location.replace(u);
})();`;

    return new NextResponse(minimalScript, {
      headers: {
        'Content-Type': 'application/javascript',
        'Cache-Control': 'public, max-age=3600',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }
}
