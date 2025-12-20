/**
 * Progressive Web App (PWA) Manager
 *
 * Features:
 * - Install prompt handling
 * - Update notifications
 * - Offline detection
 * - Push notification management
 * - App lifecycle events
 * - Display mode detection
 */

export interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export interface PWAConfig {
  onInstallPrompt?: (event: BeforeInstallPromptEvent) => void;
  onInstalled?: () => void;
  onUpdateAvailable?: () => void;
  onOffline?: () => void;
  onOnline?: () => void;
  pushVapidKey?: string;
}

export type DisplayMode = 'browser' | 'standalone' | 'minimal-ui' | 'fullscreen';
export type InstallState = 'not-installed' | 'can-install' | 'installed';

export interface PushSubscriptionData {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

type PWAEventHandler = (...args: unknown[]) => void;

class PWAManager {
  private config: PWAConfig = {};
  private installPromptEvent: BeforeInstallPromptEvent | null = null;
  private serviceWorkerRegistration: ServiceWorkerRegistration | null = null;
  private isOnline = true;
  private installState: InstallState = 'not-installed';
  private eventHandlers: Map<string, Set<PWAEventHandler>> = new Map();

  /**
   * Initialize PWA features
   */
  initialize(config: PWAConfig = {}): void {
    this.config = config;

    if (typeof window === 'undefined') return;

    this.setupInstallPrompt();
    this.setupOnlineStatus();
    this.setupDisplayModeDetection();
    this.setupAppInstalled();
    this.checkInstallState();
  }

  /**
   * Setup install prompt listener
   */
  private setupInstallPrompt(): void {
    window.addEventListener('beforeinstallprompt', (event) => {
      event.preventDefault();
      this.installPromptEvent = event as BeforeInstallPromptEvent;
      this.installState = 'can-install';

      this.emit('canInstall', event);
      this.config.onInstallPrompt?.(this.installPromptEvent);
    });
  }

  /**
   * Setup online/offline detection
   */
  private setupOnlineStatus(): void {
    this.isOnline = navigator.onLine;

    window.addEventListener('online', () => {
      this.isOnline = true;
      this.emit('online');
      this.config.onOnline?.();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.emit('offline');
      this.config.onOffline?.();
    });
  }

  /**
   * Setup display mode change detection
   */
  private setupDisplayModeDetection(): void {
    const mediaQuery = window.matchMedia('(display-mode: standalone)');

    mediaQuery.addEventListener('change', (e) => {
      const mode = e.matches ? 'standalone' : 'browser';
      this.emit('displayModeChange', mode);
    });
  }

  /**
   * Setup app installed listener
   */
  private setupAppInstalled(): void {
    window.addEventListener('appinstalled', () => {
      this.installState = 'installed';
      this.installPromptEvent = null;
      this.emit('installed');
      this.config.onInstalled?.();
    });
  }

  /**
   * Check current install state
   */
  private checkInstallState(): void {
    // Check if running as installed PWA
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as Navigator & { standalone?: boolean }).standalone === true;

    if (isStandalone) {
      this.installState = 'installed';
    }
  }

  /**
   * Show install prompt
   */
  async showInstallPrompt(): Promise<boolean> {
    if (!this.installPromptEvent) {
      console.warn('Install prompt not available');
      return false;
    }

    try {
      await this.installPromptEvent.prompt();
      const { outcome } = await this.installPromptEvent.userChoice;

      this.emit('installChoice', outcome);

      if (outcome === 'accepted') {
        this.installPromptEvent = null;
        return true;
      }

      return false;
    } catch (error) {
      console.error('Failed to show install prompt:', error);
      return false;
    }
  }

  /**
   * Check if app can be installed
   */
  canInstall(): boolean {
    return this.installPromptEvent !== null;
  }

  /**
   * Get current install state
   */
  getInstallState(): InstallState {
    return this.installState;
  }

  /**
   * Check if app is installed
   */
  isInstalled(): boolean {
    return this.installState === 'installed';
  }

  /**
   * Get current display mode
   */
  getDisplayMode(): DisplayMode {
    if (window.matchMedia('(display-mode: fullscreen)').matches) {
      return 'fullscreen';
    }
    if (window.matchMedia('(display-mode: standalone)').matches) {
      return 'standalone';
    }
    if (window.matchMedia('(display-mode: minimal-ui)').matches) {
      return 'minimal-ui';
    }
    return 'browser';
  }

  /**
   * Check if online
   */
  isAppOnline(): boolean {
    return this.isOnline;
  }

