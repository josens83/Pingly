import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

/**
 * Analytics API Endpoint
 * Receives analytics events from the client
 */

interface AnalyticsEvent {
  name: string;
  properties?: Record<string, unknown>;
  timestamp?: string;
  userId?: string;
  sessionId?: string;
  deviceId?: string;
}

interface AnalyticsPayload {
  events: AnalyticsEvent[];
  session?: {
    sessionId: string;
    startTime: string;
    lastActiveTime: string;
    pageViews: number;
    events: number;
  };
  user?: {
    userId: string;
    email?: string;
    name?: string;
  };
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const payload: AnalyticsPayload = await request.json();

    // Validate payload
    if (!payload.events || !Array.isArray(payload.events)) {
      return NextResponse.json(
        { error: 'Invalid payload: events array required' },
        { status: 400 }
      );
    }

    // Enrich events with server-side data
    const enrichedEvents = payload.events.map((event) => ({
      ...event,
      serverTimestamp: new Date().toISOString(),
      userId: session?.user?.email || payload.user?.userId || event.userId,
      userAgent: request.headers.get('user-agent'),
      ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
      referer: request.headers.get('referer'),
    }));

    // In production, send to analytics service (e.g., Mixpanel, Amplitude, BigQuery)
    // For now, log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log('[Analytics] Received events:', enrichedEvents.length);
      enrichedEvents.forEach((event) => {
        console.log(`  - ${event.name}:`, event.properties || {});
      });
    }

    // TODO: Send to analytics backend
    // await sendToAnalyticsBackend(enrichedEvents, payload.session);

    return NextResponse.json({
      success: true,
      received: enrichedEvents.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[Analytics] Error processing events:', error);

    return NextResponse.json(
      { error: 'Failed to process analytics events' },
      { status: 500 }
    );
  }
}

export async function GET() {
  // Health check endpoint
  return NextResponse.json({
    status: 'ok',
    service: 'analytics',
    timestamp: new Date().toISOString(),
  });
}
