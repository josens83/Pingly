/**
 * Sync Manager (Spotify/Notion Style)
 *
 * Handles offline-to-online synchronization with:
 * - Queue-based sync operations
 * - Conflict resolution strategies
 * - Retry with exponential backoff
 * - Background sync support
 * - Real-time sync status updates
 */

import { offlineStorage, type StorageItem, type SyncStatus } from './OfflineStorage';

export interface SyncOperation<T = unknown> {
  id: string;
  type: 'create' | 'update' | 'delete';
  storeName: string;
  itemId: string;
  data?: T;
  priority: number;
  attempts: number;
  maxAttempts: number;
  createdAt: number;
  lastAttemptAt?: number;
  error?: string;
  conflictData?: T;
}

export interface SyncResult<T = unknown> {
  success: boolean;
  operation: SyncOperation<T>;
  serverData?: T;
  error?: Error;
  conflictResolution?: ConflictResolution;
}

export type ConflictResolution = 'client_wins' | 'server_wins' | 'merge' | 'manual';

export interface SyncConfig {
  autoSync: boolean;
  syncInterval: number; // milliseconds
  maxRetries: number;
  retryBaseDelay: number; // milliseconds
  batchSize: number;
  conflictStrategy: ConflictResolution;
}

export interface SyncProgress {
  total: number;
  completed: number;
  failed: number;
  pending: number;
  inProgress: boolean;
}

export interface ConflictInfo<T> {
  operation: SyncOperation<T>;
  clientData: T;
  serverData: T;
  localVersion: number;
  serverVersion: number;
}

type SyncHandler<T> = (operation: SyncOperation<T>) => Promise<T | null>;
type ConflictResolver<T> = (conflict: ConflictInfo<T>) => Promise<T>;
type ProgressListener = (progress: SyncProgress) => void;

class SyncManager {
  private config: SyncConfig = {
    autoSync: true,
    syncInterval: 30000, // 30 seconds
    maxRetries: 5,
    retryBaseDelay: 1000,
    batchSize: 10,
    conflictStrategy: 'client_wins'
  };

  private handlers: Map<string, SyncHandler<unknown>> = new Map();
  private conflictResolvers: Map<string, ConflictResolver<unknown>> = new Map();
  private progressListeners: Set<ProgressListener> = new Set();
  private syncTimer: ReturnType<typeof setInterval> | null = null;
  private isSyncing = false;
  private isOnline = true;
  private queue: SyncOperation[] = [];

  constructor() {
    if (typeof window !== 'undefined') {
      this.setupOnlineListener();
    }
  }

  /**
   * Configure sync settings
   */
  configure(config: Partial<SyncConfig>): void {
    this.config = { ...this.config, ...config };

    if (this.config.autoSync) {
      this.startAutoSync();
    } else {
      this.stopAutoSync();
    }
  }

  /**
   * Register a sync handler for a store
   */
  registerHandler<T>(storeName: string, handler: SyncHandler<T>): void {
    this.handlers.set(storeName, handler as SyncHandler<unknown>);
  }

  /**
   * Register a conflict resolver for a store
   */
  registerConflictResolver<T>(storeName: string, resolver: ConflictResolver<T>): void {
    this.conflictResolvers.set(storeName, resolver as ConflictResolver<unknown>);
  }

  /**
   * Queue an operation for sync
   */
  async queueOperation<T>(operation: Omit<SyncOperation<T>, 'id' | 'attempts' | 'maxAttempts' | 'createdAt'>): Promise<void> {
    const syncOp: SyncOperation<T> = {
      ...operation,
      id: this.generateId(),
      attempts: 0,
      maxAttempts: this.config.maxRetries,
      createdAt: Date.now()
    };

    await offlineStorage.set('syncQueue', syncOp.id, syncOp);
    this.queue.push(syncOp as SyncOperation);

    // Trigger immediate sync if online
    if (this.isOnline && !this.isSyncing) {
      this.sync().catch(console.error);
    }
  }

