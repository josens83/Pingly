/**
 * Audit Logging System
 * Immutable audit trail for security compliance
 */

export type AuditAction =
  | 'user.login'
  | 'user.logout'
  | 'user.register'
  | 'user.password_change'
  | 'user.email_change'
  | 'user.delete'
  | 'admin.user_update'
  | 'admin.user_delete'
  | 'admin.settings_change'
  | 'message.send'
  | 'message.schedule'
  | 'message.cancel'
  | 'payment.purchase'
  | 'payment.refund'
  | 'api.key_create'
  | 'api.key_revoke'
  | 'data.export'
  | 'data.import'
  | 'security.2fa_enable'
  | 'security.2fa_disable'
  | 'security.suspicious_activity'

export interface AuditEntry {
  id: string
  timestamp: string
  action: AuditAction
  userId: string | null
  userEmail: string | null
  ipAddress: string
  userAgent: string
  resource?: string
  resourceId?: string
  details?: Record<string, unknown>
  metadata?: {
    sessionId?: string
    requestId?: string
    environment?: string
  }
  hash?: string // For tamper detection
}

export interface AuditContext {
  userId?: string
  userEmail?: string
  ipAddress: string
  userAgent: string
  sessionId?: string
  requestId?: string
}

class AuditLogger {
  private logs: AuditEntry[] = []
  private maxLogs = 10000
  private flushCallback: ((entries: AuditEntry[]) => Promise<void>) | null = null

  /**
   * Log an audit event
   */
  async log(
    action: AuditAction,
    context: AuditContext,
    details?: {
      resource?: string
      resourceId?: string
      data?: Record<string, unknown>
    }
  ): Promise<AuditEntry> {
    const entry: AuditEntry = {
      id: this.generateId(),
      timestamp: new Date().toISOString(),
      action,
      userId: context.userId || null,
      userEmail: context.userEmail || null,
      ipAddress: this.maskIpAddress(context.ipAddress),
      userAgent: context.userAgent,
      resource: details?.resource,
      resourceId: details?.resourceId,
      details: this.sanitizeDetails(details?.data),
      metadata: {
        sessionId: context.sessionId,
        requestId: context.requestId,
        environment: process.env.NODE_ENV,
      },
    }

    // Generate hash for tamper detection
    entry.hash = await this.generateHash(entry)

    // Store locally
    this.logs.push(entry)
    if (this.logs.length > this.maxLogs) {
      this.logs.shift()
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log('[Audit]', entry.action, {
        user: entry.userId,
        resource: entry.resource,
        details: entry.details,
      })
    }

    // Flush to external storage
    if (this.flushCallback) {
      await this.flushCallback([entry])
    }

    // Check for suspicious activity
    this.checkSuspiciousActivity(entry)

    return entry
  }

  /**
   * Set flush callback for external storage
   */
  setFlushCallback(callback: (entries: AuditEntry[]) => Promise<void>): void {
    this.flushCallback = callback
  }

  /**
   * Get audit logs with filtering
   */
  getLogs(options: {
    userId?: string
    action?: AuditAction
    startDate?: Date
    endDate?: Date
    limit?: number
    offset?: number
  } = {}): AuditEntry[] {
    let filtered = [...this.logs]

    if (options.userId) {
      filtered = filtered.filter((l) => l.userId === options.userId)
    }

    if (options.action) {
      filtered = filtered.filter((l) => l.action === options.action)
    }

    if (options.startDate) {
      filtered = filtered.filter((l) => new Date(l.timestamp) >= options.startDate!)
    }

    if (options.endDate) {
      filtered = filtered.filter((l) => new Date(l.timestamp) <= options.endDate!)
    }

    // Sort by timestamp descending
    filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

    // Apply pagination
    const offset = options.offset || 0
    const limit = options.limit || 100
    return filtered.slice(offset, offset + limit)
  }

