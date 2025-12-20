/**
 * Connection Manager
 * Manages database and external service connections
 */

export type ConnectionState = 'connected' | 'disconnected' | 'connecting' | 'error'

export interface ConnectionInfo {
  name: string
  type: 'database' | 'cache' | 'queue' | 'external'
  state: ConnectionState
  lastConnected?: Date
  lastError?: string
  latency?: number
}

class ConnectionManager {
  private connections: Map<string, ConnectionInfo> = new Map()
  private healthCheckInterval: NodeJS.Timeout | null = null

  /**
   * Register a connection
   */
  register(name: string, type: ConnectionInfo['type']): void {
    this.connections.set(name, {
      name,
      type,
      state: 'disconnected',
    })
  }

  /**
   * Update connection state
   */
  updateState(name: string, state: ConnectionState, error?: string): void {
    const conn = this.connections.get(name)
    if (conn) {
      conn.state = state
      if (state === 'connected') {
        conn.lastConnected = new Date()
        conn.lastError = undefined
      }
      if (error) {
        conn.lastError = error
      }
    }
  }

  /**
   * Record connection latency
   */
  recordLatency(name: string, latency: number): void {
    const conn = this.connections.get(name)
    if (conn) {
      conn.latency = latency
    }
  }

  /**
   * Get connection info
   */
  getConnection(name: string): ConnectionInfo | undefined {
    return this.connections.get(name)
  }

  /**
   * Get all connections
   */
  getAllConnections(): ConnectionInfo[] {
    return Array.from(this.connections.values())
  }

  /**
   * Check if all critical connections are healthy
   */
  isHealthy(): boolean {
    const critical = ['database']
    return critical.every((name) => {
      const conn = this.connections.get(name)
      return conn?.state === 'connected'
    })
  }

  /**
   * Get overall health status
   */
  getHealthStatus(): {
    healthy: boolean
    connections: Record<string, ConnectionState>
    issues: string[]
  } {
    const issues: string[] = []
    const connectionStates: Record<string, ConnectionState> = {}

    this.connections.forEach((conn, name) => {
      connectionStates[name] = conn.state
      if (conn.state !== 'connected') {
        issues.push(`${name} is ${conn.state}${conn.lastError ? `: ${conn.lastError}` : ''}`)
      }
    })

    return {
      healthy: this.isHealthy(),
      connections: connectionStates,
      issues,
    }
  }

  /**
   * Start health check monitoring
   */
  startHealthCheck(
    intervalMs: number = 30000,
    checkFn: (name: string) => Promise<boolean>
  ): void {
    this.stopHealthCheck()

    this.healthCheckInterval = setInterval(async () => {
      for (const [name] of this.connections) {
        try {
          const start = performance.now()
          const isHealthy = await checkFn(name)
          const latency = performance.now() - start

          this.updateState(name, isHealthy ? 'connected' : 'error')
          this.recordLatency(name, latency)
        } catch (error) {
          this.updateState(name, 'error', (error as Error).message)
        }
      }
    }, intervalMs)
  }

  /**
   * Stop health check monitoring
   */
  stopHealthCheck(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval)
      this.healthCheckInterval = null
    }
  }

  /**
   * Graceful shutdown
   */
  async shutdown(): Promise<void> {
    this.stopHealthCheck()

    // Mark all connections as disconnected
    this.connections.forEach((conn) => {
      conn.state = 'disconnected'
    })

    console.log('[ConnectionManager] All connections closed')
  }
}

// Export singleton
export const connectionManager = new ConnectionManager()

// Register default connections
connectionManager.register('database', 'database')
connectionManager.register('cache', 'cache')
connectionManager.register('queue', 'queue')

export { ConnectionManager }
