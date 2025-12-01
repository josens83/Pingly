/**
 * Caching Utilities
 * Multi-layer caching strategies
 */

// ============================================
// In-Memory Cache with LRU
// ============================================

interface CacheEntry<T> {
  value: T
  timestamp: number
  ttl: number
  hits: number
}

export class LRUCache<T> {
  private cache: Map<string, CacheEntry<T>> = new Map()
  private maxSize: number

  constructor(maxSize = 100) {
    this.maxSize = maxSize
  }

  get(key: string): T | null {
    const entry = this.cache.get(key)
    if (!entry) return null

    // Check if expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key)
      return null
    }

    // Update hits and move to end (most recently used)
    entry.hits++
    this.cache.delete(key)
    this.cache.set(key, entry)

    return entry.value
  }

  set(key: string, value: T, ttl = 60000): void {
    // Evict if at capacity
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value
      if (firstKey) this.cache.delete(firstKey)
    }

    this.cache.set(key, {
      value,
      timestamp: Date.now(),
      ttl,
      hits: 0,
    })
  }

  has(key: string): boolean {
    const entry = this.cache.get(key)
    if (!entry) return false
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key)
      return false
    }
    return true
  }

  delete(key: string): boolean {
    return this.cache.delete(key)
  }

  clear(): void {
    this.cache.clear()
  }

  size(): number {
    return this.cache.size
  }

  getStats(): {
    size: number
    maxSize: number
    hitRate: number
  } {
    let totalHits = 0
    let totalEntries = 0
    this.cache.forEach((entry) => {
      totalHits += entry.hits
      totalEntries++
    })

    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      hitRate: totalEntries > 0 ? totalHits / totalEntries : 0,
    }
  }
}

// ============================================
// Session Storage Cache
// ============================================

export class SessionCache<T> {
  private prefix: string

  constructor(prefix = 'cache') {
    this.prefix = prefix
  }

  private getKey(key: string): string {
    return `${this.prefix}:${key}`
  }

  get(key: string): T | null {
    if (typeof window === 'undefined') return null

    try {
      const item = sessionStorage.getItem(this.getKey(key))
      if (!item) return null

      const { value, expiry } = JSON.parse(item)
      if (Date.now() > expiry) {
        sessionStorage.removeItem(this.getKey(key))
        return null
      }

      return value
    } catch {
      return null
    }
  }

  set(key: string, value: T, ttl = 60000): void {
    if (typeof window === 'undefined') return

    try {
      const item = {
        value,
        expiry: Date.now() + ttl,
      }
      sessionStorage.setItem(this.getKey(key), JSON.stringify(item))
    } catch {
      // Storage full, clear old items
      this.clearExpired()
    }
  }

  delete(key: string): void {
    if (typeof window === 'undefined') return
    sessionStorage.removeItem(this.getKey(key))
  }

  clear(): void {
    if (typeof window === 'undefined') return

    const keysToRemove: string[] = []
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i)
      if (key?.startsWith(this.prefix)) {
        keysToRemove.push(key)
      }
    }
    keysToRemove.forEach((key) => sessionStorage.removeItem(key))
  }

  private clearExpired(): void {
    if (typeof window === 'undefined') return

    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i)
      if (key?.startsWith(this.prefix)) {
        try {
          const item = sessionStorage.getItem(key)
          if (item) {
            const { expiry } = JSON.parse(item)
            if (Date.now() > expiry) {
              sessionStorage.removeItem(key)
            }
          }
        } catch {
          sessionStorage.removeItem(key!)
        }
      }
    }
  }
}

// ============================================
// IndexedDB Cache (for large data)
// ============================================

export class IndexedDBCache<T> {
  private dbName: string
  private storeName: string
  private db: IDBDatabase | null = null

  constructor(dbName = 'appCache', storeName = 'cache') {
    this.dbName = dbName
    this.storeName = storeName
  }

