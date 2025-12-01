/**
 * GDPR Compliance Utilities
 * Enterprise-level data protection
 */

export interface ConsentRecord {
  userId: string
  purpose: string
  granted: boolean
  timestamp: Date
  source: string
  version: string
  expiresAt?: Date
}

export interface DataSubjectRequest {
  id: string
  userId: string
  type: 'access' | 'rectification' | 'erasure' | 'portability' | 'restriction'
  status: 'pending' | 'in_progress' | 'completed' | 'rejected'
  requestedAt: Date
  completedAt?: Date
  notes?: string
}

class GDPRService {
  private consents: Map<string, ConsentRecord[]> = new Map()
  private requests: Map<string, DataSubjectRequest> = new Map()

  /**
   * Record user consent
   */
  recordConsent(consent: Omit<ConsentRecord, 'timestamp'>): ConsentRecord {
    const record: ConsentRecord = {
      ...consent,
      timestamp: new Date(),
    }

    const userConsents = this.consents.get(consent.userId) || []
    userConsents.push(record)
    this.consents.set(consent.userId, userConsents)

    console.log(`[GDPR] Consent recorded for user ${consent.userId}: ${consent.purpose}`)

    return record
  }

  /**
   * Check if user has valid consent
   */
  hasValidConsent(userId: string, purpose: string): boolean {
    const userConsents = this.consents.get(userId) || []
    const latestConsent = userConsents
      .filter((c) => c.purpose === purpose)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())[0]

    if (!latestConsent) return false
    if (!latestConsent.granted) return false
    if (latestConsent.expiresAt && latestConsent.expiresAt < new Date()) return false

    return true
  }

  /**
   * Withdraw consent
   */
  withdrawConsent(userId: string, purpose: string): void {
    this.recordConsent({
      userId,
      purpose,
      granted: false,
      source: 'user_withdrawal',
      version: '1.0',
    })

    console.log(`[GDPR] Consent withdrawn for user ${userId}: ${purpose}`)
  }

  /**
   * Create data subject request
   */
  createRequest(request: Omit<DataSubjectRequest, 'id' | 'requestedAt' | 'status'>): DataSubjectRequest {
    const dsr: DataSubjectRequest = {
      ...request,
      id: `dsr_${Date.now()}`,
      status: 'pending',
      requestedAt: new Date(),
    }

    this.requests.set(dsr.id, dsr)

    console.log(`[GDPR] Data subject request created: ${dsr.type} for user ${dsr.userId}`)

    return dsr
  }

  /**
   * Process data subject request
   */
  async processRequest(
    requestId: string,
    handler: (request: DataSubjectRequest) => Promise<void>
  ): Promise<void> {
    const request = this.requests.get(requestId)
    if (!request) throw new Error('Request not found')

    request.status = 'in_progress'

    try {
      await handler(request)
      request.status = 'completed'
      request.completedAt = new Date()
      console.log(`[GDPR] Request completed: ${requestId}`)
    } catch (error) {
      request.status = 'rejected'
      request.notes = (error as Error).message
      throw error
    }
  }

  /**
   * Export user data (portability)
   */
  async exportUserData(userId: string): Promise<object> {
    // This would gather all user data from various sources
    return {
      userId,
      exportedAt: new Date().toISOString(),
      consents: this.consents.get(userId) || [],
      // Additional data would be added here
    }
  }

  /**
   * Anonymize user data
   */
  anonymizeData(data: Record<string, unknown>): Record<string, unknown> {
    const anonymized = { ...data }

    const sensitiveFields = ['email', 'phone', 'name', 'address', 'ip']
    for (const field of sensitiveFields) {
      if (field in anonymized) {
        anonymized[field] = '[ANONYMIZED]'
      }
    }

    return anonymized
  }

  /**
   * Get data retention policy
   */
  getRetentionPolicy(): {
    category: string
    retentionPeriod: string
    legalBasis: string
  }[] {
    return [
      {
        category: 'Account Data',
        retentionPeriod: 'Until account deletion + 30 days',
        legalBasis: 'Contract performance',
      },
      {
        category: 'Transaction Data',
        retentionPeriod: '7 years',
        legalBasis: 'Legal obligation',
      },
      {
        category: 'Marketing Data',
        retentionPeriod: 'Until consent withdrawal',
        legalBasis: 'Consent',
      },
      {
        category: 'Log Data',
        retentionPeriod: '90 days',
        legalBasis: 'Legitimate interest',
      },
    ]
  }
}

export const gdprService = new GDPRService()