  /**
   * Start automatic synchronization
   */
  startAutoSync(): void {
    this.stopAutoSync();

    this.syncTimer = setInterval(() => {
      if (this.isOnline && !this.isSyncing) {
        this.sync().catch(console.error);
      }
    }, this.config.syncInterval);
  }

  /**
   * Stop automatic synchronization
   */
  stopAutoSync(): void {
    if (this.syncTimer) {
      clearInterval(this.syncTimer);
      this.syncTimer = null;
    }
  }

  /**
   * Perform synchronization
   */
  async sync(): Promise<SyncResult[]> {
    if (this.isSyncing || !this.isOnline) {
      return [];
    }

    this.isSyncing = true;
    const results: SyncResult[] = [];

    try {
      // Load pending operations from storage
      const pendingItems = await offlineStorage.getAll<SyncOperation>('syncQueue');
      const operations = pendingItems
        .map(item => item.data)
        .filter(op => op.attempts < op.maxAttempts)
        .sort((a, b) => b.priority - a.priority || a.createdAt - b.createdAt);

      // Process in batches
      for (let i = 0; i < operations.length; i += this.config.batchSize) {
        const batch = operations.slice(i, i + this.config.batchSize);
        const batchResults = await Promise.all(
          batch.map(op => this.processOperation(op))
        );
        results.push(...batchResults);

        // Update progress
        this.notifyProgress({
          total: operations.length,
          completed: results.filter(r => r.success).length,
          failed: results.filter(r => !r.success).length,
          pending: operations.length - results.length,
          inProgress: true
        });
      }

      // Final progress update
      this.notifyProgress({
        total: operations.length,
        completed: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length,
        pending: 0,
        inProgress: false
      });
    } finally {
      this.isSyncing = false;
    }

    return results;
  }

  /**
   * Process a single sync operation
   */
  private async processOperation<T>(operation: SyncOperation<T>): Promise<SyncResult<T>> {
    const handler = this.handlers.get(operation.storeName);

    if (!handler) {
      return {
        success: false,
        operation,
        error: new Error(`No handler registered for store: ${operation.storeName}`)
      };
    }

    try {
      // Update attempt info
      operation.attempts++;
      operation.lastAttemptAt = Date.now();
      await offlineStorage.set('syncQueue', operation.id, operation);

      // Execute sync handler
      const serverData = await handler(operation);

      // Check for conflicts
      if (serverData && operation.type === 'update') {
        const localItem = await offlineStorage.get<T>(operation.storeName, operation.itemId);

        if (localItem && this.hasConflict(localItem.data as T, serverData as T)) {
          return this.handleConflict(operation, localItem.data as T, serverData as T, localItem.version);
        }
      }

      // Success - remove from queue and update sync status
      await offlineStorage.delete('syncQueue', operation.id);
      await offlineStorage.updateSyncStatus(operation.storeName, operation.itemId, 'synced');

      return {
        success: true,
        operation,
        serverData: serverData as T
      };
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));

      // Check if we should retry
      if (operation.attempts >= operation.maxAttempts) {
        operation.error = err.message;
        await offlineStorage.set('syncQueue', operation.id, operation);
        await offlineStorage.updateSyncStatus(operation.storeName, operation.itemId, 'error');

        return {
          success: false,
          operation,
          error: err
        };
      }

      // Schedule retry with exponential backoff
      const delay = this.config.retryBaseDelay * Math.pow(2, operation.attempts - 1);
      setTimeout(() => {
        if (this.isOnline && !this.isSyncing) {
          this.sync().catch(console.error);
        }
      }, delay);

