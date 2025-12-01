/**
 * Circuit Breaker Pattern Implementation
 * Netflix Hystrix-style circuit breaker for API resilience
 */

export type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN'

export interface CircuitBreakerOptions {
  /** Timeout for each request in ms (default: 3000) */
  timeout: number
  /** Error threshold percentage to open circuit (default: 50) */
  errorThreshold: number
  /** Minimum number of requests before evaluating threshold (default: 5) */
  volumeThreshold: number
  /** Time to wait before trying again in ms (default: 30000) */
  resetTimeout: number
  /** Window size for calculating error rate in ms (default: 10000) */
  rollingWindow: number
  /** Name for logging/metrics */
  name: string
}

interface RequestResult {
  success: boolean
  timestamp: number
  duration: number
  error?: Error
}

const DEFAULT_OPTIONS: CircuitBreakerOptions = {
  timeout: 3000,
  errorThreshold: 50,
  volumeThreshold: 5,
  resetTimeout: 30000,
  rollingWindow: 10000,
  name: 'default',
}

export class CircuitBreaker {
  private state: CircuitState = 'CLOSED'
  private results: RequestResult[] = []
  private lastFailureTime: number = 0
  private options: CircuitBreakerOptions

  constructor(options: Partial<CircuitBreakerOptions> = {}) {
    this.options = { ...DEFAULT_OPTIONS, ...options }
  }

  /**
   * Execute a function with circuit breaker protection
   */
  async fire<T>(fn: () => Promise<T>): Promise<T> {
    // Check if circuit should transition from OPEN to HALF_OPEN
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime >= this.options.resetTimeout) {
        this.state = 'HALF_OPEN'
        this.log('Circuit transitioning to HALF_OPEN')
      } else {
        throw new CircuitOpenError(
          `Circuit ${this.options.name} is OPEN. Retry after ${this.getRemainingTimeout()}ms`
        )
      }
    }

    const startTime = Date.now()

    try {
      // Execute with timeout
      const result = await this.executeWithTimeout(fn)

      // Record success
      this.recordResult({ success: true, timestamp: startTime, duration: Date.now() - startTime })

      // If HALF_OPEN and successful, close the circuit
      if (this.state === 'HALF_OPEN') {
        this.state = 'CLOSED'
        this.log('Circuit closed after successful request')
      }

      return result
    } catch (error) {
      // Record failure
      this.recordResult({
        success: false,
        timestamp: startTime,
        duration: Date.now() - startTime,
        error: error as Error,
      })

      // If HALF_OPEN, immediately open the circuit again
      if (this.state === 'HALF_OPEN') {
        this.state = 'OPEN'
        this.lastFailureTime = Date.now()
        this.log('Circuit reopened after failed request in HALF_OPEN state')
      }

      // Check if we should open the circuit
      this.evaluateCircuit()

      throw error
    }
  }

  /**
   * Execute function with timeout
   */
  private async executeWithTimeout<T>(fn: () => Promise<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new TimeoutError(`Request timed out after ${this.options.timeout}ms`))
      }, this.options.timeout)

      fn()
        .then((result) => {
          clearTimeout(timeoutId)
          resolve(result)
        })
        .catch((error) => {
          clearTimeout(timeoutId)
          reject(error)
        })
    })
  }

  /**
   * Record a request result
   */
  private recordResult(result: RequestResult): void {
    this.results.push(result)

    // Clean up old results outside rolling window
    const cutoff = Date.now() - this.options.rollingWindow
    this.results = this.results.filter((r) => r.timestamp >= cutoff)
  }

  /**
   * Evaluate if circuit should open
   */
  private evaluateCircuit(): void {
    if (this.state !== 'CLOSED') return

    // Need minimum volume before evaluating
    if (this.results.length < this.options.volumeThreshold) return

    const failures = this.results.filter((r) => !r.success).length
    const errorRate = (failures / this.results.length) * 100

    if (errorRate >= this.options.errorThreshold) {
      this.state = 'OPEN'
      this.lastFailureTime = Date.now()
      this.log(`Circuit opened. Error rate: ${errorRate.toFixed(1)}%`)
    }
  }

  /**
   * Get remaining timeout before retry
   */
  private getRemainingTimeout(): number {
    return Math.max(0, this.options.resetTimeout - (Date.now() - this.lastFailureTime))
  }

  /**
   * Get current circuit state
   */
  getState(): CircuitState {
    return this.state
  }

  /**
   * Get circuit statistics
   */
  getStats(): {
    state: CircuitState
    totalRequests: number
    successRate: number
    averageResponseTime: number
  } {
    const successes = this.results.filter((r) => r.success)
    const totalDuration = this.results.reduce((sum, r) => sum + r.duration, 0)

    return {
      state: this.state,
      totalRequests: this.results.length,
      successRate: this.results.length > 0 ? (successes.length / this.results.length) * 100 : 100,
      averageResponseTime: this.results.length > 0 ? totalDuration / this.results.length : 0,
    }
  }

  /**
   * Force reset the circuit (for testing/admin purposes)
   */
  reset(): void {
    this.state = 'CLOSED'
    this.results = []
    this.lastFailureTime = 0
    this.log('Circuit manually reset')
  }

  private log(message: string): void {
    if (process.env.NODE_ENV === 'development') {
      console.debug(`[CircuitBreaker:${this.options.name}] ${message}`)
    }
  }
}

/**
 * Error thrown when circuit is open
 */
export class CircuitOpenError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'CircuitOpenError'
  }
}

/**
 * Error thrown when request times out
 */
export class TimeoutError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'TimeoutError'
  }
}

// Singleton instances for common services
const circuitBreakers = new Map<string, CircuitBreaker>()

export function getCircuitBreaker(name: string, options?: Partial<CircuitBreakerOptions>): CircuitBreaker {
  if (!circuitBreakers.has(name)) {
    circuitBreakers.set(name, new CircuitBreaker({ ...options, name }))
  }
  return circuitBreakers.get(name)!
}
