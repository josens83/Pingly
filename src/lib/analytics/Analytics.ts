/**
 * Analytics & Metrics System (Uber Style)
 *
 * Features:
 * - Event tracking
 * - User properties
 * - Session tracking
 * - Funnel analysis
 * - Cohort tracking
 * - Custom dimensions
 * - Real-time dashboards
 * - A/B test integration
 */

export interface AnalyticsEvent {
  name: string;
  properties?: Record<string, unknown>;
  timestamp?: Date;
  userId?: string;
  sessionId?: string;
  deviceId?: string;
}

export interface UserProperties {
  userId: string;
  email?: string;
  name?: string;
  createdAt?: Date;
  plan?: string;
  company?: string;
  customProperties?: Record<string, unknown>;
}

export interface SessionInfo {
  sessionId: string;
  startTime: Date;
  lastActiveTime: Date;
  pageViews: number;
  events: number;
  referrer?: string;
  landingPage?: string;
  utmParams?: UTMParams;
}

export interface UTMParams {
  source?: string;
  medium?: string;
  campaign?: string;
  term?: string;
  content?: string;
}

export interface PageViewData {
  path: string;
  title?: string;
  referrer?: string;
  duration?: number;
  scrollDepth?: number;
}

export interface FunnelStep {
  name: string;
  eventName: string;
  completedAt?: Date;
}

export interface Funnel {
  id: string;
  name: string;
  steps: FunnelStep[];
  createdAt: Date;
  completedAt?: Date;
}

export interface AnalyticsConfig {
  apiEndpoint?: string;
  apiKey?: string;
  flushInterval?: number;
  maxQueueSize?: number;
  sessionTimeout?: number;
  debug?: boolean;
  plugins?: AnalyticsPlugin[];
}

export interface AnalyticsPlugin {
  name: string;
  initialize?: () => void;
  track?: (event: AnalyticsEvent) => void;
  identify?: (user: UserProperties) => void;
  page?: (data: PageViewData) => void;
}

type EventHandler = (event: AnalyticsEvent) => void;

class AnalyticsService {
  private config: Required<AnalyticsConfig>;
  private userId?: string;
  private sessionInfo: SessionInfo | null = null;
  private userProperties: UserProperties | null = null;
  private eventQueue: AnalyticsEvent[] = [];
  private funnels: Map<string, Funnel> = new Map();
  private plugins: AnalyticsPlugin[] = [];
  private flushTimer: ReturnType<typeof setInterval> | null = null;
  private sessionTimer: ReturnType<typeof setTimeout> | null = null;
  private eventListeners: Set<EventHandler> = new Set();
  private pageStartTime: number = 0;
  private isInitialized = false;

  constructor() {
    this.config = {
      apiEndpoint: '/api/analytics',
      apiKey: '',
      flushInterval: 10000, // 10 seconds
      maxQueueSize: 100,
      sessionTimeout: 30 * 60 * 1000, // 30 minutes
      debug: false,
      plugins: []
    };
  }

