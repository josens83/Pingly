/**
 * Real-time WebSocket Hooks
 *
 * React hooks for WebSocket integration:
 * - Connection management
 * - Message subscriptions
 * - Presence awareness
 * - Room management
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  wsClient,
  type ConnectionState,
  type WebSocketMessage,
} from './WebSocketClient';

/**
 * Hook for WebSocket connection state
 */
export function useWebSocketConnection() {
  const [state, setState] = useState<ConnectionState>('disconnected');
  const [latency, setLatency] = useState(0);

  useEffect(() => {
    setState(wsClient.getState());

    const unsubscribe = wsClient.onEvent('stateChange', (event: { to: ConnectionState }) => {
      setState(event.to);
    });

    // Update latency periodically
    const latencyInterval = setInterval(() => {
      setLatency(wsClient.getLatency());
    }, 5000);

    return () => {
      unsubscribe();
      clearInterval(latencyInterval);
    };
  }, []);

  const connect = useCallback(async (url?: string) => {
    try {
      await wsClient.connect(url);
    } catch (error) {
      console.error('Failed to connect:', error);
      throw error;
    }
  }, []);

  const disconnect = useCallback(() => {
    wsClient.disconnect();
  }, []);

  return {
    state,
    latency,
    isConnected: state === 'connected',
    isConnecting: state === 'connecting',
    isReconnecting: state === 'reconnecting',
    connect,
    disconnect,
  };
}

/**
 * Hook for subscribing to WebSocket messages
 */
export function useWebSocketMessage<T = unknown>(
  messageType: string,
  handler: (message: WebSocketMessage<T>) => void
) {
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => {
    const unsubscribe = wsClient.on<T>(messageType, (message) => {
      handlerRef.current(message);
    });

    return unsubscribe;
  }, [messageType]);
}

/**
 * Hook for sending WebSocket messages
 */
export function useWebSocketSend() {
  const send = useCallback(async <T>(type: string, payload?: T, options?: { room?: string }) => {
    try {
      await wsClient.send(type, payload, options);
    } catch (error) {
      console.error('Failed to send message:', error);
      throw error;
    }
  }, []);

  return send;
}

/**
 * Hook for room management
 */
export function useWebSocketRoom(roomId: string) {
  const [isJoined, setIsJoined] = useState(false);
  const [members, setMembers] = useState<string[]>([]);

  useEffect(() => {
    // Check if already in room
    setIsJoined(wsClient.getRooms().includes(roomId));

    // Listen for room member updates
    const unsubscribe = wsClient.on<{ roomId: string; members: string[] }>(
      'room:members',
      (message) => {
        if (message.payload?.roomId === roomId) {
          setMembers(message.payload.members);
        }
      }
    );

    return unsubscribe;
  }, [roomId]);

  const join = useCallback(async () => {
    try {
      await wsClient.join(roomId);
      setIsJoined(true);
    } catch (error) {
      console.error('Failed to join room:', error);
      throw error;
    }
  }, [roomId]);

  const leave = useCallback(async () => {
    try {
      await wsClient.leave(roomId);
      setIsJoined(false);
    } catch (error) {
      console.error('Failed to leave room:', error);
      throw error;
    }
  }, [roomId]);

  const sendToRoom = useCallback(
    async <T>(type: string, payload: T) => {
      try {
        await wsClient.sendToRoom(roomId, type, payload);
      } catch (error) {
        console.error('Failed to send to room:', error);
        throw error;
      }
    },
    [roomId]
  );

  return {
    isJoined,
    members,
    join,
    leave,
    sendToRoom,
  };
}

/**
 * Hook for presence in a room
 */
export interface PresenceUser {
  userId: string;
  name?: string;
  cursor?: { x: number; y: number };
  lastSeen: Date;
}

