/**
 * Offline Storage System (Spotify/Notion Style)
 *
 * Features:
 * - IndexedDB-based storage
 * - Automatic serialization/deserialization
 * - Expiration support
 * - Storage quotas
 * - Migration support
 */

export interface StorageItem<T = unknown> {
  id: string;
  data: T;
  createdAt: number;
  updatedAt: number;
  expiresAt?: number;
  version: number;
  syncStatus: SyncStatus;
  checksum?: string;
}

export type SyncStatus = 'synced' | 'pending' | 'conflict' | 'error';

export interface StorageOptions {
  dbName: string;
  version: number;
  stores: StoreConfig[];
}

export interface StoreConfig {
  name: string;
  keyPath: string;
  indexes?: IndexConfig[];
  ttl?: number; // Time to live in milliseconds
}

export interface IndexConfig {
  name: string;
  keyPath: string | string[];
  options?: IDBIndexParameters;
}

class OfflineStorage {
  private db: IDBDatabase | null = null;
  private options: StorageOptions | null = null;
  private pendingOperations: Promise<unknown>[] = [];

  /**
   * Initialize the storage
   */
  async initialize(options: StorageOptions): Promise<void> {
    this.options = options;

    if (typeof window === 'undefined' || !window.indexedDB) {
      console.warn('IndexedDB not available');
      return;
    }

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(options.dbName, options.version);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create or update stores
        for (const storeConfig of options.stores) {
          if (!db.objectStoreNames.contains(storeConfig.name)) {
            const store = db.createObjectStore(storeConfig.name, {
              keyPath: storeConfig.keyPath
            });

            // Create indexes
            if (storeConfig.indexes) {
              for (const indexConfig of storeConfig.indexes) {
                store.createIndex(
                  indexConfig.name,
                  indexConfig.keyPath,
                  indexConfig.options
                );
              }
            }

            // Add default indexes for sync
            store.createIndex('syncStatus', 'syncStatus');
            store.createIndex('updatedAt', 'updatedAt');
          }
        }
      };
    });
  }

  /**
   * Store a single item
   */
  async set<T>(storeName: string, id: string, data: T, options?: { ttl?: number }): Promise<void> {
    if (!this.db) throw new Error('Storage not initialized');

    const storeConfig = this.options?.stores.find(s => s.name === storeName);
    const ttl = options?.ttl ?? storeConfig?.ttl;

    const item: StorageItem<T> = {
      id,
      data,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      expiresAt: ttl ? Date.now() + ttl : undefined,
      version: 1,
      syncStatus: 'pending',
      checksum: this.calculateChecksum(data)
    };

    // Check if item exists and preserve version
    const existing = await this.get<T>(storeName, id);
    if (existing) {
      item.createdAt = existing.createdAt;
      item.version = existing.version + 1;
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.put(item);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  /**
   * Get a single item
   */
  async get<T>(storeName: string, id: string): Promise<StorageItem<T> | null> {
    if (!this.db) return null;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(id);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const item = request.result as StorageItem<T> | undefined;

        // Check expiration
        if (item?.expiresAt && item.expiresAt < Date.now()) {
          this.delete(storeName, id).catch(console.error);
          resolve(null);
          return;
        }

        resolve(item || null);
      };
    });
  }

  /**
   * Get multiple items by IDs
   */
  async getMany<T>(storeName: string, ids: string[]): Promise<StorageItem<T>[]> {
    const results = await Promise.all(
      ids.map(id => this.get<T>(storeName, id))
    );
    return results.filter((item): item is StorageItem<T> => item !== null);
  }

  /**
   * Get all items in a store
   */
  async getAll<T>(storeName: string): Promise<StorageItem<T>[]> {
    if (!this.db) return [];

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const items = request.result as StorageItem<T>[];
        const now = Date.now();

        // Filter expired items
        const validItems = items.filter(item => {
          if (item.expiresAt && item.expiresAt < now) {
            this.delete(storeName, item.id).catch(console.error);
            return false;
          }
          return true;
        });

        resolve(validItems);
      };
    });
  }

  /**
   * Query items by index
   */
  async query<T>(
    storeName: string,
    indexName: string,
    value: IDBValidKey | IDBKeyRange
  ): Promise<StorageItem<T>[]> {
    if (!this.db) return [];

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const index = store.index(indexName);
      const request = index.getAll(value);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        resolve(request.result as StorageItem<T>[]);
      };
    });
  }

  /**
   * Delete a single item
   */
  async delete(storeName: string, id: string): Promise<void> {
    if (!this.db) return;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(id);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  /**
   * Clear all items in a store
   */
  async clear(storeName: string): Promise<void> {
    if (!this.db) return;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.clear();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  /**
   * Update sync status
   */
  async updateSyncStatus(
    storeName: string,
    id: string,
    status: SyncStatus
  ): Promise<void> {
    const item = await this.get(storeName, id);
    if (!item) return;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);

      item.syncStatus = status;
      item.updatedAt = Date.now();

      const request = store.put(item);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  /**
   * Get pending sync items
   */
  async getPendingItems<T>(storeName: string): Promise<StorageItem<T>[]> {
    return this.query<T>(storeName, 'syncStatus', 'pending');
  }

  /**
   * Get conflicted items
   */
  async getConflictedItems<T>(storeName: string): Promise<StorageItem<T>[]> {
    return this.query<T>(storeName, 'syncStatus', 'conflict');
  }

  /**
   * Calculate checksum for data integrity
   */
  private calculateChecksum(data: unknown): string {
    const str = JSON.stringify(data);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash.toString(16);
  }

  /**
   * Get storage usage
   */
  async getStorageUsage(): Promise<{ used: number; quota: number }> {
    if (typeof navigator !== 'undefined' && navigator.storage?.estimate) {
      const estimate = await navigator.storage.estimate();
      return {
        used: estimate.usage || 0,
        quota: estimate.quota || 0
      };
    }
    return { used: 0, quota: 0 };
  }

  /**
   * Request persistent storage
   */
  async requestPersistence(): Promise<boolean> {
    if (typeof navigator !== 'undefined' && navigator.storage?.persist) {
      return navigator.storage.persist();
    }
    return false;
  }

  /**
   * Close database connection
   */
  close(): void {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }
}

// Singleton instance
export const offlineStorage = new OfflineStorage();

// Default storage configuration
export const defaultStorageConfig: StorageOptions = {
  dbName: 'pingly_offline',
  version: 1,
  stores: [
    {
      name: 'messages',
      keyPath: 'id',
      indexes: [
        { name: 'recipientId', keyPath: 'data.recipientId' },
        { name: 'sentAt', keyPath: 'data.sentAt' }
      ],
      ttl: 7 * 24 * 60 * 60 * 1000 // 7 days
    },
    {
      name: 'contacts',
      keyPath: 'id',
      indexes: [
        { name: 'name', keyPath: 'data.name' },
        { name: 'phone', keyPath: 'data.phone' }
      ]
    },
    {
      name: 'campaigns',
      keyPath: 'id',
      indexes: [
        { name: 'status', keyPath: 'data.status' },
        { name: 'createdAt', keyPath: 'data.createdAt' }
      ]
    },
    {
      name: 'templates',
      keyPath: 'id',
      ttl: 30 * 24 * 60 * 60 * 1000 // 30 days
    },
    {
      name: 'analytics',
      keyPath: 'id',
      indexes: [
        { name: 'date', keyPath: 'data.date' }
      ],
      ttl: 90 * 24 * 60 * 60 * 1000 // 90 days
    },
    {
      name: 'syncQueue',
      keyPath: 'id',
      indexes: [
        { name: 'priority', keyPath: 'priority' },
        { name: 'createdAt', keyPath: 'createdAt' }
      ]
    }
  ]
};
