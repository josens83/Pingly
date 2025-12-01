/**
 * Rate Limiter
 * Bank-level API protection
 */

export interface RateLimitConfig {
  /** Maximum requests per window */
  maxRequests: number
  /** Window size in milliseconds */
  windowMs: number
  /** Key generator for identifying clients */
  keyGenerator?: (identifier: string) => string
  /** Skip function to bypass rate limiting */
  skip?: (identifier: string) => boolean
  /** Message when rate limited */
  message?: string
  /** Headers to include in response */
  headers?: boolean
}

interface RateLimitEntry {
  count: number
  resetTime: number
}

const DEFAULT_CONFIG: RateLimitConfig = {
  maxRequests: 100,
  windowMs: 60 * 1000, // 1 minute
  message: '너무 많은 요청을 보냈습니다. 잠시 후 다시 시도해주세요.',
  headers: true,
}

export class RateLimiter {
  private store: Map<string, RateLimitEntry> = new Map()
  private config: RateLimitConfig
  private cleanupInterval: NodeJS.Timeout | null = null

  constructor(config: Partial<RateLimitConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config }

    // Start cleanup interval
    this.startCleanup()
  }

  /**
   * Check if request should be rate limited
   */
  check(identifier: string): {
    allowed: boolean
    remaining: number
    resetTime: number
    retryAfter?: number
  } {
    const key = this.config.keyGenerator
      ? this.config.keyGenerator(identifier)
      : identifier

    // Check skip function
    if (this.config.skip?.(identifier)) {
      return { allowed: true, remaining: this.config.maxRequests, resetTime: 0 }
    }

    const now = Date.now()
    let entry = this.store.get(key)

    // Create new entry or reset if window expired
    if (!entry || now >= entry.resetTime) {
      entry = {
        count: 0,
        resetTime: now + this.config.windowMs,
      }
    }

    // Increment count
    entry.count++
    this.store.set(key, entry)

    const remaining = Math.max(0, this.config.maxRequests - entry.count)
    const allowed = entry.count <= this.config.maxRequests

    return {
      allowed,
      remaining,
      resetTime: entry.resetTime,
      retryAfter: allowed ? undefined : Math.ceil((entry.resetTime - now) / 1000),
    }
  }

  /**
   * Get rate limit headers
   */
  getHeaders(result: ReturnType<RateLimiter['check']>): Record<string, string> {
    const headers: Record<string, string> = {
      'X-RateLimit-Limit': String(this.config.maxRequests),
      'X-RateLimit-Remaining': String(result.remaining),
      'X-RateLimit-Reset': String(Math.ceil(result.resetTime / 1000)),
    }

    if (result.retryAfter) {
      headers['Retry-After'] = String(result.retryAfter)
    }

    return headers
  }

  /**
   * Reset rate limit for identifier
   */
  reset(identifier: string): void {
    const key = this.config.keyGenerator
      ? this.config.keyGenerator(identifier)
      : identifier
    this.store.delete(key)
  }

  /**
   * Clear all entries
   */
  clear(): void {
    this.store.clear()
  }

  /**
   * Start cleanup interval
   */
  private startCleanup(): void {
    if (typeof window !== 'undefined') return // Skip on client

    this.cleanupInterval = setInterval(() => {
      const now = Date.now()
      this.store.forEach((entry, key) => {
        if (now >= entry.resetTime) {
          this.store.delete(key)
        }
      })
    }, this.config.windowMs)
  }

  /**
   * Stop cleanup interval
   */
  stop(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
      this.cleanupInterval = null
    }
  }
}

// ============================================
// Pre-configured Rate Limiters
// ============================================

/** General API rate limiter */
export const apiRateLimiter = new RateLimiter({
  maxRequests: 100,
  windowMs: 60 * 1000, // 1 minute
})

/** Auth endpoints rate limiter (stricter) */
export const authRateLimiter = new RateLimiter({
  maxRequests: 5,
  windowMs: 15 * 60 * 1000, // 15 minutes
  message: '로그인 시도 횟수를 초과했습니다. 15분 후 다시 시도해주세요.',
})

/** SMS sending rate limiter */
export const smsRateLimiter = new RateLimiter({
  maxRequests: 1000,
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  message: '일일 발송 한도를 초과했습니다.',
})

/** Password reset rate limiter */
export const passwordResetRateLimiter = new RateLimiter({
  maxRequests: 3,
  windowMs: 60 * 60 * 1000, // 1 hour
  message: '비밀번호 재설정 요청 한도를 초과했습니다. 1시간 후 다시 시도해주세요.',
})

// ============================================
// Rate Limit Error
// ============================================

export class RateLimitError extends Error {
  public readonly retryAfter: number

  constructor(message: string, retryAfter: number) {
    super(message)
    this.name = 'RateLimitError'
    this.retryAfter = retryAfter
  }
}
