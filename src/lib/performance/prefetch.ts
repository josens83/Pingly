/**
 * Prefetch Utilities
 * Chapter 18: Prefetching and Preloading
 *
 * Utilities for prefetching data and resources
 */

'use client'

import { useRouter } from 'next/navigation'
import { useCallback, useRef, useEffect } from 'react'
import { useQueryClient, QueryKey, QueryFunction } from '@tanstack/react-query'

/**
 * Hook for programmatic route prefetching on hover/focus
 */
export function usePrefetchRoute(href: string) {
  const router = useRouter()
  const prefetchedRef = useRef(false)

  const prefetch = useCallback(() => {
    if (prefetchedRef.current) return
    prefetchedRef.current = true
    router.prefetch(href)
  }, [href, router])

  const handlers = {
    onMouseEnter: prefetch,
    onFocus: prefetch,
  }

  return { prefetch, handlers }
}

/**
 * Hook for prefetching React Query data on hover/focus
 */
export function usePrefetchQuery<T>(
  queryKey: QueryKey,
  queryFn: QueryFunction<T>,
  options?: {
    staleTime?: number
    enabled?: boolean
  }
) {
  const queryClient = useQueryClient()
  const prefetchedRef = useRef(false)

  const prefetch = useCallback(() => {
    if (prefetchedRef.current) return
    if (options?.enabled === false) return

    prefetchedRef.current = true

    queryClient.prefetchQuery({
      queryKey,
      queryFn,
      staleTime: options?.staleTime ?? 5 * 60 * 1000, // 5 minutes
    })
  }, [queryClient, queryKey, queryFn, options])

  const handlers = {
    onMouseEnter: prefetch,
    onFocus: prefetch,
  }

  return { prefetch, handlers }
}

/**
 * Preload an image
 */
export function preloadImage(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve()
    img.onerror = reject
    img.src = src
  })
}

/**
 * Hook for preloading images on hover
 */
export function usePreloadImage(src: string) {
  const preloadedRef = useRef(false)

  const preload = useCallback(() => {
    if (preloadedRef.current) return
    preloadedRef.current = true
    preloadImage(src).catch(() => {
      // Silently fail
    })
  }, [src])

  const handlers = {
    onMouseEnter: preload,
    onFocus: preload,
  }

  return { preload, handlers }
}

/**
 * Preload multiple images
 */
export function preloadImages(srcs: string[]): Promise<void[]> {
  return Promise.all(srcs.map(preloadImage))
}

/**
 * Hook for preloading adjacent images in a gallery
 */
export function useGalleryPreload(
  images: string[],
  currentIndex: number,
  range: number = 1
) {
  useEffect(() => {
    const toPreload: string[] = []

    // Preload next images
    for (let i = 1; i <= range; i++) {
      const nextIndex = currentIndex + i
      if (nextIndex < images.length) {
        toPreload.push(images[nextIndex])
      }
    }

    // Preload previous images
    for (let i = 1; i <= range; i++) {
      const prevIndex = currentIndex - i
      if (prevIndex >= 0) {
        toPreload.push(images[prevIndex])
      }
    }

    // Preload all at once
    if (toPreload.length > 0) {
      preloadImages(toPreload).catch(() => {
        // Silently fail
      })
    }
  }, [images, currentIndex, range])
}

/**
 * Add preconnect link for external resources
 */
export function preconnect(url: string, crossOrigin?: 'anonymous' | 'use-credentials') {
  if (typeof document === 'undefined') return

  const link = document.createElement('link')
  link.rel = 'preconnect'
  link.href = url
  if (crossOrigin) {
    link.crossOrigin = crossOrigin
  }

  document.head.appendChild(link)
}

/**
 * Add DNS prefetch for external resources
 */
export function dnsPrefetch(url: string) {
  if (typeof document === 'undefined') return

  const link = document.createElement('link')
  link.rel = 'dns-prefetch'
  link.href = url

  document.head.appendChild(link)
}

/**
 * Preload a script
 */
export function preloadScript(src: string) {
  if (typeof document === 'undefined') return

  const link = document.createElement('link')
  link.rel = 'preload'
  link.as = 'script'
  link.href = src

  document.head.appendChild(link)
}

/**
 * Hook for preconnecting to API on mount
 */
export function usePreconnect(urls: string[]) {
  useEffect(() => {
    urls.forEach((url) => {
      preconnect(url, 'anonymous')
    })
  }, [urls])
}

/**
 * Intersection Observer based prefetching
 * Prefetches when element comes into view
 */
export function useViewportPrefetch<T>(
  queryKey: QueryKey,
  queryFn: QueryFunction<T>,
  options?: {
    rootMargin?: string
    threshold?: number
    staleTime?: number
  }
) {
  const queryClient = useQueryClient()
  const prefetchedRef = useRef(false)
  const elementRef = useRef<HTMLElement | null>(null)

  const setRef = useCallback((element: HTMLElement | null) => {
    elementRef.current = element
  }, [])

  useEffect(() => {
    if (!elementRef.current) return
    if (prefetchedRef.current) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !prefetchedRef.current) {
          prefetchedRef.current = true

          queryClient.prefetchQuery({
            queryKey,
            queryFn,
            staleTime: options?.staleTime ?? 5 * 60 * 1000,
          })

          observer.disconnect()
        }
      },
      {
        rootMargin: options?.rootMargin ?? '100px',
        threshold: options?.threshold ?? 0,
      }
    )

    observer.observe(elementRef.current)

    return () => {
      observer.disconnect()
    }
  }, [queryClient, queryKey, queryFn, options])

  return { ref: setRef }
}