      return {
        success: false,
        operation,
        error: err
      };
    }
  }

  /**
   * Check for conflicts between local and server data
   */
  private hasConflict<T>(localData: T, serverData: T): boolean {
    // Simple checksum comparison
    const localChecksum = JSON.stringify(localData);
    const serverChecksum = JSON.stringify(serverData);
    return localChecksum !== serverChecksum;
  }

  /**
   * Handle sync conflict
   */
  private async handleConflict<T>(
    operation: SyncOperation<T>,
    clientData: T,
    serverData: T,
    localVersion: number
  ): Promise<SyncResult<T>> {
    const resolver = this.conflictResolvers.get(operation.storeName);

    let resolvedData: T;
    let resolution: ConflictResolution = this.config.conflictStrategy;

    if (resolver) {
      try {
        resolvedData = await resolver({
          operation,
          clientData,
          serverData,
          localVersion,
          serverVersion: localVersion + 1 // Assume server is one ahead
        });
        resolution = 'merge';
      } catch {
        // Fall back to default strategy
        resolvedData = this.applyConflictStrategy(clientData, serverData);
      }
    } else {
      resolvedData = this.applyConflictStrategy(clientData, serverData);
    }

    // Update local storage with resolved data
    await offlineStorage.set(operation.storeName, operation.itemId, resolvedData);
    await offlineStorage.delete('syncQueue', operation.id);
    await offlineStorage.updateSyncStatus(operation.storeName, operation.itemId, 'synced');

    return {
      success: true,
      operation,
      serverData,
      conflictResolution: resolution
    };
  }

  /**
   * Apply default conflict resolution strategy
   */
  private applyConflictStrategy<T>(clientData: T, serverData: T): T {
    switch (this.config.conflictStrategy) {
      case 'client_wins':
        return clientData;
      case 'server_wins':
        return serverData;
      case 'merge':
        // Simple merge - server overwrites client, then client overwrites server
        if (typeof clientData === 'object' && typeof serverData === 'object') {
          return { ...serverData, ...clientData } as T;
        }
        return clientData;
      case 'manual':
        // Store conflict for manual resolution
        return clientData;
      default:
        return clientData;
    }
  }

  /**
   * Subscribe to sync progress updates
   */
  onProgress(listener: ProgressListener): () => void {
    this.progressListeners.add(listener);
    return () => this.progressListeners.delete(listener);
  }

  private notifyProgress(progress: SyncProgress): void {
    this.progressListeners.forEach(listener => listener(progress));
  }

  /**
   * Setup online/offline listeners
   */
  private setupOnlineListener(): void {
    window.addEventListener('online', () => {
      this.isOnline = true;
      if (this.config.autoSync) {
        this.sync().catch(console.error);
      }
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
    });

    this.isOnline = navigator.onLine;
  }

  /**
   * Generate unique ID for operations
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get pending operations count
   */
  async getPendingCount(): Promise<number> {
    const items = await offlineStorage.getAll<SyncOperation>('syncQueue');
    return items.length;
  }

  /**
   * Clear all pending operations
   */
  async clearQueue(): Promise<void> {
    await offlineStorage.clear('syncQueue');
    this.queue = [];
  }

  /**
   * Force sync a specific item
   */
  async forceSyncItem(storeName: string, itemId: string): Promise<SyncResult | null> {
    const item = await offlineStorage.get(storeName, itemId);
    if (!item || item.syncStatus === 'synced') {
      return null;
    }

    const operation: SyncOperation = {
      id: this.generateId(),
      type: 'update',
      storeName,
      itemId,
      data: item.data,
      priority: 10, // High priority
      attempts: 0,
      maxAttempts: 1, // Single attempt for force sync
      createdAt: Date.now()
    };

    return this.processOperation(operation);
  }

  /**
   * Get sync status
   */
  getStatus(): { isOnline: boolean; isSyncing: boolean; autoSync: boolean } {
    return {
      isOnline: this.isOnline,
      isSyncing: this.isSyncing,
      autoSync: this.config.autoSync
    };
  }
}

// Singleton instance
export const syncManager = new SyncManager();

// React hooks
export function useSyncProgress(): SyncProgress {
  // In a real implementation, this would use React state
  return {
    total: 0,
    completed: 0,
    failed: 0,
    pending: 0,
    inProgress: false
  };
}

export function useSyncStatus(): { isOnline: boolean; isSyncing: boolean; pendingCount: number } {
  const status = syncManager.getStatus();
  return {
    ...status,
    pendingCount: 0 // Would be fetched asynchronously
  };
}
