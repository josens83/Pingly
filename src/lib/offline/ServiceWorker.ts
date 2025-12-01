/**
 * Service Worker Utilities (PWA/Spotify Style)
 *
 * Features:
 * - Service worker registration and updates
 * - Caching strategies
 * - Background sync
 * - Push notifications
 * - Offline page handling
 */

export interface ServiceWorkerConfig {
  swPath: string;
  scope: string;
  updateCheckInterval: number;
  onUpdate?: (registration: ServiceWorkerRegistration) => void;
  onSuccess?: (registration: ServiceWorkerRegistration) => void;
  onOffline?: () => void;
  onOnline?: () => void;
}

export type CacheStrategy =
  | 'cache-first'
  | 'network-first'
  | 'cache-only'
  | 'network-only'
  | 'stale-while-revalidate';

export interface CacheConfig {
  name: string;
  urls: string[];
  strategy: CacheStrategy;
  maxAge?: number; // milliseconds
  maxEntries?: number;
}

export interface BackgroundSyncConfig {
  tag: string;
  maxRetentionTime?: number; // milliseconds
}

class ServiceWorkerManager {
  private registration: ServiceWorkerRegistration | null = null;
  private updateCheckTimer: ReturnType<typeof setInterval> | null = null;
  private config: ServiceWorkerConfig | null = null;

  /**
   * Register service worker
   */
  async register(config: ServiceWorkerConfig): Promise<ServiceWorkerRegistration | null> {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      console.warn('Service workers not supported');
      return null;
    }

    this.config = config;

    try {
      const registration = await navigator.serviceWorker.register(
        config.swPath,
        { scope: config.scope }
      );

      this.registration = registration;

      // Setup update checking
      if (config.updateCheckInterval > 0) {
        this.startUpdateChecking(config.updateCheckInterval);
      }

      // Handle updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (!newWorker) return;

        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // New version available
            config.onUpdate?.(registration);
          }
        });
      });

      // Check if already active
      if (registration.active) {
        config.onSuccess?.(registration);
      }

      // Setup online/offline handlers
      window.addEventListener('online', () => config.onOnline?.());
      window.addEventListener('offline', () => config.onOffline?.());

      return registration;
    } catch (error) {
      console.error('Service worker registration failed:', error);
      return null;
    }
  }

  /**
   * Unregister service worker
   */
  async unregister(): Promise<boolean> {
    if (!this.registration) return false;

    this.stopUpdateChecking();
    return this.registration.unregister();
  }

  /**
   * Check for updates
   */
  async checkForUpdates(): Promise<void> {
    if (!this.registration) return;
    await this.registration.update();
  }

  /**
   * Start periodic update checking
   */
  private startUpdateChecking(interval: number): void {
    this.stopUpdateChecking();
    this.updateCheckTimer = setInterval(() => {
      this.checkForUpdates().catch(console.error);
    }, interval);
  }

  /**
   * Stop periodic update checking
   */
  private stopUpdateChecking(): void {
    if (this.updateCheckTimer) {
      clearInterval(this.updateCheckTimer);
      this.updateCheckTimer = null;
    }
  }

  /**
   * Skip waiting and activate new service worker
   */
  async skipWaiting(): Promise<void> {
    const waiting = this.registration?.waiting;
    if (!waiting) return;

    waiting.postMessage({ type: 'SKIP_WAITING' });

    // Reload page to activate new service worker
    window.location.reload();
  }

  /**
   * Send message to service worker
   */
  async sendMessage<T>(message: unknown): Promise<T | null> {
    if (!navigator.serviceWorker.controller) return null;

    return new Promise((resolve) => {
      const channel = new MessageChannel();

      channel.port1.onmessage = (event) => {
        resolve(event.data as T);
      };

      navigator.serviceWorker.controller.postMessage(message, [channel.port2]);
    });
  }

  /**
   * Register for background sync
   */
  async registerBackgroundSync(tag: string): Promise<boolean> {
    if (!this.registration) return false;

    try {
      // @ts-expect-error - sync API not in all TypeScript definitions
      await this.registration.sync?.register(tag);
      return true;
    } catch (error) {
      console.warn('Background sync not supported:', error);
      return false;
    }
  }

  /**
   * Register for periodic background sync
   */
  async registerPeriodicSync(tag: string, minInterval: number): Promise<boolean> {
    if (!this.registration) return false;

    try {
      // Check permission
      const status = await navigator.permissions.query({
        // @ts-expect-error - periodic-background-sync not in TypeScript
        name: 'periodic-background-sync'
      });

      if (status.state !== 'granted') {
        console.warn('Periodic background sync permission not granted');
        return false;
      }

      // @ts-expect-error - periodicSync API not in all TypeScript definitions
      await this.registration.periodicSync?.register(tag, { minInterval });
      return true;
    } catch (error) {
      console.warn('Periodic background sync not supported:', error);
      return false;
    }
  }

  /**
   * Get cached URLs
   */
  async getCachedUrls(cacheName: string): Promise<string[]> {
    if (typeof caches === 'undefined') return [];

    try {
      const cache = await caches.open(cacheName);
      const keys = await cache.keys();
      return keys.map(request => request.url);
    } catch {
      return [];
    }
  }

  /**
   * Clear specific cache
   */
  async clearCache(cacheName: string): Promise<boolean> {
    if (typeof caches === 'undefined') return false;
    return caches.delete(cacheName);
  }

  /**
   * Clear all caches
   */
  async clearAllCaches(): Promise<void> {
    if (typeof caches === 'undefined') return;

    const keys = await caches.keys();
    await Promise.all(keys.map(key => caches.delete(key)));
  }

  /**
   * Get cache storage usage
   */
  async getCacheUsage(): Promise<{ used: number; quota: number }> {
    if (typeof navigator !== 'undefined' && navigator.storage?.estimate) {
      const estimate = await navigator.storage.estimate();
      return {
        used: estimate.usage || 0,
        quota: estimate.quota || 0
      };
    }
    return { used: 0, quota: 0 };
  }

  /**
   * Check if service worker is controlling the page
   */
  isControlled(): boolean {
    return !!navigator.serviceWorker?.controller;
  }

  /**
   * Get current service worker state
   */
  getState(): 'installing' | 'installed' | 'activating' | 'activated' | 'redundant' | null {
    if (!this.registration) return null;

    if (this.registration.installing) return 'installing';
    if (this.registration.waiting) return 'installed';
    if (this.registration.active) return 'activated';

    return null;
  }
}

