import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 1x1 transparent pixel GIF (base64 encoded)
const PIXEL_GIF = Buffer.from(
  'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
  'base64'
);

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  
  try {
    // Extract tracking data from URL parameters
    const sessionId = searchParams.get('sessionId');
    const domain = searchParams.get('domain');
    const eventType = searchParams.get('eventType');
    const page = searchParams.get('page');
    const timestamp = searchParams.get('timestamp');
    const userAgent = searchParams.get('userAgent');
    const referrer = searchParams.get('referrer');
    const title = searchParams.get('title');
    const url = searchParams.get('url');

    console.log('Pixel tracking request:', { sessionId, domain, eventType });

    // Validate required fields
    if (!sessionId || !domain || !eventType || !page) {
      console.log('Missing required fields:', { sessionId, domain, eventType, page });
      // Still return pixel - don't break user experience
      return new NextResponse(PIXEL_GIF, {
        status: 200,
        headers: {
          'Content-Type': 'image/gif',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
      });
    }

    // Get domain record
    const domainRecord = await prisma.domain.findUnique({
      where: { domain },
      select: { id: true, isActive: true },
    });

    if (!domainRecord || !domainRecord.isActive) {
      console.log('Domain not found or inactive:', domain);
      // Still return pixel - don't break user experience
      return new NextResponse(PIXEL_GIF, {
        status: 200,
        headers: {
          'Content-Type': 'image/gif',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
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

    // Collect event-specific data from URL parameters
    const eventData: any = {};
    for (const [key, value] of searchParams.entries()) {
      if (key.startsWith('data_')) {
        const cleanKey = key.replace('data_', '');
        try {
          // Try to parse as JSON first
          eventData[cleanKey] = JSON.parse(value);
        } catch {
          // If not JSON, store as string
          eventData[cleanKey] = value;
        }
      }
    }

    // Create tracking event
    await prisma.trackingEvent.create({
      data: {
        sessionId: session.id, // Use session.id, not session.sessionId (foreign key reference)
        eventType,
        page,
        element: eventData.element || null,
        data: Object.keys(eventData).length > 0 ? eventData : null,
        timestamp: new Date(timestamp || Date.now()),
      },
    });

    console.log('Tracking event saved successfully:', { 
      sessionId, 
      eventType, 
      sessionDbId: session.id,
      eventDataKeys: Object.keys(eventData)
    });

    // Return 1x1 transparent pixel GIF
    return new NextResponse(PIXEL_GIF, {
      status: 200,
      headers: {
        'Content-Type': 'image/gif',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        // No CORS headers needed for images!
      },
    });

  } catch (error) {
    console.error('Pixel tracking error:', error);
    
    // Always return pixel even on error - don't break user experience
    return new NextResponse(PIXEL_GIF, {
      status: 200,
      headers: {
        'Content-Type': 'image/gif',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  }
}
