/**
 * Real-time Notification API
 *
 * Sends real-time notifications to connected clients.
 * Integrates with:
 * - WebSocket/SSE connections
 * - Push notifications (FCM/APNs)
 * - Email notifications (for offline users)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';

// Notification schema
const NotificationSchema = z.object({
  type: z.enum(['info', 'success', 'warning', 'error']),
  title: z.string().min(1).max(100),
  message: z.string().max(500).optional(),
  targetUserIds: z.array(z.string()).optional(),
  roomId: z.string().optional(),
  broadcast: z.boolean().default(false),
  data: z.record(z.string(), z.unknown()).optional(),
  priority: z.enum(['low', 'normal', 'high']).default('normal'),
  expiresIn: z.number().optional(), // seconds
});

// In-memory notification store (use Redis in production)
const notifications: Map<string, {
  id: string;
  userId: string;
  type: string;
  title: string;
  message?: string;
  data?: Record<string, unknown>;
  createdAt: Date;
  read: boolean;
  expiresAt?: Date;
}> = new Map();

// Notification ID generator
function generateNotificationId(): string {
  return `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * POST - Send notification
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
    const validatedData = NotificationSchema.parse(body);

    const notificationId = generateNotificationId();
    const now = new Date();
    const expiresAt = validatedData.expiresIn
      ? new Date(now.getTime() + validatedData.expiresIn * 1000)
      : undefined;

    // Determine target users
    const targetUserIds = validatedData.broadcast
      ? ['*'] // All users
      : validatedData.targetUserIds || [session.user.id];

    // Store notification for each target user
    const storedNotifications: string[] = [];

    for (const userId of targetUserIds) {
      const notification = {
        id: notificationId,
        userId,
        type: validatedData.type,
        title: validatedData.title,
        message: validatedData.message,
        data: validatedData.data,
        createdAt: now,
        read: false,
        expiresAt,
      };

      const key = `${userId}:${notificationId}`;
      notifications.set(key, notification);
      storedNotifications.push(key);

      // In production, this would:
      // 1. Publish to Redis pub/sub for SSE/WebSocket delivery
      // 2. Send push notification via FCM/APNs
      // 3. Queue email notification for offline users
    }

    return NextResponse.json({
      success: true,
      notificationId,
      targetUsers: targetUserIds.length,
      expiresAt: expiresAt?.toISOString(),
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Notification error:', error);
    return NextResponse.json(
      { error: 'Failed to send notification' },
      { status: 500 }
    );
  }
}

/**
 * GET - Fetch notifications for current user
 */
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  const { searchParams } = new URL(request.url);
  const unreadOnly = searchParams.get('unread') === 'true';
  const limit = parseInt(searchParams.get('limit') || '50', 10);

  // Get user's notifications
  const userNotifications: typeof notifications extends Map<string, infer V> ? V[] : never = [];
  const now = new Date();

  for (const [key, notification] of notifications.entries()) {
    if (notification.userId === session.user.id || notification.userId === '*') {
      // Skip expired notifications
      if (notification.expiresAt && notification.expiresAt < now) {
        notifications.delete(key);
        continue;
      }

      // Filter by read status if requested
      if (unreadOnly && notification.read) {
        continue;
      }

      userNotifications.push(notification);
    }
  }

  // Sort by createdAt descending and limit
  const sortedNotifications = userNotifications
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, limit);

  return NextResponse.json({
    notifications: sortedNotifications.map((n) => ({
      ...n,
      createdAt: n.createdAt.toISOString(),
      expiresAt: n.expiresAt?.toISOString(),
    })),
    total: userNotifications.length,
    unreadCount: userNotifications.filter((n) => !n.read).length,
  });
}

/**
 * PATCH - Mark notifications as read
 */
export async function PATCH(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const { notificationIds, markAll } = body;

    let updated = 0;

    if (markAll) {
      // Mark all user's notifications as read
      for (const [key, notification] of notifications.entries()) {
        if (notification.userId === session.user.id && !notification.read) {
          notification.read = true;
          updated++;
        }
      }
    } else if (Array.isArray(notificationIds)) {
      // Mark specific notifications as read
      for (const notifId of notificationIds) {
        const key = `${session.user.id}:${notifId}`;
        const notification = notifications.get(key);

        if (notification && !notification.read) {
          notification.read = true;
          updated++;
        }
      }
    }

    return NextResponse.json({
      success: true,
      updated,
    });
  } catch (error) {
    console.error('Mark as read error:', error);
    return NextResponse.json(
      { error: 'Failed to update notifications' },
      { status: 500 }
    );
  }
}

/**
 * DELETE - Clear notifications
 */
export async function DELETE(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  const { searchParams } = new URL(request.url);
  const notificationId = searchParams.get('id');
  const clearAll = searchParams.get('all') === 'true';
  const clearRead = searchParams.get('read') === 'true';

  let deleted = 0;

  if (clearAll) {
    // Delete all user's notifications
    for (const [key, notification] of notifications.entries()) {
      if (notification.userId === session.user.id) {
        notifications.delete(key);
        deleted++;
      }
    }
  } else if (clearRead) {
    // Delete only read notifications
    for (const [key, notification] of notifications.entries()) {
      if (notification.userId === session.user.id && notification.read) {
        notifications.delete(key);
        deleted++;
      }
    }
  } else if (notificationId) {
    // Delete specific notification
    const key = `${session.user.id}:${notificationId}`;
    if (notifications.delete(key)) {
      deleted++;
    }
  }

  return NextResponse.json({
    success: true,
    deleted,
  });
}