// Singleton instance
export const serviceWorker = new ServiceWorkerManager();

/**
 * Generate service worker code
 * This can be used to create a service worker file dynamically
 */
export function generateServiceWorkerCode(configs: CacheConfig[]): string {
  return `
// Auto-generated Service Worker
const CACHE_VERSION = '${Date.now()}';

// Cache configurations
const CACHES = ${JSON.stringify(configs, null, 2)};

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    Promise.all(
      CACHES.map(async (config) => {
        const cache = await caches.open(\`\${config.name}-\${CACHE_VERSION}\`);
        return cache.addAll(config.urls);
      })
    )
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => !key.endsWith(CACHE_VERSION))
          .map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// Fetch event - apply caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Find matching cache config
  const config = CACHES.find((c) =>
    c.urls.some((u) => url.pathname.startsWith(u) || url.href === u)
  );

  if (!config) {
    event.respondWith(fetch(request));
    return;
  }

  switch (config.strategy) {
    case 'cache-first':
      event.respondWith(cacheFirst(request, config));
      break;
    case 'network-first':
      event.respondWith(networkFirst(request, config));
      break;
    case 'stale-while-revalidate':
      event.respondWith(staleWhileRevalidate(request, config));
      break;
    case 'cache-only':
      event.respondWith(cacheOnly(request, config));
      break;
    case 'network-only':
      event.respondWith(fetch(request));
      break;
    default:
      event.respondWith(fetch(request));
  }
});

async function cacheFirst(request, config) {
  const cache = await caches.open(\`\${config.name}-\${CACHE_VERSION}\`);
  const cached = await cache.match(request);

  if (cached) {
    return cached;
  }

  const response = await fetch(request);
  if (response.ok) {
    cache.put(request, response.clone());
  }
  return response;
}

async function networkFirst(request, config) {
  const cache = await caches.open(\`\${config.name}-\${CACHE_VERSION}\`);

  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return cache.match(request);
  }
}

async function staleWhileRevalidate(request, config) {
  const cache = await caches.open(\`\${config.name}-\${CACHE_VERSION}\`);
  const cached = await cache.match(request);

  const fetchPromise = fetch(request).then((response) => {
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  });

  return cached || fetchPromise;
}

async function cacheOnly(request, config) {
  const cache = await caches.open(\`\${config.name}-\${CACHE_VERSION}\`);
  return cache.match(request);
}

// Background sync
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-pending') {
    event.waitUntil(syncPendingOperations());
  }
});

async function syncPendingOperations() {
  // Notify clients to sync
  const clients = await self.clients.matchAll();
  clients.forEach((client) => {
    client.postMessage({ type: 'SYNC_REQUIRED' });
  });
}

// Push notifications
self.addEventListener('push', (event) => {
  const data = event.data?.json() || {};

  event.waitUntil(
    self.registration.showNotification(data.title || 'Notification', {
      body: data.body,
      icon: data.icon || '/icon-192.png',
      badge: data.badge || '/badge.png',
      data: data.data,
      actions: data.actions
    })
  );
});

// Notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then((clients) => {
      if (clients.length > 0) {
        clients[0].focus();
        clients[0].postMessage({
          type: 'NOTIFICATION_CLICK',
          data: event.notification.data
        });
      } else {
        self.clients.openWindow(event.notification.data?.url || '/');
      }
    })
  );
});

// Message handling
self.addEventListener('message', (event) => {
  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
`;
}

// Default service worker configuration
export const defaultServiceWorkerConfig: ServiceWorkerConfig = {
  swPath: '/sw.js',
  scope: '/',
  updateCheckInterval: 60 * 60 * 1000, // 1 hour
  onUpdate: (registration) => {
    console.log('New version available!', registration);
  },
  onSuccess: (registration) => {
    console.log('Service worker registered:', registration);
  },
  onOffline: () => {
    console.log('App is offline');
  },
  onOnline: () => {
    console.log('App is online');
  }
};

// Default cache configurations
export const defaultCacheConfigs: CacheConfig[] = [
  {
    name: 'static-assets',
    urls: [
      '/',
      '/offline.html',
      '/manifest.json'
    ],
    strategy: 'cache-first',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  },
  {
    name: 'api-cache',
    urls: ['/api/'],
    strategy: 'network-first',
    maxAge: 5 * 60 * 1000, // 5 minutes
    maxEntries: 50
  },
  {
    name: 'images',
    urls: ['/images/', '/uploads/'],
    strategy: 'stale-while-revalidate',
    maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
  }
];
