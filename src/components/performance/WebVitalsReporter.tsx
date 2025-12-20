/**
 * Web Vitals Reporter
 * Chapter 18: Performance and UX
 *
 * Collects and reports Core Web Vitals metrics
 */

'use client'

import { useReportWebVitals } from 'next/web-vitals'
import { useCallback } from 'react'

export interface WebVitalsMetric {
  id: string
  name: 'LCP' | 'FID' | 'CLS' | 'FCP' | 'TTFB' | 'INP'
  value: number
  rating: 'good' | 'needs-improvement' | 'poor'
  delta: number
  navigationType: string
}

// Thresholds for Core Web Vitals (Good / Needs Improvement)
const THRESHOLDS = {
  LCP: [2500, 4000],   // Largest Contentful Paint
  FID: [100, 300],     // First Input Delay (legacy)
  INP: [200, 500],     // Interaction to Next Paint
  CLS: [0.1, 0.25],    // Cumulative Layout Shift
  FCP: [1800, 3000],   // First Contentful Paint
  TTFB: [800, 1800],   // Time to First Byte
} as const

function getRating(name: string, value: number): 'good' | 'needs-improvement' | 'poor' {
  const threshold = THRESHOLDS[name as keyof typeof THRESHOLDS]
  if (!threshold) return 'good'

  if (value <= threshold[0]) return 'good'
  if (value <= threshold[1]) return 'needs-improvement'
  return 'poor'
}

interface WebVitalsReporterProps {
  /** Custom handler for metrics */
  onMetric?: (metric: WebVitalsMetric) => void
  /** Enable console logging in development */
  debug?: boolean
  /** Send to analytics endpoint */
  analyticsEndpoint?: string
}

export function WebVitalsReporter({
  onMetric,
  debug = process.env.NODE_ENV === 'development',
  analyticsEndpoint,
}: WebVitalsReporterProps) {
  useReportWebVitals((metric) => {
    const vitalsMetric: WebVitalsMetric = {
      id: metric.id,
      name: metric.name as WebVitalsMetric['name'],
      value: metric.value,
      rating: getRating(metric.name, metric.value),
      delta: metric.delta,
      navigationType: metric.navigationType,
    }

    // Debug logging
    if (debug) {
      const emoji = vitalsMetric.rating === 'good' ? '✅' :
                    vitalsMetric.rating === 'needs-improvement' ? '⚠️' : '❌'
      console.log(
        `${emoji} ${vitalsMetric.name}: ${Math.round(vitalsMetric.value)}${vitalsMetric.name === 'CLS' ? '' : 'ms'} (${vitalsMetric.rating})`
      )
    }

    // Custom handler
    onMetric?.(vitalsMetric)

    // Send to analytics endpoint
    if (analyticsEndpoint) {
      const body = JSON.stringify({
        ...vitalsMetric,
        timestamp: Date.now(),
        url: window.location.pathname,
        userAgent: navigator.userAgent,
      })

      // Use sendBeacon for reliability
      if (navigator.sendBeacon) {
        navigator.sendBeacon(analyticsEndpoint, body)
      } else {
        fetch(analyticsEndpoint, {
          method: 'POST',
          body,
          keepalive: true,
        }).catch(() => {
          // Silently fail
        })
      }
    }

    // Google Analytics 4 integration
    if (typeof window !== 'undefined' && 'gtag' in window) {
      const gtag = (window as unknown as { gtag: (...args: unknown[]) => void }).gtag
      gtag('event', vitalsMetric.name, {
        value: Math.round(vitalsMetric.name === 'CLS' ? vitalsMetric.value * 1000 : vitalsMetric.value),
        event_label: vitalsMetric.id,
        non_interaction: true,
        metric_rating: vitalsMetric.rating,
      })
    }
  })

  return null
}

/**
 * Hook to get current Web Vitals status
 */
export function useWebVitalsStatus() {
  const metrics = new Map<string, WebVitalsMetric>()

  useReportWebVitals((metric) => {
    metrics.set(metric.name, {
      id: metric.id,
      name: metric.name as WebVitalsMetric['name'],
      value: metric.value,
      rating: getRating(metric.name, metric.value),
      delta: metric.delta,
      navigationType: metric.navigationType,
    })
  })

  return {
    getMetric: (name: string) => metrics.get(name),
    getAllMetrics: () => Array.from(metrics.values()),
  }
}
