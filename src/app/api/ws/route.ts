/**
 * WebSocket API Route Handler
 *
 * Handles WebSocket connections for real-time features:
 * - Presence awareness
 * - Real-time notifications
 * - Campaign status updates
 * - Collaborative editing
 *
 * Note: Next.js App Router doesn't natively support WebSocket.
 * For production, consider using:
 * - Socket.io with a custom server
 * - Pusher/Ably for managed WebSocket
 * - Server-Sent Events (SSE) as an alternative
 *
 * This file provides Server-Sent Events (SSE) as a fallback.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// Event types
type EventType =
  | 'connection'
  | 'presence:update'
  | 'presence:leave'
  | 'notification'
  | 'campaign:status'
  | 'sync:update'
  | 'ping';

interface SSEEvent {
  type: EventType;
  data: unknown;
  id?: string;
  retry?: number;
}

// In-memory connection store (use Redis in production)
const connections = new Map<string, {
  userId: string;
  lastSeen: Date;
  rooms: Set<string>;
}>();

// Format SSE message
function formatSSE(event: SSEEvent): string {
  let message = '';

  if (event.id) {
    message += `id: ${event.id}\n`;
  }

  if (event.retry) {
    message += `retry: ${event.retry}\n`;
  }

  message += `event: ${event.type}\n`;
  message += `data: ${JSON.stringify(event.data)}\n\n`;

  return message;
}

/**
 * GET handler for Server-Sent Events
 */
export async function GET(request: NextRequest) {
  // Verify authentication
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  const userId = session.user.id;
  const connectionId = `${userId}-${Date.now()}`;

  // Create a readable stream for SSE
  const encoder = new TextEncoder();
  let intervalId: NodeJS.Timeout | null = null;

  const stream = new ReadableStream({
    start(controller) {
      // Register connection
      connections.set(connectionId, {
        userId,
        lastSeen: new Date(),
        rooms: new Set(),
      });

      // Send initial connection event
      const connectEvent = formatSSE({
        type: 'connection',
        data: {
          connectionId,
          userId,
          timestamp: new Date().toISOString(),
        },
        retry: 3000,
      });
      controller.enqueue(encoder.encode(connectEvent));

      // Send heartbeat every 30 seconds
      intervalId = setInterval(() => {
        const pingEvent = formatSSE({
          type: 'ping',
          data: { timestamp: new Date().toISOString() },
        });

        try {
          controller.enqueue(encoder.encode(pingEvent));

          // Update last seen
          const conn = connections.get(connectionId);
          if (conn) {
            conn.lastSeen = new Date();
          }
        } catch {
          // Connection closed
          if (intervalId) {
            clearInterval(intervalId);
          }
        }
      }, 30000);
    },

    cancel() {
      // Cleanup on disconnect
      if (intervalId) {
        clearInterval(intervalId);
      }
      connections.delete(connectionId);
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}

/**
 * POST handler for sending events
 */
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const { type, data, targetUserId, roomId } = body;

    // Validate event type
    const validTypes: EventType[] = [
      'presence:update',
      'presence:leave',
      'notification',
      'campaign:status',
      'sync:update',
    ];

    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: 'Invalid event type' },
        { status: 400 }
      );
    }

    // In production, this would broadcast to connected clients
    // via Redis pub/sub or a message queue

    return NextResponse.json({
      success: true,
      event: {
        type,
        data,
        targetUserId,
        roomId,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('WebSocket POST error:', error);
    return NextResponse.json(
      { error: 'Failed to send event' },
      { status: 500 }
    );
  }
}

/**
 * Get active connections (admin only)
 */
export async function OPTIONS(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  // Return connection stats
  const stats = {
    totalConnections: connections.size,
    connections: Array.from(connections.entries()).map(([id, conn]) => ({
      connectionId: id,
      userId: conn.userId,
      lastSeen: conn.lastSeen.toISOString(),
      rooms: Array.from(conn.rooms),
    })),
  };

  return NextResponse.json(stats);
}
