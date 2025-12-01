'use client'

/**
 * Performance Hooks
 * React hooks for performance optimization
 */

import { useState, useEffect, useRef, useCallback, useMemo, useDeferredValue as useReactDeferredValue } from 'react'
import { markPerformance, measurePerformance } from './WebVitals'

/**
 * Hook to monitor component performance
 */
export function usePerformanceMonitor(componentName: string) {
  const renderCount = useRef(0)
  const mountTime = useRef<number>(0)

  useEffect(() => {
    // Track mount time
    mountTime.current = performance.now()
    markPerformance(`${componentName}-mount`)

    return () => {
      // Track unmount
      markPerformance(`${componentName}-unmount`)
      const lifetime = measurePerformance(
        `${componentName}-lifetime`,
        `${componentName}-mount`,
        `${componentName}-unmount`
      )

      if (process.env.NODE_ENV === 'development') {
        console.debug(`[Performance] ${componentName}:`, {
          lifetime: `${lifetime.toFixed(2)}ms`,
          renderCount: renderCount.current,
        })
      }
    }
  }, [componentName])

  useEffect(() => {
    renderCount.current++
  })

  return {
    renderCount: renderCount.current,
    getLifetime: () => performance.now() - mountTime.current,
  }
}

/**
 * Throttled value hook
 */
export function useThrottledValue<T>(value: T, delay: number): T {
  const [throttledValue, setThrottledValue] = useState(value)
  const lastExecuted = useRef(Date.now())

  useEffect(() => {
    const handler = setTimeout(() => {
      const now = Date.now()
      if (now - lastExecuted.current >= delay) {
        setThrottledValue(value)
        lastExecuted.current = now
      }
    }, delay - (Date.now() - lastExecuted.current))

    return () => clearTimeout(handler)
  }, [value, delay])

  return throttledValue
}

/**
 * Debounced value hook
 */
export function useDebouncedValue<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => clearTimeout(handler)
  }, [value, delay])

  return debouncedValue
}

/**
 * Enhanced deferred value with loading state
 */
export function useDeferredValue<T>(value: T): { value: T; isPending: boolean } {
  const deferredValue = useReactDeferredValue(value)
  const isPending = value !== deferredValue

  return { value: deferredValue, isPending }
}

/**
 * Intersection observer hook for lazy loading
 */
export function useIntersectionObserver(
  options: IntersectionObserverInit = {}
): {
  ref: (element: Element | null) => void
  isIntersecting: boolean
  entry: IntersectionObserverEntry | null
} {
  const [entry, setEntry] = useState<IntersectionObserverEntry | null>(null)
  const [element, setElement] = useState<Element | null>(null)

  const observer = useMemo(() => {
    if (typeof window === 'undefined') return null

    return new IntersectionObserver(([entry]) => {
      setEntry(entry)
    }, options)
  }, [options.threshold, options.root, options.rootMargin])

  useEffect(() => {
    if (!observer || !element) return

    observer.observe(element)
    return () => observer.disconnect()
  }, [observer, element])

  const ref = useCallback((el: Element | null) => {
    setElement(el)
  }, [])

  return {
    ref,
    isIntersecting: entry?.isIntersecting ?? false,
    entry,
  }
}

/**
 * Idle callback hook
 */
export function useIdleCallback(callback: () => void, deps: unknown[] = []): void {
  useEffect(() => {
    if (typeof window === 'undefined') return

    let id: number

    if ('requestIdleCallback' in window) {
      id = requestIdleCallback(callback, { timeout: 2000 })
    } else {
      id = window.setTimeout(callback, 100)
    }

    return () => {
      if ('cancelIdleCallback' in window) {
        cancelIdleCallback(id)
      } else {
        clearTimeout(id)
      }
    }
  }, deps)
}

/**
 * Memory pressure hook
 */
export function useMemoryPressure(): 'normal' | 'moderate' | 'critical' {
  const [pressure, setPressure] = useState<'normal' | 'moderate' | 'critical'>('normal')

  useEffect(() => {
    if (typeof window === 'undefined' || !('performance' in window)) return

    const checkMemory = () => {
      // @ts-expect-error - memory is not in types
      const memory = performance.memory
      if (!memory) return

      const usedRatio = memory.usedJSHeapSize / memory.jsHeapSizeLimit
      if (usedRatio > 0.9) {
        setPressure('critical')
      } else if (usedRatio > 0.7) {
        setPressure('moderate')
      } else {
        setPressure('normal')
      }
    }

    checkMemory()
    const interval = setInterval(checkMemory, 10000)

    return () => clearInterval(interval)
  }, [])

  return pressure
}

/**
 * Network status hook
 */
export function useNetworkStatus(): {
  isOnline: boolean
  effectiveType: string
  downlink: number
  rtt: number
} {
  const [status, setStatus] = useState({
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    effectiveType: '4g',
    downlink: 10,
    rtt: 50,
  })

  useEffect(() => {
    if (typeof window === 'undefined') return

    const updateStatus = () => {
      // @ts-expect-error - connection is not in types
      const connection = navigator.connection
      setStatus({
        isOnline: navigator.onLine,
        effectiveType: connection?.effectiveType || '4g',
        downlink: connection?.downlink || 10,
        rtt: connection?.rtt || 50,
      })
    }

    updateStatus()

    window.addEventListener('online', updateStatus)
    window.addEventListener('offline', updateStatus)

    // @ts-expect-error - connection is not in types
    navigator.connection?.addEventListener('change', updateStatus)

    return () => {
      window.removeEventListener('online', updateStatus)
      window.removeEventListener('offline', updateStatus)
      // @ts-expect-error - connection is not in types
      navigator.connection?.removeEventListener('change', updateStatus)
    }
  }, [])

  return status
}

/**
 * Measure render time hook
 */
export function useRenderTime(name: string): void {
  useEffect(() => {
    markPerformance(`${name}-render-start`)
    return () => {
      markPerformance(`${name}-render-end`)
      const duration = measurePerformance(
        `${name}-render`,
        `${name}-render-start`,
        `${name}-render-end`
      )
      if (process.env.NODE_ENV === 'development' && duration > 16) {
        console.warn(`[Slow Render] ${name}: ${duration.toFixed(2)}ms`)
      }
    }
  })
}
