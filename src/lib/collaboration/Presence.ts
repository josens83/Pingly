/**
 * Presence System (Figma/Notion Style)
 *
 * Real-time presence awareness for collaborative applications:
 * - Active user tracking
 * - Cursor synchronization
 * - Selection awareness
 * - Typing indicators
 * - User activity status
 */

export interface UserPresence {
  id: string;
  name: string;
  email?: string;
  avatar?: string;
  color: string;
  cursor?: CursorPosition;
  selection?: Selection;
  status: UserStatus;
  lastActive: Date;
  metadata?: Record<string, unknown>;
}

export interface CursorPosition {
  x: number;
  y: number;
  elementId?: string;
  viewport?: {
    scrollX: number;
    scrollY: number;
    zoom: number;
  };
}

export interface Selection {
  type: 'range' | 'element' | 'multiple';
  elements?: string[];
  startOffset?: number;
  endOffset?: number;
  anchorNode?: string;
  focusNode?: string;
}

export type UserStatus = 'active' | 'idle' | 'away' | 'offline';

export interface PresenceEvent {
  type: 'join' | 'leave' | 'update' | 'cursor' | 'selection' | 'typing';
  userId: string;
  data?: Partial<UserPresence>;
  timestamp: Date;
}

type PresenceListener = (event: PresenceEvent) => void;

// Color palette for user cursors (optimized for visibility)
const USER_COLORS = [
  '#E91E63', // Pink
  '#9C27B0', // Purple
  '#673AB7', // Deep Purple
  '#3F51B5', // Indigo
  '#2196F3', // Blue
  '#00BCD4', // Cyan
  '#009688', // Teal
  '#4CAF50', // Green
  '#8BC34A', // Light Green
  '#FF9800', // Orange
  '#FF5722', // Deep Orange
  '#795548', // Brown
];

class PresenceService {
  private users: Map<string, UserPresence> = new Map();
  private currentUser: UserPresence | null = null;
  private listeners: Set<PresenceListener> = new Set();
  private typingUsers: Map<string, ReturnType<typeof setTimeout>> = new Map();
  private idleTimeout: ReturnType<typeof setTimeout> | null = null;
  private awayTimeout: ReturnType<typeof setTimeout> | null = null;

  private readonly IDLE_THRESHOLD = 60000; // 1 minute
  private readonly AWAY_THRESHOLD = 300000; // 5 minutes
  private readonly TYPING_TIMEOUT = 3000; // 3 seconds

  /**
   * Initialize presence for current user
   */
  initialize(user: { id: string; name: string; email?: string; avatar?: string }): void {
    const color = this.assignColor(user.id);

    this.currentUser = {
      ...user,
      color,
      status: 'active',
      lastActive: new Date()
    };

    this.users.set(user.id, this.currentUser);

    // Set up activity tracking
    if (typeof window !== 'undefined') {
      this.setupActivityTracking();
    }

    this.emit({
      type: 'join',
      userId: user.id,
      data: this.currentUser,
      timestamp: new Date()
    });
  }

