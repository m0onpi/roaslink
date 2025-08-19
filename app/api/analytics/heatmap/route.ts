import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    // Verify JWT token
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      return NextResponse.json({ error: 'JWT secret not configured' }, { status: 500 });
    }

    const decoded = jwt.verify(token, jwtSecret) as any;
    const { searchParams } = new URL(request.url);
    const domainFilter = searchParams.get('domain');
    const days = parseInt(searchParams.get('days') || '7');
    const pageFilter = searchParams.get('page');

    // Get user's domains
    const userDomains = await prisma.domain.findMany({
      where: { userId: decoded.userId },
      select: { id: true, domain: true },
    });

    if (userDomains.length === 0) {
      return NextResponse.json({ error: 'No domains found' }, { status: 404 });
    }

    const domainIds = userDomains.map(d => d.id);
    const dateFilter = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    // Build where clause
    const whereClause: any = {
      domainOwner: { id: { in: domainIds } },
      createdAt: { gte: dateFilter },
    };

    if (domainFilter) {
      whereClause.domain = domainFilter;
    }

    // Get exit/abandon events with smart filtering
    const exitEvents = await prisma.trackingEvent.findMany({
      where: {
        session: whereClause,
        OR: [
          { eventType: 'page_exit' },
          { eventType: 'potential_exit' },
          { eventType: 'session_timeout' },
        ],
        ...(pageFilter ? { page: { contains: pageFilter } } : {}),
      },
      select: {
        eventType: true,
        page: true,
        data: true,
        timestamp: true,
        session: {
          select: {
            domain: true,
            pageCount: true,
            duration: true,
          }
        }
      },
      orderBy: { timestamp: 'desc' },
      take: 1000, // Limit to prevent large queries
    });

    // Get interaction events for heatmap (only meaningful ones)
    const interactionEvents = await prisma.trackingEvent.findMany({
      where: {
        session: whereClause,
        eventType: 'interaction',
        ...(pageFilter ? { page: { contains: pageFilter } } : {}),
      },
      select: {
        page: true,
        data: true,
        timestamp: true,
        session: {
          select: {
            domain: true,
          }
        }
      },
      orderBy: { timestamp: 'desc' },
      take: 500, // Limit interaction events
    });

    // Process exit data for heatmap
    const exitHeatmapData = exitEvents
      .filter(event => {
        const data = event.data as any;
        // Only include exits with engagement context
        return data && (data.engagementScore > 0 || data.maxScrollDepth > 10);
      })
      .map(event => {
        const data = event.data as any;
        return {
          page: event.page,
          eventType: event.eventType,
          domain: event.session.domain,
          timeOnPage: data?.timeOnPage || 0,
          engagementScore: data?.engagementScore || 0,
          maxScrollDepth: data?.maxScrollDepth || 0,
          scrollMilestones: data?.scrollMilestones || [],
          timestamp: event.timestamp,
          sessionDuration: event.session.duration,
          pageCount: event.session.pageCount,
        };
      });

    // Process interaction data for click heatmap
    const clickHeatmapData = interactionEvents
      .filter(event => {
        const data = event.data as any;
        // Only include interactions with valid coordinates
        return data && data.viewportX && data.viewportY;
      })
      .map(event => {
        const data = event.data as any;
        return {
          page: event.page,
          domain: event.session.domain,
          x: data.viewportX,
          y: data.viewportY,
          element: data.element,
          elementType: data.elementType,
          elementText: data.elementText,
          timestamp: event.timestamp,
        };
      });

    // Aggregate exit points by page
    const exitByPage = exitHeatmapData.reduce((acc: any, exit) => {
      const key = `${exit.domain}${exit.page}`;
      if (!acc[key]) {
        acc[key] = {
          page: exit.page,
          domain: exit.domain,
          totalExits: 0,
          avgTimeOnPage: 0,
          avgEngagement: 0,
          avgScrollDepth: 0,
          exits: []
        };
      }
      acc[key].totalExits++;
      acc[key].exits.push(exit);
      return acc;
    }, {});

    // Calculate averages for exit points
    Object.values(exitByPage).forEach((pageData: any) => {
      const exits = pageData.exits;
      pageData.avgTimeOnPage = exits.reduce((sum: number, e: any) => sum + e.timeOnPage, 0) / exits.length;
      pageData.avgEngagement = exits.reduce((sum: number, e: any) => sum + e.engagementScore, 0) / exits.length;
      pageData.avgScrollDepth = exits.reduce((sum: number, e: any) => sum + e.maxScrollDepth, 0) / exits.length;
    });

    // Aggregate clicks by coordinates (for heatmap visualization)
    const clickDensity = clickHeatmapData.reduce((acc: any, click) => {
      const key = `${click.domain}${click.page}`;
      if (!acc[key]) {
        acc[key] = {
          page: click.page,
          domain: click.domain,
          clicks: []
        };
      }
      acc[key].clicks.push({
        x: click.x,
        y: click.y,
        element: click.element,
        elementType: click.elementType,
        elementText: click.elementText,
      });
      return acc;
    }, {});

    // Get conversion data for comparison
    const conversions = await prisma.trackingEvent.findMany({
      where: {
        session: whereClause,
        eventType: 'conversion',
      },
      select: {
        page: true,
        data: true,
        session: {
          select: {
            domain: true,
          }
        }
      },
    });

    const conversionsByPage = conversions.reduce((acc: any, conv) => {
      const key = `${conv.session.domain}${conv.page}`;
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    return NextResponse.json({
      exitHeatmap: Object.values(exitByPage),
      clickHeatmap: Object.values(clickDensity),
      conversions: conversionsByPage,
      summary: {
        totalExits: exitHeatmapData.length,
        totalInteractions: clickHeatmapData.length,
        totalConversions: conversions.length,
        timeRange: { days, from: dateFilter },
        domains: userDomains.map(d => d.domain),
      }
    });

  } catch (error) {
    console.error('Heatmap analytics error:', error);
    return NextResponse.json({ error: 'Failed to fetch heatmap data' }, { status: 500 });
  }
}
