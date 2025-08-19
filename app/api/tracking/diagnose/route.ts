import { NextRequest, NextResponse } from 'next/server';

// Comprehensive diagnostic endpoint to test CORS and connectivity
export async function GET(request: NextRequest) {
  const origin = request.headers.get('origin');
  const userAgent = request.headers.get('user-agent');
  const timestamp = new Date().toISOString();
  
  console.log(`[DIAGNOSE GET] ${timestamp} - Origin: ${origin}`);
  
  const diagnosticData = {
    status: 'OK',
    method: 'GET',
    timestamp,
    origin,
    userAgent: userAgent?.substring(0, 100),
    headers: {
      'content-type': request.headers.get('content-type'),
      'accept': request.headers.get('accept'),
      'referer': request.headers.get('referer'),
    },
    message: 'Diagnostic endpoint is working - CORS should be functional'
  };

  return new NextResponse(JSON.stringify(diagnosticData, null, 2), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
      'Cache-Control': 'no-cache',
    },
  });
}

export async function POST(request: NextRequest) {
  const origin = request.headers.get('origin');
  const timestamp = new Date().toISOString();
  
  console.log(`[DIAGNOSE POST] ${timestamp} - Origin: ${origin}`);
  
  try {
    const body = await request.text();
    let parsedBody;
    
    try {
      parsedBody = JSON.parse(body);
    } catch (e) {
      parsedBody = { raw: body, parseError: 'Invalid JSON' };
    }
    
    const diagnosticData = {
      status: 'OK',
      method: 'POST',
      timestamp,
      origin,
      bodyReceived: !!body,
      bodyLength: body.length,
      parsedBody,
      headers: {
        'content-type': request.headers.get('content-type'),
        'content-length': request.headers.get('content-length'),
      },
      message: 'POST diagnostic successful - CORS and request parsing working'
    };

    console.log('[DIAGNOSE POST] Success:', diagnosticData);

    return new NextResponse(JSON.stringify(diagnosticData, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
        'Cache-Control': 'no-cache',
      },
    });
    
  } catch (error) {
    console.error('[DIAGNOSE POST] Error:', error);
    
    const errorData = {
      status: 'ERROR',
      method: 'POST',
      timestamp,
      origin,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'POST diagnostic failed'
    };

    return new NextResponse(JSON.stringify(errorData, null, 2), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
      },
    });
  }
}

export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin');
  const timestamp = new Date().toISOString();
  
  console.log(`[DIAGNOSE OPTIONS] ${timestamp} - Origin: ${origin}`);
  
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
      'Access-Control-Max-Age': '86400',
      'Cache-Control': 'no-cache',
    },
  });
}
