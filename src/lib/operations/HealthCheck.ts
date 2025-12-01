/**
 * Health Check System
 * DevOps-level operational readiness
 */

export type HealthCheckStatus = 'healthy' | 'degraded' | 'unhealthy'

export interface HealthCheckResult {
  status: HealthCheckStatus
  timestamp: string
  version: string
  uptime: number
  checks: Record<string, {
    status: HealthCheckStatus
    latency?: number
    message?: string
  }>
}

export interface HealthCheck {
  name: string
  check: () => Promise<{ healthy: boolean; message?: string }>
  critical?: boolean
  timeout?: number
}

class HealthCheckService {
  private checks: HealthCheck[] = []
  private startTime = Date.now()

  /**
   * Register a health check
   */
  register(check: HealthCheck): void {
    this.checks.push(check)
  }

  /**
   * Run all health checks
   */
  async runChecks(): Promise<HealthCheckResult> {
    const results: HealthCheckResult['checks'] = {}
    let overallStatus: HealthCheckStatus = 'healthy'
    let hasCriticalFailure = false

    for (const check of this.checks) {
      try {
        const startTime = performance.now()
        const timeoutMs = check.timeout || 5000

        const result = await Promise.race([
          check.check(),
          new Promise<{ healthy: boolean; message: string }>((_, reject) =>
            setTimeout(() => reject(new Error('Health check timeout')), timeoutMs)
          ),
        ])

        const latency = performance.now() - startTime

        results[check.name] = {
          status: result.healthy ? 'healthy' : 'unhealthy',
          latency: Math.round(latency),
          message: result.message,
        }

        if (!result.healthy) {
          if (check.critical) {
            hasCriticalFailure = true
          } else {
            overallStatus = 'degraded'
          }
        }
      } catch (error) {
        results[check.name] = {
          status: 'unhealthy',
          message: (error as Error).message,
        }

        if (check.critical) {
          hasCriticalFailure = true
        } else {
          overallStatus = 'degraded'
        }
      }
    }

    if (hasCriticalFailure) {
      overallStatus = 'unhealthy'
    }

    return {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      version: process.env.APP_VERSION || '1.0.0',
      uptime: Math.floor((Date.now() - this.startTime) / 1000),
      checks: results,
    }
  }

  /**
   * Simple liveness check
   */
  async livenessCheck(): Promise<{ status: 'ok' | 'error' }> {
    return { status: 'ok' }
  }

  /**
   * Readiness check (can serve traffic)
   */
  async readinessCheck(): Promise<{ ready: boolean; reason?: string }> {
    const result = await this.runChecks()

    return {
      ready: result.status !== 'unhealthy',
      reason: result.status === 'unhealthy' ? 'Critical checks failed' : undefined,
    }
  }
}

// Export singleton
export const healthCheck = new HealthCheckService()

// Register default checks
healthCheck.register({
  name: 'memory',
  check: async () => {
    if (typeof process !== 'undefined' && process.memoryUsage) {
      const usage = process.memoryUsage()
      const usedMB = Math.round(usage.heapUsed / 1024 / 1024)
      const totalMB = Math.round(usage.heapTotal / 1024 / 1024)
      const usagePercent = (usedMB / totalMB) * 100

      return {
        healthy: usagePercent < 90,
        message: `${usedMB}MB / ${totalMB}MB (${usagePercent.toFixed(1)}%)`,
      }
    }
    return { healthy: true }
  },
})

healthCheck.register({
  name: 'eventLoop',
  check: async () => {
    const start = Date.now()
    await new Promise((resolve) => setImmediate(resolve))
    const lag = Date.now() - start

    return {
      healthy: lag < 100,
      message: `${lag}ms lag`,
    }
  },
})

export { HealthCheckService }
