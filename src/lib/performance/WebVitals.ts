/**
 * Web Vitals Monitoring
 * Core Web Vitals tracking for Google-level performance
 */

export interface WebVitalMetric {
  name: 'CLS' | 'FCP' | 'FID' | 'INP' | 'LCP' | 'TTFB'
  value: number
  rating: 'good' | 'needs-improvement' | 'poor'
  delta: number
  id: string
  navigationType: string
}

// Thresholds based on Google's Core Web Vitals
const THRESHOLDS = {
  CLS: { good: 0.1, poor: 0.25 },
  FCP: { good: 1800, poor: 3000 },
  FID: { good: 100, poor: 300 },
  INP: { good: 200, poor: 500 },
  LCP: { good: 2500, poor: 4000 },
  TTFB: { good: 800, poor: 1800 },
}

/**
 * Get rating for a metric value
 */
function getRating(name: keyof typeof THRESHOLDS, value: number): 'good' | 'needs-improvement' | 'poor' {
  const threshold = THRESHOLDS[name]
  if (value <= threshold.good) return 'good'
  if (value <= threshold.poor) return 'needs-improvement'
  return 'poor'
}

/**
 * Report Web Vitals to analytics
 */
export type WebVitalsReporter = (metric: WebVitalMetric) => void

let reporter: WebVitalsReporter | null = null

export function setWebVitalsReporter(fn: WebVitalsReporter): void {
  reporter = fn
}

function sendToAnalytics(metric: WebVitalMetric): void {
  if (reporter) {
    reporter(metric)
  }

  // Log in development
  if (process.env.NODE_ENV === 'development') {
    const color =
      metric.rating === 'good'
        ? 'green'
        : metric.rating === 'needs-improvement'
          ? 'orange'
          : 'red'

    console.log(
      `%c[Web Vital] ${metric.name}: ${metric.value.toFixed(2)}`,
      `color: ${color}; font-weight: bold`
    )
  }
}

/**
 * Initialize Web Vitals monitoring
 */
export async function initWebVitals(): Promise<void> {
  if (typeof window === 'undefined') return

  try {
    // Dynamic import to avoid SSR issues
    const { onCLS, onFCP, onFID, onINP, onLCP, onTTFB } = await import('web-vitals')

    const handleMetric = (
      name: WebVitalMetric['name'],
      { value, delta, id, navigationType }: { value: number; delta: number; id: string; navigationType: string }
    ) => {
      sendToAnalytics({
        name,
        value,
        delta,
        id,
        navigationType,
        rating: getRating(name, value),
      })
    }

    onCLS((metric) => handleMetric('CLS', metric))
    onFCP((metric) => handleMetric('FCP', metric))
    onFID((metric) => handleMetric('FID', metric))
    onINP((metric) => handleMetric('INP', metric))
    onLCP((metric) => handleMetric('LCP', metric))
    onTTFB((metric) => handleMetric('TTFB', metric))
  } catch (error) {
    console.warn('Failed to initialize Web Vitals:', error)
  }
}

/**
 * Get performance summary
 */
export function getPerformanceSummary(): {
  navigationTiming: PerformanceNavigationTiming | null
  paintTiming: { fcp: number | null; lcp: number | null }
  resourceCount: number
  totalTransferSize: number
} {
  if (typeof window === 'undefined' || !window.performance) {
    return {
      navigationTiming: null,
      paintTiming: { fcp: null, lcp: null },
      resourceCount: 0,
      totalTransferSize: 0,
    }
  }

  // Navigation timing
  const [navigationEntry] = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[]

  // Paint timing
  const paintEntries = performance.getEntriesByType('paint')
  const fcpEntry = paintEntries.find((e) => e.name === 'first-contentful-paint')

  // Resource timing
  const resourceEntries = performance.getEntriesByType('resource') as PerformanceResourceTiming[]
  const totalTransferSize = resourceEntries.reduce((sum, r) => sum + (r.transferSize || 0), 0)

  return {
    navigationTiming: navigationEntry || null,
    paintTiming: {
      fcp: fcpEntry?.startTime || null,
      lcp: null, // LCP is tracked separately
    },
    resourceCount: resourceEntries.length,
    totalTransferSize,
  }
}

/**
 * Mark a performance milestone
 */
export function markPerformance(name: string): void {
  if (typeof window !== 'undefined' && window.performance) {
    performance.mark(name)
  }
}

/**
 * Measure time between two marks
 */
export function measurePerformance(name: string, startMark: string, endMark?: string): number {
  if (typeof window === 'undefined' || !window.performance) return 0

  try {
    if (endMark) {
      performance.measure(name, startMark, endMark)
    } else {
      performance.measure(name, startMark)
    }

    const measures = performance.getEntriesByName(name, 'measure')
    const measure = measures[measures.length - 1]
    return measure?.duration || 0
  } catch {
    return 0
  }
}

/**
 * Track component render time
 */
export function trackRenderTime(componentName: string): {
  start: () => void
  end: () => number
} {
  const startMark = `${componentName}-render-start`
  const endMark = `${componentName}-render-end`
  const measureName = `${componentName}-render`

  return {
    start: () => markPerformance(startMark),
    end: () => {
      markPerformance(endMark)
      return measurePerformance(measureName, startMark, endMark)
    },
  }
}
