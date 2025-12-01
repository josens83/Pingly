/**
 * Scalability Module Index
 * Amazon-level scalability patterns
 */

// Database Optimization
export {
  optimizeQuery,
  buildPaginationResponse,
  getPoolConfig,
  queryMonitor,
  checkDatabaseHealth,
  selectDatabase,
  isWriteQuery,
  type QueryOptions,
  type PoolConfig,
  type HealthStatus,
  type DatabaseRole,
} from './DatabaseOptimization'

// Message Queue
export {
  messageQueue,
  JobTypes,
  type Job,
  type JobStatus,
  type JobPriority,
  type JobHandler,
  type QueueOptions,
} from './MessageQueue'

// Connection Manager
export { ConnectionManager, connectionManager } from './ConnectionManager'
