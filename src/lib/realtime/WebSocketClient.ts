/**
 * WebSocket Real-time Client (Slack/Discord Style)
 *
 * Features:
 * - Automatic reconnection with exponential backoff
 * - Heartbeat/ping-pong
 * - Message queuing during disconnection
 * - Event-based messaging
 * - Room/channel support
 * - Presence integration
 * - Binary message support
 */

export type ConnectionState = 'connecting' | 'connected' | 'disconnected' | 'reconnecting';

export interface WebSocketConfig {
  url: string;
  protocols?: string | string[];
  reconnect: boolean;
  reconnectInterval: number;
  maxReconnectInterval: number;
  reconnectDecay: number;
  maxReconnectAttempts: number;
  heartbeatInterval: number;
  heartbeatTimeout: number;
  messageQueueSize: number;
  binaryType?: 'blob' | 'arraybuffer';
}

export interface WebSocketMessage<T = unknown> {
  type: string;
  payload?: T;
  id?: string;
  timestamp?: number;
  room?: string;
}

export interface RoomInfo {
  id: string;
  name: string;
  members: string[];
  metadata?: Record<string, unknown>;
}

type MessageHandler<T = unknown> = (message: WebSocketMessage<T>) => void;
type EventHandler = (...args: unknown[]) => void;

class WebSocketClient {
  private ws: WebSocket | null = null;
  private config: WebSocketConfig;
  private state: ConnectionState = 'disconnected';
  private reconnectAttempts = 0;
  private reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
  private heartbeatInterval: ReturnType<typeof setInterval> | null = null;
  private heartbeatTimeout: ReturnType<typeof setTimeout> | null = null;
  private lastHeartbeat: number = 0;
  private messageQueue: WebSocketMessage[] = [];
  private messageHandlers: Map<string, Set<MessageHandler>> = new Map();
  private eventHandlers: Map<string, Set<EventHandler>> = new Map();
  private rooms: Set<string> = new Set();
  private pendingAcks: Map<string, { resolve: () => void; reject: (error: Error) => void; timeout: ReturnType<typeof setTimeout> }> = new Map();
  private messageId = 0;

  constructor(config: Partial<WebSocketConfig> = {}) {
    this.config = {
      url: '',
      reconnect: true,
      reconnectInterval: 1000,
      maxReconnectInterval: 30000,
      reconnectDecay: 1.5,
      maxReconnectAttempts: 10,
      heartbeatInterval: 30000,
      heartbeatTimeout: 10000,
      messageQueueSize: 100,
      binaryType: 'arraybuffer',
      ...config
    };
  }

  /**
   * Connect to WebSocket server
   */
  connect(url?: string): Promise<void> {
    if (url) {
      this.config.url = url;
    }

    if (!this.config.url) {
      return Promise.reject(new Error('WebSocket URL is required'));
    }

    return new Promise((resolve, reject) => {
      this.setState('connecting');

      try {
        this.ws = new WebSocket(this.config.url, this.config.protocols);
        this.ws.binaryType = this.config.binaryType || 'arraybuffer';

        this.ws.onopen = () => {
          this.setState('connected');
          this.reconnectAttempts = 0;
          this.startHeartbeat();
          this.flushMessageQueue();
          this.emit('connect');
          resolve();
        };

        this.ws.onclose = (event) => {
          this.handleClose(event);
        };

        this.ws.onerror = (error) => {
          this.emit('error', error);
          if (this.state === 'connecting') {
            reject(new Error('Failed to connect'));
          }
        };

        this.ws.onmessage = (event) => {
          this.handleMessage(event);
        };
      } catch (error) {
        this.setState('disconnected');
        reject(error);
      }
    });
  }

  /**
   * Disconnect from server
   */
  disconnect(): void {
    this.config.reconnect = false;
    this.cleanup();

    if (this.ws) {
      this.ws.close(1000, 'Client disconnect');
      this.ws = null;
    }

    this.setState('disconnected');
    this.emit('disconnect');
  }

