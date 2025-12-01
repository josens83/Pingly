/**
 * Offline Module
 *
 * Enterprise-grade offline support and synchronization
 * inspired by Spotify and Notion.
 */

// Offline Storage
export {
  offlineStorage,
  defaultStorageConfig,
  type StorageItem,
  type SyncStatus,
  type StorageOptions,
  type StoreConfig,
  type IndexConfig
} from './OfflineStorage';

// Sync Manager
export {
  syncManager,
  useSyncProgress,
  useSyncStatus,
  type SyncOperation,
  type SyncResult,
  type ConflictResolution,
  type SyncConfig,
  type SyncProgress,
  type ConflictInfo
} from './SyncManager';

// Service Worker
export {
  serviceWorker,
  generateServiceWorkerCode,
  defaultServiceWorkerConfig,
  defaultCacheConfigs,
  type ServiceWorkerConfig,
  type CacheStrategy,
  type CacheConfig,
  type BackgroundSyncConfig
} from './ServiceWorker';