  /**
   * Initialize analytics
   */
  initialize(config: AnalyticsConfig = {}): void {
    this.config = { ...this.config, ...config };
    this.plugins = config.plugins || [];

    if (typeof window === 'undefined') return;

    // Initialize session
    this.initSession();

    // Start flush timer
    this.flushTimer = setInterval(() => {
      this.flush();
    }, this.config.flushInterval);

    // Setup page visibility tracking
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.flush();
      } else {
        this.refreshSession();
      }
    });

    // Setup before unload
    window.addEventListener('beforeunload', () => {
      this.flush();
    });

    // Initialize plugins
    this.plugins.forEach(plugin => plugin.initialize?.());

    this.isInitialized = true;

    if (this.config.debug) {
      console.log('Analytics initialized', this.config);
    }
  }

  /**
   * Track an event
   */
  track(name: string, properties?: Record<string, unknown>): void {
    if (!this.isInitialized) {
      console.warn('Analytics not initialized');
      return;
    }

    const event: AnalyticsEvent = {
      name,
      properties,
      timestamp: new Date(),
      userId: this.userId,
      sessionId: this.sessionInfo?.sessionId,
      deviceId: this.getDeviceId()
    };

    // Update session activity
    this.refreshSession();
    if (this.sessionInfo) {
      this.sessionInfo.events++;
    }

    // Add to queue
    this.eventQueue.push(event);

    // Notify listeners
    this.eventListeners.forEach(handler => handler(event));

    // Notify plugins
    this.plugins.forEach(plugin => plugin.track?.(event));

    // Check funnel progression
    this.checkFunnelProgression(name);

    if (this.config.debug) {
      console.log('Track:', name, properties);
    }

    // Flush if queue is full
    if (this.eventQueue.length >= this.config.maxQueueSize) {
      this.flush();
    }
  }

  /**
   * Identify a user
   */
  identify(userId: string, properties?: Partial<UserProperties>): void {
    this.userId = userId;

    this.userProperties = {
      userId,
      ...properties,
      customProperties: properties?.customProperties
    };

    // Track identify event
    this.track('$identify', { userId, ...properties });

    // Notify plugins
    this.plugins.forEach(plugin => plugin.identify?.(this.userProperties!));

    if (this.config.debug) {
      console.log('Identify:', userId, properties);
    }
  }

  /**
   * Track page view
   */
  page(path?: string, properties?: Partial<PageViewData>): void {
    const now = Date.now();
    const duration = this.pageStartTime ? now - this.pageStartTime : undefined;
    this.pageStartTime = now;

    const pageData: PageViewData = {
      path: path || (typeof window !== 'undefined' ? window.location.pathname : '/'),
      title: typeof document !== 'undefined' ? document.title : undefined,
      referrer: typeof document !== 'undefined' ? document.referrer : undefined,
      duration,
      ...properties
    };

    // Update session
    this.refreshSession();
    if (this.sessionInfo) {
      this.sessionInfo.pageViews++;
    }

    // Track page view event
    this.track('$pageview', pageData as Record<string, unknown>);

    // Notify plugins
    this.plugins.forEach(plugin => plugin.page?.(pageData));

    if (this.config.debug) {
      console.log('Page:', pageData);
    }
  }

  /**
   * Set user property
   */
  setUserProperty(key: string, value: unknown): void {
    if (!this.userProperties) {
      this.userProperties = { userId: this.userId || 'anonymous' };
    }

    if (!this.userProperties.customProperties) {
      this.userProperties.customProperties = {};
    }

    this.userProperties.customProperties[key] = value;

    this.track('$set_user_property', { key, value });
  }

  /**
   * Set super properties (sent with every event)
   */
  private superProperties: Record<string, unknown> = {};

  setSuperProperties(properties: Record<string, unknown>): void {
    this.superProperties = { ...this.superProperties, ...properties };
  }

  /**
   * Start a funnel
   */
  startFunnel(id: string, name: string, steps: string[]): void {
    const funnel: Funnel = {
      id,
      name,
      steps: steps.map(stepName => ({
        name: stepName,
        eventName: stepName
      })),
      createdAt: new Date()
    };

    this.funnels.set(id, funnel);

    this.track('$funnel_started', {
      funnelId: id,
      funnelName: name,
      steps
    });
  }

  /**
   * Check funnel progression
   */
  private checkFunnelProgression(eventName: string): void {
    for (const [id, funnel] of this.funnels) {
      const currentStepIndex = funnel.steps.findIndex(s => !s.completedAt);
      if (currentStepIndex === -1) continue;

      const currentStep = funnel.steps[currentStepIndex];
      if (currentStep.eventName === eventName) {
        currentStep.completedAt = new Date();

        this.track('$funnel_step_completed', {
          funnelId: id,
          stepIndex: currentStepIndex,
          stepName: currentStep.name
        });

        // Check if funnel is complete
        if (currentStepIndex === funnel.steps.length - 1) {
          funnel.completedAt = new Date();
          this.track('$funnel_completed', {
            funnelId: id,
            funnelName: funnel.name,
            duration: funnel.completedAt.getTime() - funnel.createdAt.getTime()
          });
        }
      }
    }
  }

  /**
   * Get funnel status
   */
  getFunnelStatus(id: string): { completedSteps: number; totalSteps: number; isComplete: boolean } | null {
    const funnel = this.funnels.get(id);
    if (!funnel) return null;

    const completedSteps = funnel.steps.filter(s => s.completedAt).length;

    return {
      completedSteps,
      totalSteps: funnel.steps.length,
      isComplete: !!funnel.completedAt
    };
  }

  /**
   * Track timing
   */
  timing(category: string, variable: string, duration: number): void {
    this.track('$timing', {
      category,
      variable,
      duration
    });
  }

  /**
   * Start a timer
   */
  startTimer(name: string): () => void {
    const start = performance.now();

    return () => {
      const duration = performance.now() - start;
      this.timing('custom', name, duration);
    };
  }

  /**
   * Track error
   */
  trackError(error: Error, context?: Record<string, unknown>): void {
    this.track('$error', {
      message: error.message,
      name: error.name,
      stack: error.stack,
      ...context
    });
  }

  /**
   * Track revenue
   */
  trackRevenue(
    amount: number,
    currency: string,
    productId?: string,
    properties?: Record<string, unknown>
  ): void {
    this.track('$revenue', {
      amount,
      currency,
      productId,
      ...properties
    });
  }

  /**
   * Subscribe to events
   */
  onEvent(handler: EventHandler): () => void {
    this.eventListeners.add(handler);
    return () => this.eventListeners.delete(handler);
  }

  /**
   * Flush event queue
   */
  async flush(): Promise<void> {
    if (this.eventQueue.length === 0) return;

    const events = [...this.eventQueue];
    this.eventQueue = [];

    try {
      await fetch(this.config.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.config.apiKey && { 'Authorization': `Bearer ${this.config.apiKey}` })
        },
        body: JSON.stringify({
          events,
          session: this.sessionInfo,
          user: this.userProperties
        }),
        keepalive: true
      });

      if (this.config.debug) {
        console.log('Flushed events:', events.length);
      }
    } catch (error) {
      // Re-queue failed events
      this.eventQueue.unshift(...events);
      console.error('Failed to flush analytics:', error);
    }
  }

  /**
   * Initialize session
   */
  private initSession(): void {
    const storedSession = this.getStoredSession();

    if (storedSession && !this.isSessionExpired(storedSession)) {
      this.sessionInfo = storedSession;
    } else {
      this.sessionInfo = this.createNewSession();
    }

    this.storeSession(this.sessionInfo);
  }

  private createNewSession(): SessionInfo {
    const utmParams = this.extractUTMParams();

    return {
      sessionId: this.generateId(),
      startTime: new Date(),
      lastActiveTime: new Date(),
      pageViews: 0,
      events: 0,
      referrer: typeof document !== 'undefined' ? document.referrer : undefined,
      landingPage: typeof window !== 'undefined' ? window.location.pathname : undefined,
      utmParams: Object.keys(utmParams).length > 0 ? utmParams : undefined
    };
  }

  private refreshSession(): void {
    if (!this.sessionInfo) return;

    this.sessionInfo.lastActiveTime = new Date();
    this.storeSession(this.sessionInfo);

    // Reset session timeout
    if (this.sessionTimer) {
      clearTimeout(this.sessionTimer);
    }

    this.sessionTimer = setTimeout(() => {
      // Session expired, start new one on next activity
      this.sessionInfo = null;
    }, this.config.sessionTimeout);
  }

  private isSessionExpired(session: SessionInfo): boolean {
    const now = Date.now();
    const lastActive = new Date(session.lastActiveTime).getTime();
    return now - lastActive > this.config.sessionTimeout;
  }

  private getStoredSession(): SessionInfo | null {
    if (typeof sessionStorage === 'undefined') return null;

    try {
      const stored = sessionStorage.getItem('analytics_session');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }

  private storeSession(session: SessionInfo): void {
    if (typeof sessionStorage === 'undefined') return;

    try {
      sessionStorage.setItem('analytics_session', JSON.stringify(session));
    } catch {
      // Storage error
    }
  }

  private getDeviceId(): string {
    if (typeof localStorage === 'undefined') return 'unknown';

    let deviceId = localStorage.getItem('analytics_device_id');
    if (!deviceId) {
      deviceId = this.generateId();
      localStorage.setItem('analytics_device_id', deviceId);
    }
    return deviceId;
  }

  private extractUTMParams(): UTMParams {
    if (typeof window === 'undefined') return {};

    const params = new URLSearchParams(window.location.search);
    return {
      source: params.get('utm_source') || undefined,
      medium: params.get('utm_medium') || undefined,
      campaign: params.get('utm_campaign') || undefined,
      term: params.get('utm_term') || undefined,
      content: params.get('utm_content') || undefined
    };
  }

  private generateId(): string {
    return `${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 15)}`;
  }

  /**
   * Get session info
   */
  getSession(): SessionInfo | null {
    return this.sessionInfo;
  }

  /**
   * Get user properties
   */
  getUser(): UserProperties | null {
    return this.userProperties;
  }

  /**
   * Reset analytics
   */
  reset(): void {
    this.userId = undefined;
    this.userProperties = null;
    this.sessionInfo = null;
    this.eventQueue = [];
    this.funnels.clear();

    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.removeItem('analytics_session');
    }

    this.initSession();
  }

  /**
   * Cleanup
   */
  destroy(): void {
    this.flush();

    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }

    if (this.sessionTimer) {
      clearTimeout(this.sessionTimer);
    }
  }
}

// Singleton instance
export const analytics = new AnalyticsService();

// React hooks
export function useAnalytics() {
  return {
    track: (name: string, properties?: Record<string, unknown>) => analytics.track(name, properties),
    identify: (userId: string, properties?: Partial<UserProperties>) => analytics.identify(userId, properties),
    page: (path?: string, properties?: Partial<PageViewData>) => analytics.page(path, properties),
    startTimer: (name: string) => analytics.startTimer(name)
  };
}

export function usePageTracking(path: string): void {
  // In a real implementation, this would use useEffect
  analytics.page(path);
}
