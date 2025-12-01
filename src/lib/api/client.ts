/**
 * Production-Ready API Client
 * Netflix-style resilient API client with circuit breaker, retry, and caching
 */

import { CircuitBreaker, getCircuitBreaker, CircuitOpenError, TimeoutError } from '../resilience/CircuitBreaker'
import { retry, RetryConditions, HttpError, RetryExhaustedError } from '../resilience/RetryPolicy'
import { logger } from '../monitoring'

// Request configuration
export interface RequestConfig {
  /** Request timeout in ms */
  timeout?: number
  /** Number of retries */
  retries?: number
  /** Cache TTL in ms (0 = no cache) */
  cacheTTL?: number
  /** Skip circuit breaker */
  skipCircuitBreaker?: boolean
  /** Custom headers */
  headers?: Record<string, string>
  /** Request priority */
  priority?: 'high' | 'normal' | 'low'
}

// Response with metadata
export interface ApiResponse<T> {
  data: T
  status: number
  headers: Headers
  cached: boolean
  duration: number
}

// Cache entry
interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number
}

// Default configuration
const DEFAULT_CONFIG: Required<RequestConfig> = {
  timeout: 3000,
  retries: 3,
  cacheTTL: 0,
  skipCircuitBreaker: false,
  headers: {},
  priority: 'normal',
}

/**
 * Resilient API Client
 */
class ApiClient {
  private cache = new Map<string, CacheEntry<unknown>>()
  private baseUrl: string
  private defaultHeaders: Record<string, string>
  private circuitBreakers = new Map<string, CircuitBreaker>()

