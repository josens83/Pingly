/**
 * Deployment Utilities
 * Blue-Green and Canary deployment support
 */

export type DeploymentStrategy = 'rolling' | 'blue-green' | 'canary'
export type DeploymentStatus = 'pending' | 'in_progress' | 'completed' | 'failed' | 'rolled_back'

export interface Deployment {
  id: string
  version: string
  strategy: DeploymentStrategy
  status: DeploymentStatus
  startedAt: Date
  completedAt?: Date
  rollbackVersion?: string
  metadata?: Record<string, unknown>
}

export interface DeploymentConfig {
  strategy: DeploymentStrategy
  canaryPercentage?: number
  healthCheckPath?: string
  rollbackOnError?: boolean
  notifyOnComplete?: boolean
}

class DeploymentManager {
  private currentDeployment: Deployment | null = null
  private deploymentHistory: Deployment[] = []
  private currentVersion: string = process.env.APP_VERSION || '1.0.0'

  /**
   * Start a new deployment
   */
  startDeployment(version: string, config: DeploymentConfig): Deployment {
    if (this.currentDeployment?.status === 'in_progress') {
      throw new Error('Another deployment is in progress')
    }

    const deployment: Deployment = {
      id: `deploy_${Date.now()}`,
      version,
      strategy: config.strategy,
      status: 'in_progress',
      startedAt: new Date(),
      metadata: {
        canaryPercentage: config.canaryPercentage,
        previousVersion: this.currentVersion,
      },
    }

    this.currentDeployment = deployment
    console.log(`[Deployment] Started ${config.strategy} deployment to ${version}`)

    return deployment
  }

  /**
   * Complete deployment
   */
  completeDeployment(success: boolean): Deployment | null {
    if (!this.currentDeployment) return null

    this.currentDeployment.status = success ? 'completed' : 'failed'
    this.currentDeployment.completedAt = new Date()

    if (success) {
      this.currentVersion = this.currentDeployment.version
    }

    this.deploymentHistory.push(this.currentDeployment)
    const completed = this.currentDeployment
    this.currentDeployment = null

    console.log(`[Deployment] ${success ? 'Completed' : 'Failed'}: ${completed.version}`)

    return completed
  }

  /**
   * Rollback to previous version
   */
  rollback(toVersion?: string): Deployment | null {
    const targetVersion = toVersion || (this.currentDeployment?.metadata?.previousVersion as string)

    if (!targetVersion) {
      throw new Error('No version to rollback to')
    }

    if (this.currentDeployment) {
      this.currentDeployment.status = 'rolled_back'
      this.currentDeployment.rollbackVersion = targetVersion
      this.currentDeployment.completedAt = new Date()
      this.deploymentHistory.push(this.currentDeployment)
    }

    this.currentVersion = targetVersion
    console.log(`[Deployment] Rolled back to ${targetVersion}`)

    const rollbackDeployment: Deployment = {
      id: `rollback_${Date.now()}`,
      version: targetVersion,
      strategy: 'rolling',
      status: 'completed',
      startedAt: new Date(),
      completedAt: new Date(),
    }

    this.currentDeployment = null
    return rollbackDeployment
  }

  /**
   * Get current version
   */
  getCurrentVersion(): string {
    return this.currentVersion
  }

  /**
   * Get deployment history
   */
  getHistory(): Deployment[] {
    return [...this.deploymentHistory]
  }

  /**
   * Get current deployment
   */
  getCurrentDeployment(): Deployment | null {
    return this.currentDeployment
  }

  /**
   * Check if should route to canary
   */
  shouldRouteToCanary(canaryPercentage: number = 10): boolean {
    return Math.random() * 100 < canaryPercentage
  }
}

export const deploymentManager = new DeploymentManager()