export function usePresence(roomId: string, currentUser: { userId: string; name?: string }) {
  const [users, setUsers] = useState<Map<string, PresenceUser>>(new Map());
  const cursorRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    // Subscribe to presence updates
    const unsubscribePresence = wsClient.on<PresenceUser>('presence:update', (message) => {
      if (message.room === roomId && message.payload) {
        setUsers((prev) => {
          const next = new Map(prev);
          next.set(message.payload!.userId, message.payload!);
          return next;
        });
      }
    });

    // Subscribe to presence leave
    const unsubscribeLeave = wsClient.on<{ userId: string }>('presence:leave', (message) => {
      if (message.room === roomId && message.payload) {
        setUsers((prev) => {
          const next = new Map(prev);
          next.delete(message.payload!.userId);
          return next;
        });
      }
    });

    // Announce presence
    wsClient.send('presence:join', {
      userId: currentUser.userId,
      name: currentUser.name,
      lastSeen: new Date(),
    }, { room: roomId });

    // Presence heartbeat
    const heartbeat = setInterval(() => {
      wsClient.send('presence:update', {
        userId: currentUser.userId,
        name: currentUser.name,
        cursor: cursorRef.current,
        lastSeen: new Date(),
      }, { room: roomId });
    }, 3000);

    return () => {
      unsubscribePresence();
      unsubscribeLeave();
      clearInterval(heartbeat);

      // Announce leave
      wsClient.send('presence:leave', {
        userId: currentUser.userId,
      }, { room: roomId });
    };
  }, [roomId, currentUser.userId, currentUser.name]);

  const updateCursor = useCallback((x: number, y: number) => {
    cursorRef.current = { x, y };

    wsClient.send('presence:cursor', {
      userId: currentUser.userId,
      cursor: { x, y },
    }, { room: roomId });
  }, [roomId, currentUser.userId]);

  return {
    users: Array.from(users.values()),
    updateCursor,
  };
}

/**
 * Hook for real-time data sync
 */
export function useRealtimeSync<T>(
  channel: string,
  initialData: T,
  options?: {
    onUpdate?: (data: T) => void;
    onConflict?: (local: T, remote: T) => T;
  }
) {
  const [data, setData] = useState<T>(initialData);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);
  const dataRef = useRef<T>(initialData);

  useEffect(() => {
    dataRef.current = data;
  }, [data]);

  useEffect(() => {
    // Subscribe to updates
    const unsubscribe = wsClient.on<T>(`sync:${channel}`, (message) => {
      if (message.payload) {
        const remoteData = message.payload;

        if (options?.onConflict) {
          const resolved = options.onConflict(dataRef.current, remoteData);
          setData(resolved);
        } else {
          setData(remoteData);
        }

        setLastSyncedAt(new Date());
        options?.onUpdate?.(remoteData);
      }
    });

    // Request initial sync
    wsClient.send(`sync:request:${channel}`, {});

    return unsubscribe;
  }, [channel, options]);

  const sync = useCallback(async (newData: T) => {
    setIsSyncing(true);
    try {
      await wsClient.send(`sync:${channel}`, newData);
      setData(newData);
      setLastSyncedAt(new Date());
    } finally {
      setIsSyncing(false);
    }
  }, [channel]);

  return {
    data,
    setData,
    sync,
    isSyncing,
    lastSyncedAt,
  };
}

/**
 * Hook for real-time notifications
 */
export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message?: string;
  timestamp: Date;
  read: boolean;
}

export function useRealtimeNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const unsubscribe = wsClient.on<Notification>('notification', (message) => {
      if (message.payload) {
        const notification = {
          ...message.payload,
          timestamp: new Date(message.payload.timestamp),
        };

        setNotifications((prev) => [notification, ...prev].slice(0, 50));
        setUnreadCount((prev) => prev + 1);
      }
    });

    return unsubscribe;
  }, []);

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
    wsClient.send('notification:read', { id });
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
    wsClient.send('notification:read_all', {});
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
  }, []);

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearAll,
  };
}
