/**
 * Lazy Loading Utilities
 * Dynamic imports and code splitting helpers
 */

import { lazy, ComponentType, LazyExoticComponent } from 'react'

/**
 * Enhanced lazy loading with preload support
 */
export function lazyWithPreload<T extends ComponentType<unknown>>(
  importFn: () => Promise<{ default: T }>
): LazyExoticComponent<T> & { preload: () => Promise<{ default: T }> } {
  const Component = lazy(importFn) as LazyExoticComponent<T> & {
    preload: () => Promise<{ default: T }>
  }

  Component.preload = importFn

  return Component
}

/**
 * Lazy load with retry on failure
 */
export function lazyWithRetry<T extends ComponentType<unknown>>(
  importFn: () => Promise<{ default: T }>,
  retries = 3,
  delay = 1000
): LazyExoticComponent<T> {
  return lazy(async () => {
    let lastError: Error | null = null

    for (let i = 0; i < retries; i++) {
      try {
        return await importFn()
      } catch (error) {
        lastError = error as Error
        if (i < retries - 1) {
          await new Promise((resolve) => setTimeout(resolve, delay * (i + 1)))
        }
      }
    }

    throw lastError
  })
}

/**
 * Preload a component
 */
export function preloadComponent(
  component: LazyExoticComponent<ComponentType<unknown>> & { preload?: () => Promise<unknown> }
): void {
  if (component.preload) {
    component.preload()
  }
}

/**
 * Preload on hover
 */
export function createPreloadHandler(
  component: LazyExoticComponent<ComponentType<unknown>> & { preload?: () => Promise<unknown> }
): () => void {
  let preloaded = false

  return () => {
    if (!preloaded && component.preload) {
      preloaded = true
      component.preload()
    }
  }
}

/**
 * Dynamic import with timeout
 */
export async function dynamicImportWithTimeout<T>(
  importFn: () => Promise<T>,
  timeout = 10000
): Promise<T> {
  return Promise.race([
    importFn(),
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Import timeout')), timeout)
    ),
  ])
}

/**
 * Prefetch resources on idle
 */
export function prefetchOnIdle(urls: string[]): void {
  if (typeof window === 'undefined') return

  const prefetch = () => {
    urls.forEach((url) => {
      const link = document.createElement('link')
      link.rel = 'prefetch'
      link.href = url
      link.as = url.endsWith('.js') ? 'script' : url.endsWith('.css') ? 'style' : 'fetch'
      document.head.appendChild(link)
    })
  }

  if ('requestIdleCallback' in window) {
    requestIdleCallback(prefetch, { timeout: 2000 })
  } else {
    setTimeout(prefetch, 100)
  }
}

/**
 * Preconnect to origins
 */
export function preconnectToOrigins(origins: string[]): void {
  if (typeof window === 'undefined') return

  origins.forEach((origin) => {
    const link = document.createElement('link')
    link.rel = 'preconnect'
    link.href = origin
    link.crossOrigin = 'anonymous'
    document.head.appendChild(link)
  })
}

/**
 * Load script dynamically
 */
export function loadScript(src: string, async = true): Promise<void> {
  return new Promise((resolve, reject) => {
    // Check if already loaded
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve()
      return
    }

    const script = document.createElement('script')
    script.src = src
    script.async = async
    script.onload = () => resolve()
    script.onerror = () => reject(new Error(`Failed to load script: ${src}`))
    document.head.appendChild(script)
  })
}

/**
 * Load stylesheet dynamically
 */
export function loadStylesheet(href: string): Promise<void> {
  return new Promise((resolve, reject) => {
    // Check if already loaded
    if (document.querySelector(`link[href="${href}"]`)) {
      resolve()
      return
    }

    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = href
    link.onload = () => resolve()
    link.onerror = () => reject(new Error(`Failed to load stylesheet: ${href}`))
    document.head.appendChild(link)
  })
}