  /**
   * Verify log integrity
   */
  async verifyIntegrity(entry: AuditEntry): Promise<boolean> {
    const originalHash = entry.hash
    const entryWithoutHash = { ...entry, hash: undefined }
    const calculatedHash = await this.generateHash(entryWithoutHash)
    return originalHash === calculatedHash
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `audit_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
  }

  /**
   * Generate hash for tamper detection
   */
  private async generateHash(entry: Omit<AuditEntry, 'hash'>): Promise<string> {
    const data = JSON.stringify(entry)

    if (typeof crypto !== 'undefined' && crypto.subtle) {
      const encoder = new TextEncoder()
      const dataBuffer = encoder.encode(data)
      const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer)
      const hashArray = Array.from(new Uint8Array(hashBuffer))
      return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
    }

    // Simple fallback hash
    let hash = 0
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash
    }
    return Math.abs(hash).toString(16)
  }

  /**
   * Mask IP address for privacy
   */
  private maskIpAddress(ip: string): string {
    // Mask last octet for IPv4
    if (ip.includes('.')) {
      const parts = ip.split('.')
      if (parts.length === 4) {
        parts[3] = 'xxx'
        return parts.join('.')
      }
    }

    // Mask last segment for IPv6
    if (ip.includes(':')) {
      const parts = ip.split(':')
      if (parts.length > 1) {
        parts[parts.length - 1] = 'xxxx'
        return parts.join(':')
      }
    }

    return ip
  }

  /**
   * Sanitize sensitive details
   */
  private sanitizeDetails(details?: Record<string, unknown>): Record<string, unknown> | undefined {
    if (!details) return undefined

    const sensitiveKeys = ['password', 'token', 'secret', 'key', 'credit_card', 'ssn']
    const sanitized: Record<string, unknown> = {}

    for (const [key, value] of Object.entries(details)) {
      if (sensitiveKeys.some((k) => key.toLowerCase().includes(k))) {
        sanitized[key] = '[REDACTED]'
      } else {
        sanitized[key] = value
      }
    }

    return sanitized
  }

  /**
   * Check for suspicious activity patterns
   */
  private checkSuspiciousActivity(entry: AuditEntry): void {
    const suspiciousPatterns = [
      {
        check: () =>
          entry.action === 'user.login' &&
          this.getRecentFailedLogins(entry.ipAddress) >= 5,
        alert: 'Multiple failed login attempts',
      },
      {
        check: () =>
          entry.action === 'data.export' &&
          this.getRecentExports(entry.userId!) >= 3,
        alert: 'Multiple data exports',
      },
      {
        check: () =>
          entry.action === 'admin.user_delete' &&
          this.getRecentDeletes(entry.userId!) >= 5,
        alert: 'Mass deletion detected',
      },
    ]

    for (const pattern of suspiciousPatterns) {
      if (pattern.check()) {
        this.log('security.suspicious_activity', {
          userId: entry.userId || undefined,
          userEmail: entry.userEmail || undefined,
          ipAddress: entry.ipAddress,
          userAgent: entry.userAgent,
        }, {
          data: {
            originalAction: entry.action,
            alert: pattern.alert,
          },
        })
      }
    }
  }

  private getRecentFailedLogins(ipAddress: string): number {
    const fiveMinutesAgo = Date.now() - 5 * 60 * 1000
    return this.logs.filter(
      (l) =>
        l.action === 'user.login' &&
        l.ipAddress === ipAddress &&
        l.details?.success === false &&
        new Date(l.timestamp).getTime() > fiveMinutesAgo
    ).length
  }

  private getRecentExports(userId: string): number {
    const oneHourAgo = Date.now() - 60 * 60 * 1000
    return this.logs.filter(
      (l) =>
        l.action === 'data.export' &&
        l.userId === userId &&
        new Date(l.timestamp).getTime() > oneHourAgo
    ).length
  }

  private getRecentDeletes(userId: string): number {
    const oneHourAgo = Date.now() - 60 * 60 * 1000
    return this.logs.filter(
      (l) =>
        l.action === 'admin.user_delete' &&
        l.userId === userId &&
        new Date(l.timestamp).getTime() > oneHourAgo
    ).length
  }
}

// Export singleton
export const auditLog = new AuditLogger()

// Helper functions
export async function logAudit(
  action: AuditAction,
  context: AuditContext,
  details?: {
    resource?: string
    resourceId?: string
    data?: Record<string, unknown>
  }
): Promise<AuditEntry> {
  return auditLog.log(action, context, details)
}
