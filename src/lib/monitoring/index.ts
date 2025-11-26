/**
 * Monitoring & Error Tracking Module
 * Elite observability for production applications
 */

// Error levels
export type ErrorLevel = 'info' | 'warning' | 'error' | 'fatal'

// Error context interface
export interface ErrorContext {
  userId?: string
  sessionId?: string
  url?: string
  userAgent?: string
  timestamp?: string
  tags?: Record<string, string>
  extra?: Record<string, unknown>
}

// Performance metric interface
export interface PerformanceMetric {
  name: string
  value: number
  unit: 'ms' | 's' | 'bytes' | 'count' | 'percent'
  tags?: Record<string, string>
}

// Log interface
interface LogEntry {
  level: ErrorLevel
  message: string
  context?: ErrorContext
  error?: Error
  timestamp: string
}

/**
 * Logger - Centralized logging utility
 */
class Logger {
  private static instance: Logger
  private logs: LogEntry[] = []
  private maxLogs = 1000

  private constructor() {}

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger()
    }
    return Logger.instance
  }

  private addLog(entry: LogEntry): void {
    this.logs.push(entry)
    if (this.logs.length > this.maxLogs) {
      this.logs.shift()
    }
  }

  info(message: string, context?: ErrorContext): void {
    const entry: LogEntry = {
      level: 'info',
      message,
      context,
      timestamp: new Date().toISOString(),
    }
    this.addLog(entry)
    if (process.env.NODE_ENV === 'development') {
      console.info(`[INFO] ${message}`, context)
    }
  }

  warn(message: string, context?: ErrorContext): void {
    const entry: LogEntry = {
      level: 'warning',
      message,
      context,
      timestamp: new Date().toISOString(),
    }
    this.addLog(entry)
    console.warn(`[WARN] ${message}`, context)
  }

  error(message: string, error?: Error, context?: ErrorContext): void {
    const entry: LogEntry = {
      level: 'error',
      message,
      error,
      context,
      timestamp: new Date().toISOString(),
    }
    this.addLog(entry)
    console.error(`[ERROR] ${message}`, error, context)

    // Send to error tracking service in production
    if (process.env.NODE_ENV === 'production') {
      this.reportError(entry)
    }
  }

  fatal(message: string, error?: Error, context?: ErrorContext): void {
    const entry: LogEntry = {
      level: 'fatal',
      message,
      error,
      context,
      timestamp: new Date().toISOString(),
    }
    this.addLog(entry)
    console.error(`[FATAL] ${message}`, error, context)

    // Always report fatal errors
    this.reportError(entry)
  }

  private async reportError(entry: LogEntry): Promise<void> {
    // Integration point for error tracking services (Sentry, LogRocket, etc.)
    // This is a placeholder for actual implementation
    try {
      // Example: Send to custom error endpoint
      if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_ERROR_ENDPOINT) {
        await fetch(process.env.NEXT_PUBLIC_ERROR_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...entry,
            error: entry.error
              ? {
                  name: entry.error.name,
                  message: entry.error.message,
                  stack: entry.error.stack,
                }
              : undefined,
          }),
        })
      }
    } catch {
      // Silently fail to prevent infinite loops
    }
  }

  getLogs(): LogEntry[] {
    return [...this.logs]
  }

  clearLogs(): void {
    this.logs = []
  }
}

export const logger = Logger.getInstance()

/**
 * Performance Monitoring
 */
class PerformanceMonitor {
  private static instance: PerformanceMonitor
  private metrics: PerformanceMetric[] = []
  private marks: Map<string, number> = new Map()

  private constructor() {}

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor()
    }
    return PerformanceMonitor.instance
  }

  // Mark the start of a performance measurement
  mark(name: string): void {
    this.marks.set(name, performance.now())
  }

  // Measure the time since a mark
  measure(name: string, markName: string, tags?: Record<string, string>): number {
    const startTime = this.marks.get(markName)
    if (!startTime) {
      logger.warn(`Performance mark "${markName}" not found`)
      return 0
    }

    const duration = performance.now() - startTime
    this.recordMetric({
      name,
      value: duration,
      unit: 'ms',
      tags,
    })

    this.marks.delete(markName)
    return duration
  }

  // Record a metric
  recordMetric(metric: PerformanceMetric): void {
    this.metrics.push(metric)

    // Send to analytics in production
    if (process.env.NODE_ENV === 'production') {
      this.reportMetric(metric)
    }
  }

  private async reportMetric(metric: PerformanceMetric): Promise<void> {
    // Integration point for analytics services
    // This is a placeholder for actual implementation
    try {
      if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT) {
        await fetch(process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...metric,
            timestamp: new Date().toISOString(),
          }),
        })
      }
    } catch {
      // Silently fail
    }
  }

  // Get Web Vitals metrics
  getWebVitals(): void {
    if (typeof window === 'undefined') return

    // First Contentful Paint
    const paintEntries = performance.getEntriesByType('paint')
    const fcp = paintEntries.find((entry) => entry.name === 'first-contentful-paint')
    if (fcp) {
      this.recordMetric({
        name: 'FCP',
        value: fcp.startTime,
        unit: 'ms',
        tags: { type: 'web-vital' },
      })
    }

    // Largest Contentful Paint
    if ('PerformanceObserver' in window) {
      const lcpObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries()
        const lastEntry = entries[entries.length - 1]
        this.recordMetric({
          name: 'LCP',
          value: lastEntry.startTime,
          unit: 'ms',
          tags: { type: 'web-vital' },
        })
      })
      lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true })
    }
  }

  getMetrics(): PerformanceMetric[] {
    return [...this.metrics]
  }

  clearMetrics(): void {
    this.metrics = []
  }
}

export const performanceMonitor = PerformanceMonitor.getInstance()

/**
 * Error Boundary helper for React components
 */
export function captureException(error: Error, context?: ErrorContext): void {
  logger.error(error.message, error, context)
}

/**
 * Wrap async functions with error handling
 */
export function withErrorHandling<T extends (...args: unknown[]) => Promise<unknown>>(
  fn: T,
  context?: Partial<ErrorContext>
): T {
  return (async (...args: Parameters<T>) => {
    try {
      return await fn(...args)
    } catch (error) {
      captureException(error as Error, context as ErrorContext)
      throw error
    }
  }) as T
}

/**
 * Initialize monitoring on app start
 */
export function initializeMonitoring(): void {
  if (typeof window === 'undefined') return

  // Capture unhandled errors
  window.onerror = (message, source, lineno, colno, error) => {
    logger.error(`Unhandled Error: ${message}`, error || undefined, {
      extra: { source, lineno, colno },
    })
    return false
  }

  // Capture unhandled promise rejections
  window.onunhandledrejection = (event) => {
    logger.error('Unhandled Promise Rejection', event.reason, {
      extra: { promise: event.promise },
    })
  }

  // Initialize Web Vitals monitoring
  performanceMonitor.getWebVitals()

  logger.info('Monitoring initialized')
}
