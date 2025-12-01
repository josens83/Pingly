/**
 * CSRF Protection
 * Cross-Site Request Forgery prevention
 */

import { cookies } from 'next/headers'

const CSRF_TOKEN_NAME = 'csrf_token'
const CSRF_HEADER_NAME = 'x-csrf-token'
const CSRF_COOKIE_NAME = '__csrf'

/**
 * Generate a secure random token
 */
function generateToken(length = 32): string {
  const array = new Uint8Array(length)
  if (typeof crypto !== 'undefined') {
    crypto.getRandomValues(array)
  } else {
    // Fallback for environments without crypto
    for (let i = 0; i < length; i++) {
      array[i] = Math.floor(Math.random() * 256)
    }
  }
  return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('')
}

/**
 * Create CSRF token and set cookie
 */
export async function createCSRFToken(): Promise<string> {
  const token = generateToken()
  const cookieStore = await cookies()

  cookieStore.set(CSRF_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60, // 1 hour
    path: '/',
  })

  return token
}

/**
 * Validate CSRF token
 */
export async function validateCSRFToken(token: string): Promise<boolean> {
  const cookieStore = await cookies()
  const storedToken = cookieStore.get(CSRF_COOKIE_NAME)?.value

  if (!storedToken || !token) {
    return false
  }

  // Constant-time comparison to prevent timing attacks
  if (storedToken.length !== token.length) {
    return false
  }

  let result = 0
  for (let i = 0; i < storedToken.length; i++) {
    result |= storedToken.charCodeAt(i) ^ token.charCodeAt(i)
  }

  return result === 0
}

/**
 * Get CSRF token from request
 */
export function getCSRFTokenFromRequest(request: Request): string | null {
  // Check header first
  const headerToken = request.headers.get(CSRF_HEADER_NAME)
  if (headerToken) {
    return headerToken
  }

  // Check form data
  // Note: This is a simplified version. In production, you'd parse the body
  return null
}

/**
 * CSRF validation error
 */
export class CSRFError extends Error {
  constructor(message = 'CSRF 토큰이 유효하지 않습니다.') {
    super(message)
    this.name = 'CSRFError'
  }
}

// ============================================
// Client-side CSRF helpers
// ============================================

/**
 * Get CSRF token for client-side requests
 */
export function getClientCSRFToken(): string | null {
  if (typeof document === 'undefined') return null

  // Check meta tag
  const metaTag = document.querySelector('meta[name="csrf-token"]')
  if (metaTag) {
    return metaTag.getAttribute('content')
  }

  // Check hidden input
  const input = document.querySelector(`input[name="${CSRF_TOKEN_NAME}"]`) as HTMLInputElement
  if (input) {
    return input.value
  }

  return null
}

/**
 * Add CSRF token to fetch options
 */
export function withCSRF(options: RequestInit = {}): RequestInit {
  const token = getClientCSRFToken()
  if (!token) return options

  return {
    ...options,
    headers: {
      ...options.headers,
      [CSRF_HEADER_NAME]: token,
    },
  }
}

/**
 * Create a fetch wrapper with CSRF protection
 */
export function createCSRFFetch() {
  return (url: string, options: RequestInit = {}): Promise<Response> => {
    return fetch(url, withCSRF(options))
  }
}
