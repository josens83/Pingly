/**
 * Analytics Module
 * Track user events and page views
 */

import { performanceMonitor } from './index'

// Event types
export type EventCategory = 'engagement' | 'conversion' | 'navigation' | 'error' | 'performance'

export interface AnalyticsEvent {
  category: EventCategory
  action: string
  label?: string
  value?: number
  metadata?: Record<string, unknown>
}

// Page view interface
export interface PageView {
  path: string
  title: string
  referrer?: string
  timestamp: string
}

/**
 * Analytics Service
 */
class AnalyticsService {
  private static instance: AnalyticsService
  private events: AnalyticsEvent[] = []
  private pageViews: PageView[] = []
  private userId: string | null = null
  private sessionId: string

  private constructor() {
    // Generate session ID
    this.sessionId = this.generateSessionId()
  }

  static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService()
    }
    return AnalyticsService.instance
  }

  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
  }

  // Set user ID for tracking
  setUserId(userId: string): void {
    this.userId = userId
  }

  // Clear user ID on logout
  clearUserId(): void {
    this.userId = null
  }

  // Track an event
  track(event: AnalyticsEvent): void {
    const enrichedEvent = {
      ...event,
      timestamp: new Date().toISOString(),
      userId: this.userId,
      sessionId: this.sessionId,
    }

    this.events.push(event)

    // Send to analytics service in production
    if (process.env.NODE_ENV === 'production') {
      this.sendEvent(enrichedEvent)
    } else {
      console.debug('[Analytics]', enrichedEvent)
    }
  }

  // Track a page view
  trackPageView(path: string, title: string): void {
    const pageView: PageView = {
      path,
      title,
      referrer: typeof document !== 'undefined' ? document.referrer : undefined,
      timestamp: new Date().toISOString(),
    }

    this.pageViews.push(pageView)

    // Track page view as event
    this.track({
      category: 'navigation',
      action: 'page_view',
      label: path,
      metadata: { title },
    })

    // Measure time on page
    performanceMonitor.mark(`page_${path}`)
  }

  // Track time on page when leaving
  trackPageLeave(path: string): void {
    const duration = performanceMonitor.measure('time_on_page', `page_${path}`, { path })

    this.track({
      category: 'engagement',
      action: 'time_on_page',
      label: path,
      value: Math.round(duration),
    })
  }

  // Conversion tracking
  trackConversion(conversionType: string, value?: number): void {
    this.track({
      category: 'conversion',
      action: conversionType,
      value,
    })
  }

  // Common user actions
  trackClick(elementName: string, metadata?: Record<string, unknown>): void {
    this.track({
      category: 'engagement',
      action: 'click',
      label: elementName,
      metadata,
    })
  }

  trackFormSubmit(formName: string, success: boolean): void {
    this.track({
      category: 'engagement',
      action: success ? 'form_submit_success' : 'form_submit_error',
      label: formName,
    })
  }

  trackSearch(query: string, resultsCount: number): void {
    this.track({
      category: 'engagement',
      action: 'search',
      label: query,
      value: resultsCount,
    })
  }

  // Send event to analytics service
  private async sendEvent(event: AnalyticsEvent & { timestamp: string; userId: string | null; sessionId: string }): Promise<void> {
    try {
      // Integration point for analytics services (Google Analytics, Mixpanel, etc.)
      if (typeof window !== 'undefined') {
        // Google Analytics 4 (if available)
        if ('gtag' in window && typeof window.gtag === 'function') {
          window.gtag('event', event.action, {
            event_category: event.category,
            event_label: event.label,
            value: event.value,
            ...event.metadata,
          })
        }

        // Custom analytics endpoint
        if (process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT) {
          await fetch(process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(event),
          })
        }
      }
    } catch {
      // Silently fail
    }
  }

  // Get analytics data
  getEvents(): AnalyticsEvent[] {
    return [...this.events]
  }

  getPageViews(): PageView[] {
    return [...this.pageViews]
  }

  getSessionId(): string {
    return this.sessionId
  }
}

export const analytics = AnalyticsService.getInstance()

// Declare gtag for TypeScript
declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void
  }
}
