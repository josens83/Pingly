/**
 * Fallback Utilities
 * Graceful degradation patterns
 */

export interface FallbackOptions<T> {
  /** Primary function to execute */
  primary: () => Promise<T>
  /** Fallback value or function */
  fallback: T | (() => T) | (() => Promise<T>)
  /** Callback when primary fails */
  onPrimaryFailure?: (error: Error) => void
  /** Callback when fallback is used */
  onFallbackUsed?: () => void
  /** Whether to cache successful primary results */
  cache?: boolean
  /** Cache TTL in ms */
  cacheTTL?: number
}

const fallbackCache = new Map<string, { value: unknown; timestamp: number; ttl: number }>()

/**
 * Execute with fallback
 */
export async function withFallback<T>(options: FallbackOptions<T>): Promise<T> {
  try {
    const result = await options.primary()

    // Cache successful result
    if (options.cache && options.cacheTTL) {
      const key = options.primary.toString()
      fallbackCache.set(key, {
        value: result,
        timestamp: Date.now(),
        ttl: options.cacheTTL,
      })
    }

    return result
  } catch (error) {
    options.onPrimaryFailure?.(error as Error)

    // Try to get cached value first
    if (options.cache) {
      const key = options.primary.toString()
      const cached = fallbackCache.get(key)
      if (cached && Date.now() - cached.timestamp < cached.ttl) {
        options.onFallbackUsed?.()
        return cached.value as T
      }
    }

    // Use fallback
    options.onFallbackUsed?.()

    if (typeof options.fallback === 'function') {
      return (options.fallback as () => T | Promise<T>)()
    }

    return options.fallback
  }
}

/**
 * Create a fallback chain (try multiple strategies in order)
 */
export function createFallbackChain<T>(strategies: Array<() => Promise<T>>): () => Promise<T> {
  return async () => {
    let lastError: Error | null = null

    for (const strategy of strategies) {
      try {
        return await strategy()
      } catch (error) {
        lastError = error as Error
        // Continue to next strategy
      }
    }

    throw lastError || new Error('All fallback strategies failed')
  }
}

/**
 * Cached fallback decorator
 */
export function CachedFallback<T>(
  fallbackValue: T,
  cacheTTL: number = 60000
) {
  return function (
    _target: unknown,
    _propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value
    let cachedValue: T | null = null
    let cacheTimestamp: number = 0

    descriptor.value = async function (...args: unknown[]) {
      try {
        const result = await originalMethod.apply(this, args)
        cachedValue = result
        cacheTimestamp = Date.now()
        return result
      } catch (error) {
        // Try cached value
        if (cachedValue !== null && Date.now() - cacheTimestamp < cacheTTL) {
          console.warn('Using cached value due to error:', error)
          return cachedValue
        }

        // Use default fallback
        console.warn('Using fallback value due to error:', error)
        return fallbackValue
      }
    }

    return descriptor
  }
}

/**
 * Feature flag fallback
 */
export async function withFeatureFlag<T>(
  featureEnabled: boolean | (() => boolean | Promise<boolean>),
  enabledFn: () => Promise<T>,
  disabledFn: () => Promise<T>
): Promise<T> {
  const isEnabled =
    typeof featureEnabled === 'function' ? await featureEnabled() : featureEnabled

  return isEnabled ? enabledFn() : disabledFn()
}

/**
 * Stale-while-revalidate pattern
 */
export function staleWhileRevalidate<T>(
  key: string,
  fetchFn: () => Promise<T>,
  options: {
    staleTime: number
    maxAge: number
  }
): { getData: () => Promise<T>; invalidate: () => void } {
  let cachedData: T | null = null
  let lastFetch: number = 0
  let fetchPromise: Promise<T> | null = null

  const getData = async (): Promise<T> => {
    const now = Date.now()
    const age = now - lastFetch

    // Return stale data and revalidate in background
    if (cachedData !== null) {
      if (age < options.staleTime) {
        // Fresh data
        return cachedData
      }

      if (age < options.maxAge) {
        // Stale data - revalidate in background
        if (!fetchPromise) {
          fetchPromise = fetchFn()
            .then((data) => {
              cachedData = data
              lastFetch = Date.now()
              return data
            })
            .finally(() => {
              fetchPromise = null
            })
        }
        return cachedData
      }
    }

    // No cache or expired - fetch fresh
    if (!fetchPromise) {
      fetchPromise = fetchFn()
        .then((data) => {
          cachedData = data
          lastFetch = Date.now()
          return data
        })
        .finally(() => {
          fetchPromise = null
        })
    }

    return fetchPromise
  }

  const invalidate = (): void => {
    cachedData = null
    lastFetch = 0
  }

  return { getData, invalidate }
}

/**
 * Default values for common data types
 */
export const DefaultFallbacks = {
  array: <T>(): T[] => [],
  object: <T extends object>(): T => ({} as T),
  string: (): string => '',
  number: (): number => 0,
  boolean: (): boolean => false,
  null: (): null => null,
}
