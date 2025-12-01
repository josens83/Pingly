/**
 * Database Optimization Utilities
 * Amazon-level database scaling patterns
 */

// ============================================
// Query Builder with Optimization
// ============================================

export interface QueryOptions {
  /** Select specific fields */
  select?: string[]
  /** Include relations */
  include?: Record<string, boolean | QueryOptions>
  /** Where conditions */
  where?: Record<string, unknown>
  /** Order by */
  orderBy?: Record<string, 'asc' | 'desc'>
  /** Pagination */
  take?: number
  skip?: number
  /** Cursor-based pagination */
  cursor?: { id: string }
  /** Cache TTL in seconds */
  cacheTTL?: number
}

/**
 * Optimize query for performance
 */
export function optimizeQuery(options: QueryOptions): QueryOptions {
  const optimized = { ...options }

  // Limit default page size
  if (!optimized.take || optimized.take > 100) {
    optimized.take = 20
  }

  // Use cursor pagination for large datasets
  if (optimized.skip && optimized.skip > 1000) {
    console.warn('Large offset detected. Consider using cursor-based pagination.')
  }

  return optimized
}

/**
 * Build pagination response
 */
export function buildPaginationResponse<T>(
  data: T[],
  options: {
    page?: number
    limit?: number
    total: number
  }
): {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
} {
  const { page = 1, limit = 20, total } = options
  const totalPages = Math.ceil(total / limit)

  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  }
}

// ============================================
// Connection Pool Manager
// ============================================

export interface PoolConfig {
  min: number
  max: number
  acquireTimeoutMs: number
  idleTimeoutMs: number
  connectionTimeoutMs: number
}

const DEFAULT_POOL_CONFIG: PoolConfig = {
  min: 2,
  max: 10,
  acquireTimeoutMs: 30000,
  idleTimeoutMs: 10000,
  connectionTimeoutMs: 5000,
}

/**
 * Get optimized pool configuration based on environment
 */
export function getPoolConfig(): PoolConfig {
  const env = process.env.NODE_ENV

  if (env === 'production') {
    return {
      min: 5,
      max: 20,
      acquireTimeoutMs: 30000,
      idleTimeoutMs: 30000,
      connectionTimeoutMs: 10000,
    }
  }

  if (env === 'test') {
    return {
      min: 1,
      max: 5,
      acquireTimeoutMs: 5000,
      idleTimeoutMs: 5000,
      connectionTimeoutMs: 5000,
    }
  }

  return DEFAULT_POOL_CONFIG
}

// ============================================
// Query Performance Monitoring
// ============================================

interface QueryMetric {
  query: string
  duration: number
  timestamp: number
  rowCount?: number
}

class QueryMonitor {
  private queries: QueryMetric[] = []
  private slowQueryThreshold = 1000 // 1 second

  /**
   * Record a query execution
   */
  record(query: string, duration: number, rowCount?: number): void {
    this.queries.push({
      query: this.sanitizeQuery(query),
      duration,
      timestamp: Date.now(),
      rowCount,
    })

    // Alert on slow queries
    if (duration > this.slowQueryThreshold) {
      this.alertSlowQuery(query, duration)
    }

    // Keep only recent queries
    if (this.queries.length > 1000) {
      this.queries = this.queries.slice(-500)
    }
  }

  /**
   * Get slow queries
   */
  getSlowQueries(): QueryMetric[] {
    return this.queries.filter((q) => q.duration > this.slowQueryThreshold)
  }

  /**
   * Get query statistics
   */
  getStats(): {
    totalQueries: number
    avgDuration: number
    slowQueries: number
    queriesPerMinute: number
  } {
    const now = Date.now()
    const oneMinuteAgo = now - 60000

    const recentQueries = this.queries.filter((q) => q.timestamp > oneMinuteAgo)
    const totalDuration = this.queries.reduce((sum, q) => sum + q.duration, 0)

    return {
      totalQueries: this.queries.length,
      avgDuration: this.queries.length > 0 ? totalDuration / this.queries.length : 0,
      slowQueries: this.getSlowQueries().length,
      queriesPerMinute: recentQueries.length,
    }
  }

  private sanitizeQuery(query: string): string {
    // Remove sensitive data from query for logging
    return query
      .replace(/'[^']*'/g, "'***'")
      .replace(/\d{4,}/g, '***')
      .substring(0, 500)
  }

  private alertSlowQuery(query: string, duration: number): void {
    console.warn(`[SlowQuery] ${duration}ms: ${this.sanitizeQuery(query)}`)
  }
}

export const queryMonitor = new QueryMonitor()

// ============================================
// Database Health Check
// ============================================

export interface HealthStatus {
  healthy: boolean
  latency: number
  connections: {
    active: number
    idle: number
    total: number
  }
  errors: string[]
}

/**
 * Check database health
 */
export async function checkDatabaseHealth(
  testQuery: () => Promise<unknown>
): Promise<HealthStatus> {
  const errors: string[] = []
  let latency = 0

  try {
    const start = performance.now()
    await testQuery()
    latency = performance.now() - start
  } catch (error) {
    errors.push((error as Error).message)
  }

  return {
    healthy: errors.length === 0 && latency < 5000,
    latency,
    connections: {
      active: 0, // Would be populated by actual pool
      idle: 0,
      total: 0,
    },
    errors,
  }
}

// ============================================
// Read Replica Support
// ============================================

export type DatabaseRole = 'primary' | 'replica'

/**
 * Select database based on query type
 */
export function selectDatabase(
  isWriteOperation: boolean,
  replicaAvailable: boolean
): DatabaseRole {
  if (isWriteOperation) {
    return 'primary'
  }

  if (replicaAvailable) {
    return 'replica'
  }

  return 'primary'
}

/**
 * Determine if query is a write operation
 */
export function isWriteQuery(query: string): boolean {
  const writePatterns = /^(INSERT|UPDATE|DELETE|CREATE|ALTER|DROP|TRUNCATE)/i
  return writePatterns.test(query.trim())
}
