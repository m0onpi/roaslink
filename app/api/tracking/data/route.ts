import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
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
      return new NextResponse('Missing required fields', { status: 400 });
    }

    // Get domain record
    const domainRecord = await prisma.domain.findUnique({
      where: { domain },
      select: { id: true, isActive: true },
    });

    if (!domainRecord) {
      return new NextResponse('Domain not found', { status: 404 });
    }

    if (!domainRecord.isActive) {
      return new NextResponse('Domain is not active', { status: 403 });
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

    return new NextResponse('OK', { status: 200 });

  } catch (error) {
    console.error('Tracking data error:', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
}