  private async getDB(): Promise<IDBDatabase> {
    if (this.db) return this.db

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 1)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        this.db = request.result
        resolve(request.result)
      }
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName, { keyPath: 'key' })
        }
      }
    })
  }

  async get(key: string): Promise<T | null> {
    if (typeof window === 'undefined') return null

    try {
      const db = await this.getDB()
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(this.storeName, 'readonly')
        const store = transaction.objectStore(this.storeName)
        const request = store.get(key)

        request.onerror = () => reject(request.error)
        request.onsuccess = () => {
          const result = request.result
          if (!result) {
            resolve(null)
            return
          }

          if (Date.now() > result.expiry) {
            this.delete(key)
            resolve(null)
            return
          }

          resolve(result.value)
        }
      })
    } catch {
      return null
    }
  }

  async set(key: string, value: T, ttl = 3600000): Promise<void> {
    if (typeof window === 'undefined') return

    try {
      const db = await this.getDB()
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(this.storeName, 'readwrite')
        const store = transaction.objectStore(this.storeName)
        const request = store.put({
          key,
          value,
          expiry: Date.now() + ttl,
        })

        request.onerror = () => reject(request.error)
        request.onsuccess = () => resolve()
      })
    } catch {
      // Ignore errors
    }
  }

  async delete(key: string): Promise<void> {
    if (typeof window === 'undefined') return

    try {
      const db = await this.getDB()
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(this.storeName, 'readwrite')
        const store = transaction.objectStore(this.storeName)
        const request = store.delete(key)

        request.onerror = () => reject(request.error)
        request.onsuccess = () => resolve()
      })
    } catch {
      // Ignore errors
    }
  }

  async clear(): Promise<void> {
    if (typeof window === 'undefined') return

    try {
      const db = await this.getDB()
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(this.storeName, 'readwrite')
        const store = transaction.objectStore(this.storeName)
        const request = store.clear()

        request.onerror = () => reject(request.error)
        request.onsuccess = () => resolve()
      })
    } catch {
      // Ignore errors
    }
  }
}

// ============================================
// Multi-Layer Cache
// ============================================

export class MultiLayerCache<T> {
  private memoryCache: LRUCache<T>
  private sessionCache: SessionCache<T>
  private dbCache: IndexedDBCache<T>

  constructor(options: {
    memoryMaxSize?: number
    prefix?: string
    dbName?: string
  } = {}) {
    this.memoryCache = new LRUCache(options.memoryMaxSize || 100)
    this.sessionCache = new SessionCache(options.prefix || 'cache')
    this.dbCache = new IndexedDBCache(options.dbName || 'appCache')
  }

  async get(key: string): Promise<T | null> {
    // Check memory first (fastest)
    let value = this.memoryCache.get(key)
    if (value !== null) return value

    // Check session storage
    value = this.sessionCache.get(key)
    if (value !== null) {
      this.memoryCache.set(key, value)
      return value
    }

    // Check IndexedDB (slowest)
    value = await this.dbCache.get(key)
    if (value !== null) {
      this.memoryCache.set(key, value)
      this.sessionCache.set(key, value)
      return value
    }

    return null
  }

  async set(key: string, value: T, options: {
    memoryTTL?: number
    sessionTTL?: number
    dbTTL?: number
  } = {}): Promise<void> {
    const {
      memoryTTL = 60000,     // 1 minute
      sessionTTL = 300000,   // 5 minutes
      dbTTL = 3600000,       // 1 hour
    } = options

    this.memoryCache.set(key, value, memoryTTL)
    this.sessionCache.set(key, value, sessionTTL)
    await this.dbCache.set(key, value, dbTTL)
  }

  async delete(key: string): Promise<void> {
    this.memoryCache.delete(key)
    this.sessionCache.delete(key)
    await this.dbCache.delete(key)
  }

  async clear(): Promise<void> {
    this.memoryCache.clear()
    this.sessionCache.clear()
    await this.dbCache.clear()
  }
}

// Singleton instances
export const memoryCache = new LRUCache(200)
export const sessionCache = new SessionCache('pingly')
export const multiLayerCache = new MultiLayerCache({ prefix: 'pingly' })