  constructor(baseUrl: string = '', defaultHeaders: Record<string, string> = {}) {
    this.baseUrl = baseUrl
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      ...defaultHeaders,
    }
  }

  /**
   * GET request
   */
  async get<T>(endpoint: string, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>('GET', endpoint, undefined, config)
  }

  /**
   * POST request
   */
  async post<T>(endpoint: string, body?: unknown, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>('POST', endpoint, body, config)
  }

  /**
   * PUT request
   */
  async put<T>(endpoint: string, body?: unknown, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>('PUT', endpoint, body, config)
  }

  /**
   * PATCH request
   */
  async patch<T>(endpoint: string, body?: unknown, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>('PATCH', endpoint, body, config)
  }

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>('DELETE', endpoint, undefined, config)
  }

  /**
   * Core request method with resilience patterns
   */
  private async request<T>(
    method: string,
    endpoint: string,
    body?: unknown,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    const cfg = { ...DEFAULT_CONFIG, ...config }
    const url = `${this.baseUrl}${endpoint}`
    const cacheKey = `${method}:${url}:${JSON.stringify(body)}`
    const startTime = performance.now()

    // Check cache for GET requests
    if (method === 'GET' && cfg.cacheTTL > 0) {
      const cached = this.getFromCache<T>(cacheKey)
      if (cached) {
        return {
          data: cached,
          status: 200,
          headers: new Headers(),
          cached: true,
          duration: performance.now() - startTime,
        }
      }
    }

    // Get or create circuit breaker for this endpoint
    const circuitBreaker = cfg.skipCircuitBreaker
      ? null
      : this.getCircuitBreaker(endpoint)

    // Build the request function
    const makeRequest = async (): Promise<ApiResponse<T>> => {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), cfg.timeout)

      try {
        const response = await fetch(url, {
          method,
          headers: {
            ...this.defaultHeaders,
            ...cfg.headers,
          },
          body: body ? JSON.stringify(body) : undefined,
          signal: controller.signal,
          priority: cfg.priority === 'high' ? 'high' : cfg.priority === 'low' ? 'low' : 'auto',
        } as RequestInit)

        clearTimeout(timeoutId)

        // Handle non-OK responses
        if (!response.ok) {
          const errorBody = await response.text().catch(() => '')
          throw new HttpError(response.status, response.statusText, errorBody)
        }

        // Parse response
        const data = await response.json() as T

        // Cache successful GET responses
        if (method === 'GET' && cfg.cacheTTL > 0) {
          this.setCache(cacheKey, data, cfg.cacheTTL)
        }

        return {
          data,
          status: response.status,
          headers: response.headers,
          cached: false,
          duration: performance.now() - startTime,
        }
      } catch (error) {
        clearTimeout(timeoutId)

        // Convert abort to timeout error
        if (error instanceof Error && error.name === 'AbortError') {
          throw new TimeoutError(`Request to ${endpoint} timed out after ${cfg.timeout}ms`)
        }

        throw error
      }
    }

    // Wrap with retry logic
    const requestWithRetry = () =>
      retry(makeRequest, {
        maxRetries: cfg.retries,
        retryOn: RetryConditions.transientErrors,
        onRetry: (attempt, error, delay) => {
          logger.warn(`Retrying ${method} ${endpoint}`, {
            extra: { attempt, error: error.message, delay },
          })
        },
      })

    // Wrap with circuit breaker
    try {
      if (circuitBreaker) {
        return await circuitBreaker.fire(requestWithRetry)
      }
      return await requestWithRetry()
    } catch (error) {
      // Log the error
      logger.error(`API request failed: ${method} ${endpoint}`, error as Error, {
        extra: { method, endpoint, duration: performance.now() - startTime },
      })

      // Return fallback data for GET requests if available in cache
      if (method === 'GET') {
        const staleData = this.getStaleFromCache<T>(cacheKey)
        if (staleData) {
          logger.warn(`Returning stale cache data for ${endpoint}`)
          return {
            data: staleData,
            status: 200,
            headers: new Headers(),
            cached: true,
            duration: performance.now() - startTime,
          }
        }
      }

      throw this.normalizeError(error as Error)
    }
  }

  /**
   * Get circuit breaker for endpoint
   */
  private getCircuitBreaker(endpoint: string): CircuitBreaker {
    // Group endpoints by base path
    const basePath = endpoint.split('/').slice(0, 2).join('/')
    return getCircuitBreaker(basePath)
  }

  /**
   * Get data from cache
   */
  private getFromCache<T>(key: string): T | null {
    const entry = this.cache.get(key) as CacheEntry<T> | undefined
    if (!entry) return null

    const isExpired = Date.now() - entry.timestamp > entry.ttl
    if (isExpired) {
      return null
    }

    return entry.data
  }

  /**
   * Get stale data from cache (ignoring TTL)
   */
  private getStaleFromCache<T>(key: string): T | null {
    const entry = this.cache.get(key) as CacheEntry<T> | undefined
    return entry?.data ?? null
  }

  /**
   * Set cache entry
   */
  private setCache<T>(key: string, data: T, ttl: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    })

    // Limit cache size
    if (this.cache.size > 100) {
      const oldestKey = this.cache.keys().next().value
      if (oldestKey) this.cache.delete(oldestKey)
    }
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear()
  }

  /**
   * Normalize error for consistent handling
   */
  private normalizeError(error: Error): Error {
    if (error instanceof HttpError) {
      return error
    }
    if (error instanceof CircuitOpenError) {
      return new ApiError('SERVICE_UNAVAILABLE', '서비스가 일시적으로 불안정합니다. 잠시 후 다시 시도해주세요.', error)
    }
    if (error instanceof TimeoutError) {
      return new ApiError('TIMEOUT', '요청 시간이 초과되었습니다. 네트워크 연결을 확인해주세요.', error)
    }
    if (error instanceof RetryExhaustedError) {
      return new ApiError('RETRY_EXHAUSTED', '요청을 처리할 수 없습니다. 잠시 후 다시 시도해주세요.', error)
    }
    return new ApiError('UNKNOWN', '알 수 없는 오류가 발생했습니다.', error)
  }

  /**
   * Set authorization token
   */
  setAuthToken(token: string): void {
    this.defaultHeaders['Authorization'] = `Bearer ${token}`
  }

  /**
   * Clear authorization token
   */
  clearAuthToken(): void {
    delete this.defaultHeaders['Authorization']
  }
}

/**
 * Normalized API Error
 */
export class ApiError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly cause?: Error
  ) {
    super(message)
    this.name = 'ApiError'
  }

  toJSON() {
    return {
      code: this.code,
      message: this.message,
      cause: this.cause?.message,
    }
  }
}

// Singleton API client instance
export const api = new ApiClient('/api')

// Export for custom instances
export { ApiClient }
