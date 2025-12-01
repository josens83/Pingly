/**
 * Custom Metrics System
 * Business and technical metrics tracking
 */

export type MetricType = 'counter' | 'gauge' | 'histogram' | 'summary'

export interface Metric {
  name: string
  type: MetricType
  value: number
  labels: Record<string, string>
  timestamp: number
}

export interface MetricOptions {
  labels?: Record<string, string>
  buckets?: number[] // For histograms
}

class MetricsRegistry {
  private metrics: Map<string, Metric[]> = new Map()
  private maxHistoryPerMetric = 1000
  private flushInterval: NodeJS.Timeout | null = null
  private flushCallback: ((metrics: Metric[]) => void) | null = null

  constructor() {
    // Start flush interval if in production
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
      this.startAutoFlush()
    }
  }

  /**
   * Register a counter metric (only increases)
   */
  counter(name: string, value: number = 1, options: MetricOptions = {}): void {
    this.recordMetric({
      name,
      type: 'counter',
      value,
      labels: options.labels || {},
      timestamp: Date.now(),
    })
  }

  /**
   * Register a gauge metric (can increase or decrease)
   */
  gauge(name: string, value: number, options: MetricOptions = {}): void {
    this.recordMetric({
      name,
      type: 'gauge',
      value,
      labels: options.labels || {},
      timestamp: Date.now(),
    })
  }

  /**
   * Register a histogram metric (for distributions)
   */
  histogram(name: string, value: number, options: MetricOptions = {}): void {
    this.recordMetric({
      name,
      type: 'histogram',
      value,
      labels: options.labels || {},
      timestamp: Date.now(),
    })
  }

  /**
   * Time a function execution
   */
  async time<T>(name: string, fn: () => Promise<T>, options: MetricOptions = {}): Promise<T> {
    const start = performance.now()
    try {
      const result = await fn()
      this.histogram(name, performance.now() - start, {
        ...options,
        labels: { ...options.labels, status: 'success' },
      })
      return result
    } catch (error) {
      this.histogram(name, performance.now() - start, {
        ...options,
        labels: { ...options.labels, status: 'error' },
      })
      throw error
    }
  }

  /**
   * Increment a counter
   */
  increment(name: string, options: MetricOptions = {}): void {
    this.counter(name, 1, options)
  }

  /**
   * Decrement a gauge
   */
  decrement(name: string, value: number = 1, options: MetricOptions = {}): void {
    const current = this.getCurrentGaugeValue(name) || 0
    this.gauge(name, current - value, options)
  }

  private recordMetric(metric: Metric): void {
    const history = this.metrics.get(metric.name) || []
    history.push(metric)

    // Limit history size
    if (history.length > this.maxHistoryPerMetric) {
      history.shift()
    }

    this.metrics.set(metric.name, history)

    // Log in development
    if (process.env.NODE_ENV === 'development') {
      console.debug(`[Metric] ${metric.type}:${metric.name} = ${metric.value}`, metric.labels)
    }
  }

  private getCurrentGaugeValue(name: string): number | null {
    const history = this.metrics.get(name)
    if (!history || history.length === 0) return null
    return history[history.length - 1].value
  }

  /**
   * Get all metrics
   */
  getMetrics(): Map<string, Metric[]> {
    return new Map(this.metrics)
  }

  /**
   * Get metric summary
   */
  getSummary(name: string): {
    count: number
    sum: number
    avg: number
    min: number
    max: number
    p50: number
    p95: number
    p99: number
  } | null {
    const history = this.metrics.get(name)
    if (!history || history.length === 0) return null

    const values = history.map((m) => m.value).sort((a, b) => a - b)
    const sum = values.reduce((a, b) => a + b, 0)

    return {
      count: values.length,
      sum,
      avg: sum / values.length,
      min: values[0],
      max: values[values.length - 1],
      p50: this.percentile(values, 50),
      p95: this.percentile(values, 95),
      p99: this.percentile(values, 99),
    }
  }

  private percentile(sortedValues: number[], p: number): number {
    const index = Math.ceil((p / 100) * sortedValues.length) - 1
    return sortedValues[Math.max(0, index)]
  }

  /**
   * Set flush callback for sending metrics to backend
   */
  setFlushCallback(callback: (metrics: Metric[]) => void): void {
    this.flushCallback = callback
  }

  /**
   * Manual flush
   */
  flush(): Metric[] {
    const allMetrics: Metric[] = []
    this.metrics.forEach((history) => {
      allMetrics.push(...history)
    })

    if (this.flushCallback) {
      this.flushCallback(allMetrics)
    }

    return allMetrics
  }

  /**
   * Start auto flush
   */
  private startAutoFlush(intervalMs: number = 60000): void {
    if (this.flushInterval) {
      clearInterval(this.flushInterval)
    }

    this.flushInterval = setInterval(() => {
      this.flush()
    }, intervalMs)
  }

  /**
   * Stop auto flush
   */
  stopAutoFlush(): void {
    if (this.flushInterval) {
      clearInterval(this.flushInterval)
      this.flushInterval = null
    }
  }

  /**
   * Clear all metrics
   */
  clear(): void {
    this.metrics.clear()
  }
}

// Export singleton
export const metrics = new MetricsRegistry()

// ============================================
// Business Metrics
// ============================================

export const BusinessMetrics = {
  // Message metrics
  messageSent: (type: string) => metrics.counter('business.message.sent', 1, { labels: { type } }),
  messageDelivered: (type: string) => metrics.counter('business.message.delivered', 1, { labels: { type } }),
  messageFailed: (type: string, reason: string) =>
    metrics.counter('business.message.failed', 1, { labels: { type, reason } }),

  // User metrics
  userSignup: () => metrics.counter('business.user.signup'),
  userLogin: () => metrics.counter('business.user.login'),
  userLogout: () => metrics.counter('business.user.logout'),

  // Revenue metrics
  creditsPurchased: (amount: number, plan: string) =>
    metrics.counter('business.credits.purchased', amount, { labels: { plan } }),
  creditsUsed: (amount: number, type: string) =>
    metrics.counter('business.credits.used', amount, { labels: { type } }),

  // Engagement metrics
  pageView: (page: string) => metrics.counter('business.page.view', 1, { labels: { page } }),
  featureUsed: (feature: string) => metrics.counter('business.feature.used', 1, { labels: { feature } }),
}

// ============================================
// Technical Metrics
// ============================================

export const TechnicalMetrics = {
  // API metrics
  apiRequest: (endpoint: string, method: string, status: number, duration: number) =>
    metrics.histogram('tech.api.request', duration, {
      labels: { endpoint, method, status: String(status) },
    }),
  apiError: (endpoint: string, errorType: string) =>
    metrics.counter('tech.api.error', 1, { labels: { endpoint, errorType } }),

  // Performance metrics
  renderTime: (component: string, duration: number) =>
    metrics.histogram('tech.render.time', duration, { labels: { component } }),
  loadTime: (resource: string, duration: number) =>
    metrics.histogram('tech.load.time', duration, { labels: { resource } }),

  // Cache metrics
  cacheHit: (cache: string) => metrics.counter('tech.cache.hit', 1, { labels: { cache } }),
  cacheMiss: (cache: string) => metrics.counter('tech.cache.miss', 1, { labels: { cache } }),

  // Error metrics
  jsError: (type: string) => metrics.counter('tech.error.js', 1, { labels: { type } }),
  networkError: (endpoint: string) =>
    metrics.counter('tech.error.network', 1, { labels: { endpoint } }),
}
