import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Cache for validated domains to improve performance
const domainValidationCache = new Map<string, { isValid: boolean; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Helper function to extract domain from origin URL
function extractDomainFromOrigin(origin: string): string {
  try {
    const url = new URL(origin);
    return url.hostname.replace(/^www\./, ''); // Remove www. prefix
  } catch {
    return '';
  }
}

// Check if domain is confirmed and paid for
async function isDomainValidForCors(origin: string): Promise<boolean> {
  if (!origin) return false;
  
  const domain = extractDomainFromOrigin(origin);
  if (!domain) return false;
  
  // Check cache first
  const cached = domainValidationCache.get(domain);
  if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
    return cached.isValid;
  }
  
  try {
    // Check database for domain with active user subscription
    const domainRecord = await prisma.domain.findFirst({
      where: {
        OR: [
          { domain: domain },
          { domain: `www.${domain}` } // Also check www variant
        ],
        isActive: true,
      },
      include: {
        user: {
          select: {
            subscriptionStatus: true,
            subscriptionEndsAt: true,
          }
        }
      }
    });
    
    const isValid = !!(
      domainRecord &&
      domainRecord.user.subscriptionStatus === 'active' &&
      domainRecord.user.subscriptionEndsAt &&
      new Date(domainRecord.user.subscriptionEndsAt) > new Date()
    );
    
    // Cache the result
    domainValidationCache.set(domain, {
      isValid,
      timestamp: Date.now()
    });
    
    return isValid;
  } catch (error) {
    console.error('Error validating domain for CORS:', error);
    return false;
  }
}

// Helper function to get CORS headers
async function getCorsHeaders(origin?: string | null) {
  let allowOrigin = '*'; // Default fallback
  
  if (origin) {
    const isValidDomain = await isDomainValidForCors(origin);
    if (isValidDomain) {
      allowOrigin = origin; // Allow the specific origin if domain is valid
    }
  }
  
  return {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    'Access-Control-Max-Age': '86400', // 24 hours
  };
}

export async function POST(request: NextRequest) {
  try {
    // Log for debugging CORS issues
    const origin = request.headers.get('origin');
    console.log('POST request received from origin:', origin);
    
    const data = await request.json();
    
    const {
      sessionId,
      domain,
      eventType,
      page,
      timestamp,
      userAgent,
      referrer,
      ...eventData
    } = data;

    // Validate required fields
    if (!sessionId || !domain || !eventType || !page) {
      return new NextResponse('Missing required fields', { 
        status: 400,
        headers: await getCorsHeaders(request.headers.get('origin'))
      });
    }

    // Get domain record
    const domainRecord = await prisma.domain.findUnique({
      where: { domain },
      select: { id: true, isActive: true },
    });

    if (!domainRecord) {
      return new NextResponse('Domain not found', { 
        status: 404,
        headers: await getCorsHeaders(request.headers.get('origin'))
      });
    }

    if (!domainRecord.isActive) {
      return new NextResponse('Domain is not active', { 
        status: 403,
        headers: await getCorsHeaders(request.headers.get('origin'))
      });
    }

    // Get or create tracking session
    let session = await prisma.trackingSession.findUnique({
      where: { sessionId },
    });

    if (!session) {
      // Create new session
      session = await prisma.trackingSession.create({
        data: {
          sessionId,
          domainId: domainRecord.id,
          domain,
          userAgent: userAgent || null,
          referrer: referrer || null,
          startTime: new Date(timestamp || Date.now()),
          lastActivity: new Date(),
          pageCount: 1,
        },
      });
    } else {
      // Update existing session
      const updateData: any = {
        lastActivity: new Date(),
      };

      // If this is a page view, increment page count
      if (eventType === 'page_view') {
        updateData.pageCount = session.pageCount + 1;
      }

      // If this is an exit event, mark session as ended
      if (eventType === 'page_exit' || eventType === 'session_timeout') {
        updateData.endTime = new Date();
        updateData.isActive = false;
        updateData.exitPage = page;
        
        // Calculate duration in seconds
        const startTime = new Date(session.startTime);
        const endTime = new Date();
        updateData.duration = Math.round((endTime.getTime() - startTime.getTime()) / 1000);
      }

      session = await prisma.trackingSession.update({
        where: { sessionId },
        data: updateData,
      });
    }

    // Create tracking event
    await prisma.trackingEvent.create({
      data: {
        sessionId: session.sessionId,
        eventType,
        page,
        element: eventData.element || null,
        data: Object.keys(eventData).length > 0 ? eventData : null,
        timestamp: new Date(timestamp || Date.now()),
      },
    });

    return new NextResponse('OK', { 
      status: 200,
      headers: await getCorsHeaders(request.headers.get('origin'))
    });

  } catch (error) {
    console.error('Tracking data error:', error);
    return new NextResponse('Internal server error', { 
      status: 500,
      headers: await getCorsHeaders(request.headers.get('origin'))
    });
  }
}

// Handle preflight requests for CORS
export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin');
  console.log('OPTIONS request received from origin:', origin);
  
  const corsHeaders = await getCorsHeaders(origin);
  console.log('Returning CORS headers:', corsHeaders);
  
  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders,
  });
}

