/**
 * Message Queue System
 * Async job processing for scalability
 */

export type JobStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'retrying'
export type JobPriority = 'high' | 'normal' | 'low'

export interface Job<T = unknown> {
  id: string
  type: string
  payload: T
  priority: JobPriority
  status: JobStatus
  attempts: number
  maxAttempts: number
  createdAt: Date
  scheduledAt?: Date
  startedAt?: Date
  completedAt?: Date
  error?: string
  result?: unknown
}

export interface JobHandler<T = unknown, R = unknown> {
  (payload: T): Promise<R>
}

export interface QueueOptions {
  /** Maximum concurrent jobs */
  concurrency: number
  /** Default max attempts */
  defaultMaxAttempts: number
  /** Retry delay in ms */
  retryDelay: number
  /** Poll interval in ms */
  pollInterval: number
}

const DEFAULT_OPTIONS: QueueOptions = {
  concurrency: 5,
  defaultMaxAttempts: 3,
  retryDelay: 5000,
  pollInterval: 1000,
}

class MessageQueue {
  private jobs: Map<string, Job> = new Map()
  private handlers: Map<string, JobHandler> = new Map()
  private processing: Set<string> = new Set()
  private options: QueueOptions
  private isRunning = false
  private pollTimer: NodeJS.Timeout | null = null

  constructor(options: Partial<QueueOptions> = {}) {
    this.options = { ...DEFAULT_OPTIONS, ...options }
  }

  /**
   * Register a job handler
   */
  register<T, R>(type: string, handler: JobHandler<T, R>): void {
    this.handlers.set(type, handler as JobHandler)
  }

  /**
   * Add a job to the queue
   */
  async enqueue<T>(
    type: string,
    payload: T,
    options: {
      priority?: JobPriority
      maxAttempts?: number
      scheduledAt?: Date
    } = {}
  ): Promise<Job<T>> {
    const job: Job<T> = {
      id: this.generateId(),
      type,
      payload,
      priority: options.priority || 'normal',
      status: 'pending',
      attempts: 0,
      maxAttempts: options.maxAttempts || this.options.defaultMaxAttempts,
      createdAt: new Date(),
      scheduledAt: options.scheduledAt,
    }

    this.jobs.set(job.id, job as Job)

    if (process.env.NODE_ENV === 'development') {
      console.log(`[Queue] Job enqueued: ${job.type} (${job.id})`)
    }

    return job
  }

  /**
   * Process jobs
   */
  async processJob(job: Job): Promise<void> {
    const handler = this.handlers.get(job.type)
    if (!handler) {
      job.status = 'failed'
      job.error = `No handler registered for job type: ${job.type}`
      return
    }

    job.status = 'processing'
    job.startedAt = new Date()
    job.attempts++
    this.processing.add(job.id)

    try {
      const result = await handler(job.payload)
      job.status = 'completed'
      job.completedAt = new Date()
      job.result = result

      if (process.env.NODE_ENV === 'development') {
        console.log(`[Queue] Job completed: ${job.type} (${job.id})`)
      }
    } catch (error) {
      job.error = (error as Error).message

      if (job.attempts < job.maxAttempts) {
        job.status = 'retrying'
        // Schedule retry
        setTimeout(() => {
          job.status = 'pending'
        }, this.options.retryDelay * job.attempts)

        console.warn(`[Queue] Job failed, retrying: ${job.type} (${job.id})`, error)
      } else {
        job.status = 'failed'
        console.error(`[Queue] Job failed permanently: ${job.type} (${job.id})`, error)
      }
    } finally {
      this.processing.delete(job.id)
    }
  }

  /**
   * Start processing queue
   */
  start(): void {
    if (this.isRunning) return

    this.isRunning = true
    this.poll()
  }

  /**
   * Stop processing queue
   */
  stop(): void {
    this.isRunning = false
    if (this.pollTimer) {
      clearTimeout(this.pollTimer)
      this.pollTimer = null
    }
  }

  /**
   * Poll for pending jobs
   */
  private poll(): void {
    if (!this.isRunning) return

    const pendingJobs = this.getPendingJobs()
    const availableSlots = this.options.concurrency - this.processing.size

    // Process jobs up to concurrency limit
    pendingJobs.slice(0, availableSlots).forEach((job) => {
      this.processJob(job)
    })

    // Schedule next poll
    this.pollTimer = setTimeout(() => this.poll(), this.options.pollInterval)
  }

  /**
   * Get pending jobs sorted by priority
   */
  private getPendingJobs(): Job[] {
    const now = new Date()
    const priorityOrder = { high: 0, normal: 1, low: 2 }

    return Array.from(this.jobs.values())
      .filter((job) => {
        if (job.status !== 'pending') return false
        if (job.scheduledAt && job.scheduledAt > now) return false
        return true
      })
      .sort((a, b) => {
        // Sort by priority first, then by creation time
        const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority]
        if (priorityDiff !== 0) return priorityDiff
        return a.createdAt.getTime() - b.createdAt.getTime()
      })
  }

  /**
   * Get job by ID
   */
  getJob(id: string): Job | undefined {
    return this.jobs.get(id)
  }

  /**
   * Get queue statistics
   */
  getStats(): {
    pending: number
    processing: number
    completed: number
    failed: number
    total: number
  } {
    const jobs = Array.from(this.jobs.values())

    return {
      pending: jobs.filter((j) => j.status === 'pending' || j.status === 'retrying').length,
      processing: jobs.filter((j) => j.status === 'processing').length,
      completed: jobs.filter((j) => j.status === 'completed').length,
      failed: jobs.filter((j) => j.status === 'failed').length,
      total: jobs.length,
    }
  }

  /**
   * Clear completed and failed jobs older than TTL
   */
  cleanup(ttlMs: number = 24 * 60 * 60 * 1000): number {
    const cutoff = Date.now() - ttlMs
    let removed = 0

    this.jobs.forEach((job, id) => {
      if (
        (job.status === 'completed' || job.status === 'failed') &&
        (job.completedAt?.getTime() || job.createdAt.getTime()) < cutoff
      ) {
        this.jobs.delete(id)
        removed++
      }
    })

    return removed
  }

  private generateId(): string {
    return `job_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
  }
}

// Export singleton
export const messageQueue = new MessageQueue()

// ============================================
// Pre-defined Job Types for Pingly
// ============================================

export const JobTypes = {
  SEND_SMS: 'send_sms',
  SEND_LMS: 'send_lms',
  SEND_MMS: 'send_mms',
  SEND_KAKAO: 'send_kakao',
  PROCESS_WEBHOOK: 'process_webhook',
  GENERATE_REPORT: 'generate_report',
  SYNC_CONTACTS: 'sync_contacts',
  SEND_EMAIL: 'send_email',
} as const

// Register default handlers (placeholders)
messageQueue.register(JobTypes.SEND_SMS, async (payload: { to: string; message: string }) => {
  console.log(`[SMS] Sending to ${payload.to}: ${payload.message}`)
  // Actual SMS sending logic would go here
  return { success: true, messageId: `sms_${Date.now()}` }
})

messageQueue.register(JobTypes.SEND_EMAIL, async (payload: { to: string; subject: string; body: string }) => {
  console.log(`[Email] Sending to ${payload.to}: ${payload.subject}`)
  // Actual email sending logic would go here
  return { success: true, messageId: `email_${Date.now()}` }
})
