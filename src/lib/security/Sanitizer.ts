/**
 * Input Sanitization
 * Protection against XSS, SQL Injection, and other attacks
 */

// HTML entities map
const HTML_ENTITIES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '/': '&#x2F;',
  '`': '&#x60;',
  '=': '&#x3D;',
}

/**
 * Escape HTML entities
 */
export function escapeHtml(str: string): string {
  return str.replace(/[&<>"'`=/]/g, (char) => HTML_ENTITIES[char] || char)
}

/**
 * Unescape HTML entities
 */
export function unescapeHtml(str: string): string {
  const reverseEntities: Record<string, string> = {}
  Object.entries(HTML_ENTITIES).forEach(([char, entity]) => {
    reverseEntities[entity] = char
  })

  return str.replace(/&amp;|&lt;|&gt;|&quot;|&#x27;|&#x2F;|&#x60;|&#x3D;/g, (entity) =>
    reverseEntities[entity] || entity
  )
}

/**
 * Strip HTML tags
 */
export function stripHtml(str: string): string {
  return str.replace(/<[^>]*>/g, '')
}

/**
 * Sanitize HTML with allowed tags
 */
export function sanitizeHtml(
  html: string,
  options: {
    allowedTags?: string[]
    allowedAttributes?: Record<string, string[]>
  } = {}
): string {
  const {
    allowedTags = ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],
    allowedAttributes = {
      a: ['href', 'title', 'target'],
    },
  } = options

  // Simple HTML sanitizer (for production, use DOMPurify)
  let sanitized = html

  // Remove script tags
  sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')

  // Remove event handlers
  sanitized = sanitized.replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, '')

  // Remove javascript: URLs
  sanitized = sanitized.replace(/javascript:/gi, '')

  // Remove data: URLs in href/src
  sanitized = sanitized.replace(/(href|src)\s*=\s*["']data:[^"']*["']/gi, '')

  // Remove disallowed tags (keep content)
  const tagPattern = /<\/?([a-z][a-z0-9]*)\b[^>]*>/gi
  sanitized = sanitized.replace(tagPattern, (match, tag) => {
    if (allowedTags.includes(tag.toLowerCase())) {
      return match
    }
    return ''
  })

  return sanitized
}

/**
 * Sanitize string for SQL (parameterized queries are preferred)
 */
export function escapeSql(str: string): string {
  return str
    .replace(/'/g, "''")
    .replace(/\\/g, '\\\\')
    .replace(/\x00/g, '\\0')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\x1a/g, '\\Z')
}

/**
 * Sanitize filename
 */
export function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/\.{2,}/g, '.')
    .replace(/^\./, '_')
    .substring(0, 255)
}

/**
 * Sanitize URL
 */
export function sanitizeUrl(url: string): string | null {
  try {
    const parsed = new URL(url)

    // Only allow http(s) and relative URLs
    if (!['http:', 'https:', ''].includes(parsed.protocol)) {
      return null
    }

    return parsed.href
  } catch {
    // Check if it's a relative URL
    if (url.startsWith('/') && !url.startsWith('//')) {
      return url
    }
    return null
  }
}

/**
 * Sanitize phone number
 */
export function sanitizePhoneNumber(phone: string): string {
  return phone.replace(/[^0-9+]/g, '')
}

/**
 * Sanitize email
 */
export function sanitizeEmail(email: string): string {
  return email.toLowerCase().trim()
}

/**
 * Validate and sanitize object recursively
 */
export function sanitizeObject<T extends Record<string, unknown>>(
  obj: T,
  options: {
    maxDepth?: number
    maxStringLength?: number
    stripHtml?: boolean
  } = {}
): T {
  const { maxDepth = 10, maxStringLength = 10000, stripHtml: stripHtmlOption = true } = options

  function sanitize(value: unknown, depth: number): unknown {
    if (depth > maxDepth) {
      return null
    }

    if (typeof value === 'string') {
      let sanitized = value.substring(0, maxStringLength)
      if (stripHtmlOption) {
        sanitized = stripHtml(sanitized)
      }
      return escapeHtml(sanitized)
    }

    if (Array.isArray(value)) {
      return value.map((item) => sanitize(item, depth + 1))
    }

    if (value !== null && typeof value === 'object') {
      const result: Record<string, unknown> = {}
      for (const [key, val] of Object.entries(value)) {
        // Skip prototype pollution attempts
        if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
          continue
        }
        result[escapeHtml(key)] = sanitize(val, depth + 1)
      }
      return result
    }

    return value
  }

  return sanitize(obj, 0) as T
}

/**
 * Check for common attack patterns
 */
export function detectAttack(input: string): {
  isSuspicious: boolean
  attackType: string | null
} {
  const patterns = [
    { type: 'SQL Injection', regex: /(\bSELECT\b|\bUNION\b|\bINSERT\b|\bUPDATE\b|\bDELETE\b|\bDROP\b)/i },
    { type: 'XSS', regex: /<script|javascript:|on\w+\s*=/i },
    { type: 'Path Traversal', regex: /\.\.[\/\\]/ },
    { type: 'Command Injection', regex: /[;&|`$]|\b(cat|ls|rm|wget|curl)\b/i },
    { type: 'LDAP Injection', regex: /[()\\*]/ },
  ]

  for (const pattern of patterns) {
    if (pattern.regex.test(input)) {
      return { isSuspicious: true, attackType: pattern.type }
    }
  }

  return { isSuspicious: false, attackType: null }
}
