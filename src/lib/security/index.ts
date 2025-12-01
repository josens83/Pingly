/**
 * Security Module Index
 * Bank-level security utilities
 */

// Rate Limiting
export {
  RateLimiter,
  RateLimitError,
  apiRateLimiter,
  authRateLimiter,
  smsRateLimiter,
  passwordResetRateLimiter,
  type RateLimitConfig,
} from './RateLimiter'

// Input Sanitization
export {
  escapeHtml,
  unescapeHtml,
  stripHtml,
  sanitizeHtml,
  escapeSql,
  sanitizeFilename,
  sanitizeUrl,
  sanitizePhoneNumber,
  sanitizeEmail,
  sanitizeObject,
  detectAttack,
} from './Sanitizer'

// CSRF Protection
export {
  createCSRFToken,
  validateCSRFToken,
  getCSRFTokenFromRequest,
  getClientCSRFToken,
  withCSRF,
  createCSRFFetch,
  CSRFError,
} from './CSRF'

// Audit Logging
export {
  auditLog,
  logAudit,
  type AuditAction,
  type AuditEntry,
  type AuditContext,
} from './AuditLog'

// Validation
export { validateInput, ValidationSchemas, type ValidationResult } from './Validation'
