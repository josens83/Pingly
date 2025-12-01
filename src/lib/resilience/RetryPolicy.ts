/**
 * Retry Policy with Exponential Backoff
 * Implements intelligent retry logic for transient failures
 */

export interface RetryOptions {
  /** Maximum number of retry attempts (default: 3) */
  maxRetries: number
  /** Initial delay in ms (default: 1000) */
  initialDelay: number
  /** Maximum delay in ms (default: 10000) */
  maxDelay: number
  /** Backoff multiplier (default: 2) */
  backoffMultiplier: number
  /** Add jitter to prevent thundering herd (default: true) */
  jitter: boolean
  /** Retry only on specific errors */
  retryOn?: (error: Error) => boolean
  /** Callback on each retry attempt */
  onRetry?: (attempt: number, error: Error, delay: number) => void
}

const DEFAULT_OPTIONS: RetryOptions = {
  maxRetries: 3,
  initialDelay: 1000,
  maxDelay: 10000,
  backoffMultiplier: 2,
  jitter: true,
}

/**
 * Execute a function with retry logic
 */
export async function retry<T>(
  fn: () => Promise<T>,
  options: Partial<RetryOptions> = {}
): Promise<T> {
  const opts = { ...DEFAULT_OPTIONS, ...options }
  let lastError: Error | null = null

  for (let attempt = 0; attempt <= opts.maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error as Error

      // Check if we should retry this error
      if (opts.retryOn && !opts.retryOn(lastError)) {
        throw lastError
      }

      // Don't retry if we've exhausted attempts
      if (attempt === opts.maxRetries) {
        break
      }

      // Calculate delay with exponential backoff
      let delay = Math.min(
        opts.initialDelay * Math.pow(opts.backoffMultiplier, attempt),
        opts.maxDelay
      )

      // Add jitter (±25%)
      if (opts.jitter) {
        const jitterFactor = 0.75 + Math.random() * 0.5
        delay = Math.floor(delay * jitterFactor)
      }

      // Callback before retry
      opts.onRetry?.(attempt + 1, lastError, delay)

      // Wait before retry
      await sleep(delay)
    }
  }

  throw new RetryExhaustedError(
    `All ${opts.maxRetries} retry attempts failed`,
    lastError!
  )
}

/**
 * Create a retry wrapper for a function
 */
export function withRetry<T extends (...args: unknown[]) => Promise<unknown>>(
  fn: T,
  options: Partial<RetryOptions> = {}
): T {
  return ((...args: Parameters<T>) => {
    return retry(() => fn(...args), options)
  }) as T
}

/**
 * Retry decorator for class methods
 */
export function Retry(options: Partial<RetryOptions> = {}) {
  return function (
    _target: unknown,
    _propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value

    descriptor.value = async function (...args: unknown[]) {
      return retry(() => originalMethod.apply(this, args), options)
    }

    return descriptor
  }
}

/**
 * Common retry conditions
 */
export const RetryConditions = {
  /** Retry on network errors */
  networkErrors: (error: Error): boolean => {
    return (
      error.name === 'TypeError' ||
      error.message.includes('network') ||
      error.message.includes('fetch') ||
      error.message.includes('ECONNREFUSED') ||
      error.message.includes('ETIMEDOUT')
    )
  },

  /** Retry on server errors (5xx) */
  serverErrors: (error: Error): boolean => {
    if (error instanceof HttpError) {
      return error.status >= 500 && error.status < 600
    }
    return false
  },

  /** Retry on rate limit (429) */
  rateLimitErrors: (error: Error): boolean => {
    if (error instanceof HttpError) {
      return error.status === 429
    }
    return false
  },

  /** Retry on timeout errors */
  timeoutErrors: (error: Error): boolean => {
    return (
      error.name === 'TimeoutError' ||
      error.message.includes('timeout') ||
      error.message.includes('ETIMEDOUT')
    )
  },

  /** Retry on any transient error */
  transientErrors: (error: Error): boolean => {
    return (
      RetryConditions.networkErrors(error) ||
      RetryConditions.serverErrors(error) ||
      RetryConditions.rateLimitErrors(error) ||
      RetryConditions.timeoutErrors(error)
    )
  },
}

/**
 * HTTP Error class
 */
export class HttpError extends Error {
  constructor(
    public readonly status: number,
    public readonly statusText: string,
    public readonly body?: unknown
  ) {
    super(`HTTP ${status}: ${statusText}`)
    this.name = 'HttpError'
  }

  get isClientError(): boolean {
    return this.status >= 400 && this.status < 500
  }

  get isServerError(): boolean {
    return this.status >= 500 && this.status < 600
  }

  get isRetryable(): boolean {
    return this.isServerError || this.status === 429
  }
}

/**
 * Error thrown when all retries are exhausted
 */
export class RetryExhaustedError extends Error {
  constructor(
    message: string,
    public readonly lastError: Error
  ) {
    super(message)
    this.name = 'RetryExhaustedError'
  }
}

/**
 * Sleep utility
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Exponential backoff calculator
 */
export function calculateBackoff(
  attempt: number,
  initialDelay: number = 1000,
  maxDelay: number = 10000,
  multiplier: number = 2
): number {
  return Math.min(initialDelay * Math.pow(multiplier, attempt), maxDelay)
}