  /**
   * Send a message
   */
  send<T>(type: string, payload?: T, options?: { room?: string; ack?: boolean }): Promise<void> {
    const message: WebSocketMessage<T> = {
      type,
      payload,
      id: this.generateMessageId(),
      timestamp: Date.now(),
      room: options?.room
    };

    if (this.state !== 'connected') {
      // Queue message for later
      if (this.messageQueue.length < this.config.messageQueueSize) {
        this.messageQueue.push(message);
      }
      return Promise.resolve();
    }

    return this.sendRaw(message, options?.ack);
  }

  /**
   * Send raw message
   */
  private sendRaw(message: WebSocketMessage, waitForAck = false): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
        reject(new Error('WebSocket is not connected'));
        return;
      }

      try {
        this.ws.send(JSON.stringify(message));

        if (waitForAck && message.id) {
          const timeout = setTimeout(() => {
            this.pendingAcks.delete(message.id!);
            reject(new Error('Message acknowledgement timeout'));
          }, 10000);

          this.pendingAcks.set(message.id, { resolve, reject, timeout });
        } else {
          resolve();
        }
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Subscribe to a message type
   */
  on<T>(type: string, handler: MessageHandler<T>): () => void {
    if (!this.messageHandlers.has(type)) {
      this.messageHandlers.set(type, new Set());
    }

    this.messageHandlers.get(type)!.add(handler as MessageHandler);

    return () => {
      this.messageHandlers.get(type)?.delete(handler as MessageHandler);
    };
  }

  /**
   * Subscribe to once
   */
  once<T>(type: string, handler: MessageHandler<T>): () => void {
    const wrappedHandler: MessageHandler<T> = (message) => {
      handler(message);
      this.messageHandlers.get(type)?.delete(wrappedHandler as MessageHandler);
    };

    return this.on(type, wrappedHandler);
  }

  /**
   * Subscribe to connection events
   */
  onEvent(event: string, handler: EventHandler): () => void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, new Set());
    }

    this.eventHandlers.get(event)!.add(handler);

    return () => {
      this.eventHandlers.get(event)?.delete(handler);
    };
  }

  /**
   * Join a room/channel
   */
  async join(roomId: string): Promise<void> {
    this.rooms.add(roomId);
    await this.send('room:join', { roomId });
    this.emit('room:join', roomId);
  }

  /**
   * Leave a room/channel
   */
  async leave(roomId: string): Promise<void> {
    this.rooms.delete(roomId);
    await this.send('room:leave', { roomId });
    this.emit('room:leave', roomId);
  }

  /**
   * Send message to a specific room
   */
  async sendToRoom<T>(roomId: string, type: string, payload: T): Promise<void> {
    await this.send(type, payload, { room: roomId });
  }

  /**
   * Get current connection state
   */
  getState(): ConnectionState {
    return this.state;
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.state === 'connected';
  }

  /**
   * Get joined rooms
   */
  getRooms(): string[] {
    return Array.from(this.rooms);
  }

  /**
   * Get latency (based on heartbeat)
   */
  getLatency(): number {
    return this.lastHeartbeat;
  }

  private handleMessage(event: MessageEvent): void {
    try {
      const data = typeof event.data === 'string'
        ? JSON.parse(event.data)
        : event.data;

      const message = data as WebSocketMessage;

      // Handle system messages
      if (message.type === 'pong') {
        this.handlePong();
        return;
      }

      if (message.type === 'ack' && message.id) {
        const pending = this.pendingAcks.get(message.id);
        if (pending) {
          clearTimeout(pending.timeout);
          pending.resolve();
          this.pendingAcks.delete(message.id);
        }
        return;
      }

      // Dispatch to handlers
      const handlers = this.messageHandlers.get(message.type);
      if (handlers) {
        handlers.forEach(handler => {
          try {
            handler(message);
          } catch (error) {
            console.error(`Error in message handler for ${message.type}:`, error);
          }
        });
      }

      // Emit generic message event
      this.emit('message', message);
    } catch (error) {
      console.error('Failed to parse WebSocket message:', error);
    }
  }

  private handleClose(event: CloseEvent): void {
    this.cleanup();
    this.setState('disconnected');
    this.emit('close', event);

    // Attempt reconnection
    if (this.config.reconnect && this.reconnectAttempts < this.config.maxReconnectAttempts) {
      this.scheduleReconnect();
    }
  }

  private scheduleReconnect(): void {
    this.setState('reconnecting');

    const delay = Math.min(
      this.config.reconnectInterval * Math.pow(this.config.reconnectDecay, this.reconnectAttempts),
      this.config.maxReconnectInterval
    );

    this.reconnectAttempts++;

    this.emit('reconnecting', {
      attempt: this.reconnectAttempts,
      delay
    });

    this.reconnectTimeout = setTimeout(() => {
      this.connect().catch(error => {
        console.error('Reconnection failed:', error);
      });
    }, delay);
  }

  private startHeartbeat(): void {
    this.stopHeartbeat();

    this.heartbeatInterval = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        const start = Date.now();

        this.sendRaw({ type: 'ping', timestamp: start }).catch(() => {
          // Ping failed
        });

        this.heartbeatTimeout = setTimeout(() => {
          // Heartbeat timeout - connection dead
          this.ws?.close();
        }, this.config.heartbeatTimeout);
      }
    }, this.config.heartbeatInterval);
  }

  private handlePong(): void {
    if (this.heartbeatTimeout) {
      clearTimeout(this.heartbeatTimeout);
      this.heartbeatTimeout = null;
    }

    // Calculate latency
    this.lastHeartbeat = Date.now() - this.lastHeartbeat;
  }

  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }

    if (this.heartbeatTimeout) {
      clearTimeout(this.heartbeatTimeout);
      this.heartbeatTimeout = null;
    }
  }

  private flushMessageQueue(): void {
    while (this.messageQueue.length > 0 && this.state === 'connected') {
      const message = this.messageQueue.shift()!;
      this.sendRaw(message).catch(error => {
        console.error('Failed to send queued message:', error);
      });
    }
  }

  private cleanup(): void {
    this.stopHeartbeat();

    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    // Reject pending acks
    for (const [id, pending] of this.pendingAcks) {
      clearTimeout(pending.timeout);
      pending.reject(new Error('Connection closed'));
      this.pendingAcks.delete(id);
    }
  }

  private setState(state: ConnectionState): void {
    const prevState = this.state;
    this.state = state;

    if (prevState !== state) {
      this.emit('stateChange', { from: prevState, to: state });
    }
  }

  private emit(event: string, ...args: unknown[]): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(...args);
        } catch (error) {
          console.error(`Error in event handler for ${event}:`, error);
        }
      });
    }
  }

  private generateMessageId(): string {
    this.messageId++;
    return `${Date.now()}-${this.messageId}`;
  }
}

// Singleton instance
export const wsClient = new WebSocketClient();

// Factory function
export function createWebSocketClient(config: Partial<WebSocketConfig>): WebSocketClient {
  return new WebSocketClient(config);
}

// React hooks
export function useWebSocket(url?: string): {
  state: ConnectionState;
  connect: () => Promise<void>;
  disconnect: () => void;
  send: <T>(type: string, payload?: T) => Promise<void>;
  on: <T>(type: string, handler: MessageHandler<T>) => () => void;
} {
  return {
    state: wsClient.getState(),
    connect: () => wsClient.connect(url),
    disconnect: () => wsClient.disconnect(),
    send: (type, payload) => wsClient.send(type, payload),
    on: (type, handler) => wsClient.on(type, handler)
  };
}

export function useWebSocketMessage<T>(type: string, handler: MessageHandler<T>): void {
  // In a real implementation, this would use useEffect
  wsClient.on(type, handler);
}