  private assignColor(userId: string): string {
    // Deterministic color assignment based on user ID
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      hash = ((hash << 5) - hash) + userId.charCodeAt(i);
      hash = hash & hash;
    }
    return USER_COLORS[Math.abs(hash) % USER_COLORS.length];
  }

  private setupActivityTracking(): void {
    const resetIdleTimer = () => {
      if (!this.currentUser) return;

      // Clear existing timeouts
      if (this.idleTimeout) clearTimeout(this.idleTimeout);
      if (this.awayTimeout) clearTimeout(this.awayTimeout);

      // Update status if was idle/away
      if (this.currentUser.status !== 'active') {
        this.updateStatus('active');
      }

      // Set idle timeout
      this.idleTimeout = setTimeout(() => {
        this.updateStatus('idle');

        // Set away timeout
        this.awayTimeout = setTimeout(() => {
          this.updateStatus('away');
        }, this.AWAY_THRESHOLD - this.IDLE_THRESHOLD);
      }, this.IDLE_THRESHOLD);

      this.currentUser.lastActive = new Date();
    };

    // Track user activity
    ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart'].forEach(event => {
      window.addEventListener(event, resetIdleTimer, { passive: true });
    });

    // Track visibility changes
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.updateStatus('away');
      } else {
        resetIdleTimer();
      }
    });

    // Initial setup
    resetIdleTimer();
  }

  /**
   * Update current user's cursor position
   */
  updateCursor(position: CursorPosition): void {
    if (!this.currentUser) return;

    this.currentUser.cursor = position;

    this.emit({
      type: 'cursor',
      userId: this.currentUser.id,
      data: { cursor: position },
      timestamp: new Date()
    });
  }

  /**
   * Update current user's selection
   */
  updateSelection(selection: Selection | null): void {
    if (!this.currentUser) return;

    this.currentUser.selection = selection || undefined;

    this.emit({
      type: 'selection',
      userId: this.currentUser.id,
      data: { selection: selection || undefined },
      timestamp: new Date()
    });
  }

  /**
   * Indicate typing activity
   */
  startTyping(): void {
    if (!this.currentUser) return;

    // Clear existing timeout
    const existingTimeout = this.typingUsers.get(this.currentUser.id);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
    }

    this.emit({
      type: 'typing',
      userId: this.currentUser.id,
      data: { metadata: { isTyping: true } },
      timestamp: new Date()
    });

    // Auto-stop after timeout
    const timeout = setTimeout(() => {
      this.stopTyping();
    }, this.TYPING_TIMEOUT);

    this.typingUsers.set(this.currentUser.id, timeout);
  }

  /**
   * Stop typing indicator
   */
  stopTyping(): void {
    if (!this.currentUser) return;

    const timeout = this.typingUsers.get(this.currentUser.id);
    if (timeout) {
      clearTimeout(timeout);
      this.typingUsers.delete(this.currentUser.id);
    }

    this.emit({
      type: 'typing',
      userId: this.currentUser.id,
      data: { metadata: { isTyping: false } },
      timestamp: new Date()
    });
  }

  /**
   * Update user status
   */
  private updateStatus(status: UserStatus): void {
    if (!this.currentUser) return;

    this.currentUser.status = status;

    this.emit({
      type: 'update',
      userId: this.currentUser.id,
      data: { status },
      timestamp: new Date()
    });
  }

  /**
   * Handle remote user joining
   */
  addUser(user: UserPresence): void {
    this.users.set(user.id, user);

    this.emit({
      type: 'join',
      userId: user.id,
      data: user,
      timestamp: new Date()
    });
  }

  /**
   * Handle remote user leaving
   */
  removeUser(userId: string): void {
    this.users.delete(userId);
    this.typingUsers.delete(userId);

    this.emit({
      type: 'leave',
      userId,
      timestamp: new Date()
    });
  }

  /**
   * Handle remote user update
   */
  updateUser(userId: string, data: Partial<UserPresence>): void {
    const user = this.users.get(userId);
    if (!user) return;

    Object.assign(user, data);

    // Handle typing timeout for remote users
    if (data.metadata?.isTyping) {
      const existingTimeout = this.typingUsers.get(userId);
      if (existingTimeout) {
        clearTimeout(existingTimeout);
      }

      const timeout = setTimeout(() => {
        this.typingUsers.delete(userId);
        user.metadata = { ...user.metadata, isTyping: false };
      }, this.TYPING_TIMEOUT * 2); // Give extra time for remote updates

      this.typingUsers.set(userId, timeout);
    }
  }

  /**
   * Get all active users
   */
  getUsers(): UserPresence[] {
    return Array.from(this.users.values());
  }

  /**
   * Get active users (excluding offline)
   */
  getActiveUsers(): UserPresence[] {
    return this.getUsers().filter(u => u.status !== 'offline');
  }

  /**
   * Get currently typing users
   */
  getTypingUsers(): UserPresence[] {
    return this.getUsers().filter(u =>
      u.metadata?.isTyping && u.id !== this.currentUser?.id
    );
  }

  /**
   * Get user by ID
   */
  getUser(userId: string): UserPresence | null {
    return this.users.get(userId) || null;
  }

  /**
   * Get current user
   */
  getCurrentUser(): UserPresence | null {
    return this.currentUser;
  }

  /**
   * Subscribe to presence events
   */
  subscribe(listener: PresenceListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private emit(event: PresenceEvent): void {
    this.listeners.forEach(listener => listener(event));
  }

  /**
   * Cleanup on disconnect
   */
  disconnect(): void {
    if (this.currentUser) {
      this.emit({
        type: 'leave',
        userId: this.currentUser.id,
        timestamp: new Date()
      });
    }

    if (this.idleTimeout) clearTimeout(this.idleTimeout);
    if (this.awayTimeout) clearTimeout(this.awayTimeout);

    for (const timeout of this.typingUsers.values()) {
      clearTimeout(timeout);
    }

    this.users.clear();
    this.typingUsers.clear();
    this.currentUser = null;
  }

  /**
   * Serialize presence state
   */
  toJSON(): { users: UserPresence[]; currentUserId: string | null } {
    return {
      users: this.getUsers(),
      currentUserId: this.currentUser?.id || null
    };
  }
}

// Singleton instance
export const presence = new PresenceService();

// React hooks
export function usePresence(): {
  users: UserPresence[];
  currentUser: UserPresence | null;
  updateCursor: (pos: CursorPosition) => void;
  updateSelection: (sel: Selection | null) => void;
  startTyping: () => void;
} {
  return {
    users: presence.getUsers(),
    currentUser: presence.getCurrentUser(),
    updateCursor: (pos) => presence.updateCursor(pos),
    updateSelection: (sel) => presence.updateSelection(sel),
    startTyping: () => presence.startTyping()
  };
}

export function useTypingIndicator(): UserPresence[] {
  return presence.getTypingUsers();
}

/**
 * Cursor Component Props Generator
 */
export function getCursorStyle(user: UserPresence): React.CSSProperties {
  if (!user.cursor) return { display: 'none' };

  return {
    position: 'fixed',
    left: user.cursor.x,
    top: user.cursor.y,
    transform: 'translate(-2px, -2px)',
    pointerEvents: 'none',
    zIndex: 9999,
    transition: 'left 0.1s ease-out, top 0.1s ease-out'
  };
}

export function getSelectionStyle(user: UserPresence): React.CSSProperties {
  return {
    backgroundColor: `${user.color}20`, // 20% opacity
    borderColor: user.color,
    borderWidth: 2,
    borderStyle: 'solid',
    borderRadius: 2
  };
}
