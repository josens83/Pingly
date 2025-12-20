/**
 * Performance Utilities
 * Chapter 18: Performance and UX
 *
 * Utilities for measuring and optimizing performance
 */

'use client'

import { useEffect, useRef, useCallback, useState } from 'react'

/**
 * Delayed loading indicator - only shows after specified delay
 * Prevents flashing for fast operations
 */
export function useDelayedLoading(isLoading: boolean, delay: number = 100) {
  const [showLoading, setShowLoading] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    if (isLoading) {
      timeoutRef.current = setTimeout(() => {
        setShowLoading(true)
      }, delay)
    } else {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      setShowLoading(false)
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [isLoading, delay])

  return showLoading
}

/**
 * Measure component render time
 */
export function useRenderTime(componentName: string, warn: number = 16) {
  const startTime = useRef<number>()

  useEffect(() => {
    startTime.current = performance.now()

    return () => {
      if (startTime.current) {
        const duration = performance.now() - startTime.current
        if (duration > warn) {
          console.warn(`[Performance] ${componentName} render took ${duration.toFixed(2)}ms`)
        }
      }
    }
  })
}

/**
 * Debounce hook for search inputs etc
 */
export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(timer)
    }
  }, [value, delay])

  return debouncedValue
}

/**
 * Throttle hook for scroll handlers etc
 */
export function useThrottle<T>(value: T, interval: number = 100): T {
  const [throttledValue, setThrottledValue] = useState(value)
  const lastUpdated = useRef<number>(Date.now())

  useEffect(() => {
    const now = Date.now()

    if (now >= lastUpdated.current + interval) {
      lastUpdated.current = now
      setThrottledValue(value)
    } else {
      const timer = setTimeout(() => {
        lastUpdated.current = Date.now()
        setThrottledValue(value)
      }, interval - (now - lastUpdated.current))

      return () => clearTimeout(timer)
    }
  }, [value, interval])

  return throttledValue
}

/**
 * Intersection observer for lazy loading
 */
export function useIntersectionObserver(
  options?: IntersectionObserverInit
): [React.RefCallback<Element>, boolean] {
  const [isIntersecting, setIsIntersecting] = useState(false)
  const [element, setElement] = useState<Element | null>(null)

  const ref = useCallback((node: Element | null) => {
    setElement(node)
  }, [])

  useEffect(() => {
    if (!element) return

    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting)
    }, options)

    observer.observe(element)

    return () => {
      observer.disconnect()
    }
  }, [element, options])

  return [ref, isIntersecting]
}

/**
 * Idle callback hook for non-urgent tasks
 */
export function useIdleCallback(callback: () => void, deps: unknown[] = []) {
  useEffect(() => {
    if ('requestIdleCallback' in window) {
      const id = window.requestIdleCallback(callback)
      return () => window.cancelIdleCallback(id)
    } else {
      const id = setTimeout(callback, 1)
      return () => clearTimeout(id)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
}

/**
 * Prefetch data on hover/focus
 */
export function usePrefetch<T>(
  fetcher: () => Promise<T>,
  options: { onSuccess?: (data: T) => void } = {}
) {
  const prefetchedRef = useRef(false)
  const dataRef = useRef<T | null>(null)

  const prefetch = useCallback(async () => {
    if (prefetchedRef.current) return dataRef.current

    prefetchedRef.current = true
    try {
      const data = await fetcher()
      dataRef.current = data
      options.onSuccess?.(data)
      return data
    } catch {
      prefetchedRef.current = false
      return null
    }
  }, [fetcher, options])

  const handlers = {
    onMouseEnter: prefetch,
    onFocus: prefetch,
  }

  return { prefetch, handlers, data: dataRef.current }
}

/**
 * Memory usage monitoring (development only)
 */
export function useMemoryMonitor(interval: number = 5000) {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return
    if (!('memory' in performance)) return

    const checkMemory = () => {
      const memory = (performance as unknown as { memory: { usedJSHeapSize: number; jsHeapSizeLimit: number } }).memory
      const usedMB = Math.round(memory.usedJSHeapSize / 1048576)
      const limitMB = Math.round(memory.jsHeapSizeLimit / 1048576)
      const percentage = Math.round((memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100)

      if (percentage > 80) {
        console.warn(`[Memory] High usage: ${usedMB}MB / ${limitMB}MB (${percentage}%)`)
      }
    }

    const timer = setInterval(checkMemory, interval)
    return () => clearInterval(timer)
  }, [interval])
}

/**
 * Long task observer for detecting janky interactions
 */
export function useLongTaskObserver(threshold: number = 50) {
  useEffect(() => {
    if (typeof PerformanceObserver === 'undefined') return

    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.duration > threshold) {
            console.warn(
              `[Performance] Long task detected: ${entry.duration.toFixed(2)}ms`,
              entry
            )
          }
        }
      })

      observer.observe({ entryTypes: ['longtask'] })

      return () => observer.disconnect()
    } catch {
      // longtask not supported
    }
  }, [threshold])
}
