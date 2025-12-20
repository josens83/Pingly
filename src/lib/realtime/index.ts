/**
 * Real-time Communication Module
 *
 * Enterprise-grade WebSocket communication
 * inspired by Slack and Discord.
 */

export {
  wsClient,
  createWebSocketClient,
  useWebSocket,
  useWebSocketMessage,
  type ConnectionState,
  type WebSocketConfig,
  type WebSocketMessage,
  type RoomInfo
} from './WebSocketClient';

export {
  useWebSocketConnection,
  useWebSocketSend,
  useWebSocketRoom,
  usePresence,
  useRealtimeSync,
  useRealtimeNotifications,
  type PresenceUser,
  type Notification
} from './hooks';
