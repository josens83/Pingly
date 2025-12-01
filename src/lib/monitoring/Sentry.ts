/**
 * Sentry Integration (Placeholder)
 * Real-time error tracking for production
 *
 * In production, replace with actual Sentry SDK:
 * npm install @sentry/nextjs
 */

export interface SentryConfig {
  dsn: string
  environment: string
  release: string
  tracesSampleRate: number
  profilesSampleRate?: number
}

export interface SentryUser {
  id: string
  email?: string
  username?: string
  ip_address?: string
}

export interface SentryContext {
  tags?: Record<string, string>
  extra?: Record<string, unknown>
  user?: SentryUser
  level?: 'fatal' | 'error' | 'warning' | 'info' | 'debug'
  fingerprint?: string[]
}

// Simulated Sentry client for development
class SentryClient {
  private config: SentryConfig | null = null
  private user: SentryUser | null = null
  private tags: Record<string, string> = {}
  private initialized = false

  /**
   * Initialize Sentry
   */
  init(config: SentryConfig): void {
    this.config = config
    this.initialized = true

    if (process.env.NODE_ENV === 'development') {
      console.log('[Sentry] Initialized with config:', {
        ...config,
        dsn: config.dsn.substring(0, 20) + '...',
      })
    }
  }

  /**
   * Set user context
   */
  setUser(user: SentryUser | null): void {
    this.user = user
  }

  /**
   * Set tag
   */
  setTag(key: string, value: string): void {
    this.tags[key] = value
  }

  /**
   * Set multiple tags
   */
  setTags(tags: Record<string, string>): void {
    Object.assign(this.tags, tags)
  }

  /**
   * Capture exception
   */
  captureException(error: Error, context?: SentryContext): string {
    const eventId = this.generateEventId()

    if (process.env.NODE_ENV === 'development') {
      console.error('[Sentry] Captured exception:', {
        eventId,
        error: {
          name: error.name,
          message: error.message,
          stack: error.stack?.split('\n').slice(0, 5).join('\n'),
        },
        context,
        user: this.user,
        tags: { ...this.tags, ...context?.tags },
      })
    }

    // In production, this would send to Sentry
    if (this.config && process.env.NODE_ENV === 'production') {
      this.sendToSentry('exception', {
        exception: {
          type: error.name,
          value: error.message,
          stacktrace: error.stack,
        },
        ...context,
        user: this.user,
        tags: { ...this.tags, ...context?.tags },
      })
    }

    return eventId
  }

  /**
   * Capture message
   */
  captureMessage(message: string, context?: SentryContext): string {
    const eventId = this.generateEventId()

    if (process.env.NODE_ENV === 'development') {
      console.log('[Sentry] Captured message:', {
        eventId,
        message,
        level: context?.level || 'info',
        context,
      })
    }

    if (this.config && process.env.NODE_ENV === 'production') {
      this.sendToSentry('message', {
        message,
        level: context?.level || 'info',
        ...context,
        user: this.user,
        tags: { ...this.tags, ...context?.tags },
      })
    }

    return eventId
  }

  /**
   * Start transaction for performance monitoring
   */
  startTransaction(name: string, op: string): Transaction {
    return new Transaction(name, op)
  }

  /**
   * Create breadcrumb
   */
  addBreadcrumb(breadcrumb: {
    category?: string
    message?: string
    level?: 'fatal' | 'error' | 'warning' | 'info' | 'debug'
    data?: Record<string, unknown>
  }): void {
    if (process.env.NODE_ENV === 'development') {
      console.debug('[Sentry] Breadcrumb:', breadcrumb)
    }
  }

  /**
   * Flush pending events
   */
  async flush(timeout = 2000): Promise<boolean> {
    // In production, this would flush pending events
    return new Promise((resolve) => setTimeout(() => resolve(true), timeout))
  }

  private generateEventId(): string {
    return Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15)
  }

  private async sendToSentry(type: string, data: unknown): Promise<void> {
    // Placeholder for actual Sentry API call
    // In production, use @sentry/nextjs package
  }
}

/**
 * Transaction for performance monitoring
 */
class Transaction {
  private name: string
  private op: string
  private startTime: number
  private spans: Span[] = []

  constructor(name: string, op: string) {
    this.name = name
    this.op = op
    this.startTime = performance.now()
  }

  startChild(description: string): Span {
    const span = new Span(description)
    this.spans.push(span)
    return span
  }

  finish(): void {
    const duration = performance.now() - this.startTime

    if (process.env.NODE_ENV === 'development') {
      console.debug('[Sentry] Transaction finished:', {
        name: this.name,
        op: this.op,
        duration: `${duration.toFixed(2)}ms`,
        spans: this.spans.length,
      })
    }
  }
}

/**
 * Span for detailed performance tracking
 */
class Span {
  private description: string
  private startTime: number

  constructor(description: string) {
    this.description = description
    this.startTime = performance.now()
  }

  finish(): void {
    const duration = performance.now() - this.startTime

    if (process.env.NODE_ENV === 'development') {
      console.debug('[Sentry] Span finished:', {
        description: this.description,
        duration: `${duration.toFixed(2)}ms`,
      })
    }
  }
}

// Export singleton instance
export const sentry = new SentryClient()

// Helper functions
export function initSentry(config: SentryConfig): void {
  sentry.init(config)
}

export function captureException(error: Error, context?: SentryContext): string {
  return sentry.captureException(error, context)
}

export function captureMessage(message: string, context?: SentryContext): string {
  return sentry.captureMessage(message, context)
}

export function setUser(user: SentryUser | null): void {
  sentry.setUser(user)
}

export function addBreadcrumb(breadcrumb: {
  category?: string
  message?: string
  level?: 'fatal' | 'error' | 'warning' | 'info' | 'debug'
  data?: Record<string, unknown>
}): void {
  sentry.addBreadcrumb(breadcrumb)
}
