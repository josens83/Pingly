/**
 * Resilience Module Index
 * Netflix-style resilience patterns for production applications
 */

// Circuit Breaker
export {
  CircuitBreaker,
  CircuitOpenError,
  TimeoutError,
  getCircuitBreaker,
  type CircuitState,
  type CircuitBreakerOptions,
} from './CircuitBreaker'

// Retry Policy
export {
  retry,
  withRetry,
  Retry,
  RetryConditions,
  HttpError,
  RetryExhaustedError,
  calculateBackoff,
  type RetryOptions,
} from './RetryPolicy'

// Error Codes
export { ErrorCodes, getErrorMessage, type ErrorCode } from './ErrorCodes'

// Fallback utilities
export {
  withFallback,
  createFallbackChain,
  type FallbackOptions,
} from './Fallback'