  /**
   * Set service worker registration
   */
  setServiceWorkerRegistration(registration: ServiceWorkerRegistration): void {
    this.serviceWorkerRegistration = registration;

    // Check for updates
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;
      if (!newWorker) return;

      newWorker.addEventListener('statechange', () => {
        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
          this.emit('updateAvailable');
          this.config.onUpdateAvailable?.();
        }
      });
    });
  }

  /**
   * Request notification permission
   */
  async requestNotificationPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      return 'denied';
    }

    const permission = await Notification.requestPermission();
    this.emit('notificationPermission', permission);
    return permission;
  }

  /**
   * Get notification permission status
   */
  getNotificationPermission(): NotificationPermission {
    if (!('Notification' in window)) {
      return 'denied';
    }
    return Notification.permission;
  }

  /**
   * Subscribe to push notifications
   */
  async subscribeToPush(): Promise<PushSubscriptionData | null> {
    if (!this.serviceWorkerRegistration) {
      console.error('Service worker not registered');
      return null;
    }

    if (!this.config.pushVapidKey) {
      console.error('VAPID key not configured');
      return null;
    }

    try {
      const permission = await this.requestNotificationPermission();
      if (permission !== 'granted') {
        return null;
      }

      const subscription = await this.serviceWorkerRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(this.config.pushVapidKey) as BufferSource
      });

      const json = subscription.toJSON();

      return {
        endpoint: json.endpoint ?? '',
        keys: {
          p256dh: json.keys?.p256dh ?? '',
          auth: json.keys?.auth ?? ''
        }
      };
    } catch (error) {
      console.error('Failed to subscribe to push:', error);
      return null;
    }
  }

  /**
   * Unsubscribe from push notifications
   */
  async unsubscribeFromPush(): Promise<boolean> {
    if (!this.serviceWorkerRegistration) {
      return false;
    }

    try {
      const subscription = await this.serviceWorkerRegistration.pushManager.getSubscription();
      if (subscription) {
        return subscription.unsubscribe();
      }
      return false;
    } catch (error) {
      console.error('Failed to unsubscribe from push:', error);
      return false;
    }
  }

  /**
   * Get current push subscription
   */
  async getPushSubscription(): Promise<PushSubscription | null> {
    if (!this.serviceWorkerRegistration) {
      return null;
    }

    return this.serviceWorkerRegistration.pushManager.getSubscription();
  }

  /**
   * Show a local notification
   */
  async showNotification(title: string, options?: NotificationOptions): Promise<void> {
    if (!this.serviceWorkerRegistration) {
      console.error('Service worker not registered');
      return;
    }

    const permission = await this.requestNotificationPermission();
    if (permission !== 'granted') {
      return;
    }

    await this.serviceWorkerRegistration.showNotification(title, {
      icon: '/icon-192.png',
      badge: '/badge.png',
      ...options
    });
  }

  /**
   * Check for app updates
   */
  async checkForUpdates(): Promise<void> {
    if (!this.serviceWorkerRegistration) {
      return;
    }

    await this.serviceWorkerRegistration.update();
  }

  /**
   * Skip waiting and activate new service worker
   */
  async activateUpdate(): Promise<void> {
    const waiting = this.serviceWorkerRegistration?.waiting;
    if (!waiting) return;

    waiting.postMessage({ type: 'SKIP_WAITING' });
    window.location.reload();
  }

  /**
   * Subscribe to PWA events
   */
  on(event: string, handler: PWAEventHandler): () => void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, new Set());
    }

    this.eventHandlers.get(event)!.add(handler);

    return () => {
      this.eventHandlers.get(event)?.delete(handler);
    };
  }

  private emit(event: string, ...args: unknown[]): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.forEach(handler => handler(...args));
    }
  }

  /**
   * Convert VAPID key to Uint8Array
   */
  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }

    return outputArray;
  }

  /**
   * Share content using Web Share API
   */
  async share(data: ShareData): Promise<boolean> {
    if (!navigator.share) {
      console.warn('Web Share API not supported');
      return false;
    }

    try {
      await navigator.share(data);
      return true;
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        console.error('Share failed:', error);
      }
      return false;
    }
  }

  /**
   * Check if Web Share API is supported
   */
  canShare(): boolean {
    return 'share' in navigator;
  }

  /**
   * Get battery status
   */
  async getBatteryStatus(): Promise<{ level: number; charging: boolean } | null> {
    if (!('getBattery' in navigator)) {
      return null;
    }

    try {
      const battery = await (navigator as Navigator & { getBattery: () => Promise<{ level: number; charging: boolean }> }).getBattery();
      return {
        level: battery.level * 100,
        charging: battery.charging
      };
    } catch {
      return null;
    }
  }

  /**
   * Get connection info
   */
  getConnectionInfo(): { type: string; effectiveType: string; downlink: number; rtt: number } | null {
    const connection = (navigator as Navigator & { connection?: { type: string; effectiveType: string; downlink: number; rtt: number } }).connection;
    if (!connection) {
      return null;
    }

    return {
      type: connection.type,
      effectiveType: connection.effectiveType,
      downlink: connection.downlink,
      rtt: connection.rtt
    };
  }
}

// Singleton instance
export const pwa = new PWAManager();

// React hooks
export function useInstallPrompt(): {
  canInstall: boolean;
  isInstalled: boolean;
  showPrompt: () => Promise<boolean>;
} {
  return {
    canInstall: pwa.canInstall(),
    isInstalled: pwa.isInstalled(),
    showPrompt: () => pwa.showInstallPrompt()
  };
}

export function useOnlineStatus(): boolean {
  return pwa.isAppOnline();
}

export function useDisplayMode(): DisplayMode {
  return pwa.getDisplayMode();
}
