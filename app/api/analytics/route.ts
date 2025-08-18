import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const cookieHeader = request.headers.get('cookie');
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

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const domainId = searchParams.get('domainId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const limit = parseInt(searchParams.get('limit') || '100');

    // Build where clause
    const whereClause: any = {};
    
    if (domainId) {
      // Verify user owns this domain
      const domain = await prisma.domain.findFirst({
        where: {
          id: domainId,
          userId: decoded.userId,
        },
      });
      
      if (!domain) {
        return NextResponse.json({ error: 'Domain not found' }, { status: 404 });
      }
      
      whereClause.domainId = domainId;
    } else {
      // Get all user's domains
      const userDomains = await prisma.domain.findMany({
        where: { userId: decoded.userId },
        select: { id: true },
      });
      
      whereClause.domainId = {
        in: userDomains.map(d => d.id),
      };
    }

    // Add date filters
    if (startDate || endDate) {
      whereClause.createdAt = {};
      if (startDate) {
        whereClause.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        whereClause.createdAt.lte = new Date(endDate);
      }
    }

    // Get sessions with events
    const sessions = await prisma.trackingSession.findMany({
      where: whereClause,
      include: {
        events: {
          orderBy: { timestamp: 'asc' },
        },
        domainOwner: {
          select: { domain: true },
        },
      },
      orderBy: { startTime: 'desc' },
      take: limit,
    });

    // Get summary statistics
    const totalSessions = await prisma.trackingSession.count({
      where: whereClause,
    });

    const avgDuration = await prisma.trackingSession.aggregate({
      where: {
        ...whereClause,
        duration: { not: null },
      },
      _avg: {
        duration: true,
      },
    });

    const avgPageCount = await prisma.trackingSession.aggregate({
      where: whereClause,
      _avg: {
        pageCount: true,
      },
    });

    // Get most common exit pages
    const exitPages = await prisma.trackingSession.groupBy({
      by: ['exitPage'],
      where: {
        ...whereClause,
        exitPage: { not: null },
      },
      _count: {
        exitPage: true,
      },
      orderBy: {
        _count: {
          exitPage: 'desc',
        },
      },
      take: 10,
    });

    // Get event type distribution
    const eventTypes = await prisma.trackingEvent.groupBy({
      by: ['eventType'],
      where: {
        session: whereClause,
      },
      _count: {
        eventType: true,
      },
      orderBy: {
        _count: {
          eventType: 'desc',
        },
      },
    });

    // Get page views by page
    const pageViews = await prisma.trackingEvent.groupBy({
      by: ['page'],
      where: {
        session: whereClause,
        eventType: 'page_view',
      },
      _count: {
        page: true,
      },
      orderBy: {
        _count: {
          page: 'desc',
        },
      },
      take: 10,
    });

    // Get hourly activity (last 24 hours)
    const last24Hours = new Date();
    last24Hours.setHours(last24Hours.getHours() - 24);

    const hourlyActivity = await prisma.trackingSession.findMany({
      where: {
        ...whereClause,
        startTime: {
          gte: last24Hours,
        },
      },
      select: {
        startTime: true,
      },
    });

    // Group by hour
    const hourlyStats = Array.from({ length: 24 }, (_, i) => {
      const hour = new Date();
      hour.setHours(hour.getHours() - i);
      const hourStart = new Date(hour);
      hourStart.setMinutes(0, 0, 0);
      const hourEnd = new Date(hourStart);
      hourEnd.setHours(hourEnd.getHours() + 1);

      const count = hourlyActivity.filter(session => {
        const sessionTime = new Date(session.startTime);
        return sessionTime >= hourStart && sessionTime < hourEnd;
      }).length;

      return {
        hour: hourStart.getHours(),
        count,
      };
    }).reverse();

    return NextResponse.json({
      sessions,
      summary: {
        totalSessions,
        averageDuration: Math.round(avgDuration._avg.duration || 0),
        averagePageCount: Math.round((avgPageCount._avg.pageCount || 0) * 100) / 100,
        totalEvents: sessions.reduce((sum, session) => sum + session.events.length, 0),
      },
      exitPages: exitPages.map(ep => ({
        page: ep.exitPage,
        count: ep._count.exitPage,
      })),
      eventTypes: eventTypes.map(et => ({
        type: et.eventType,
        count: et._count.eventType,
      })),
      pageViews: pageViews.map(pv => ({
        page: pv.page,
        count: pv._count.page,
      })),
      hourlyActivity: hourlyStats,
    });

  } catch (error) {
    console.error('Analytics error:', error);
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}
