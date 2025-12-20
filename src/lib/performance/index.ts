/**
 * Performance Module Index
 * Google-level performance optimization utilities
 */

// Web Vitals
export {
  initWebVitals,
  setWebVitalsReporter,
  getPerformanceSummary,
  markPerformance,
  measurePerformance,
  trackRenderTime,
  type WebVitalMetric,
  type WebVitalsReporter,
} from './WebVitals'

// Lazy Loading
export {
  lazyWithPreload,
  lazyWithRetry,
  preloadComponent,
  createPreloadHandler,
  dynamicImportWithTimeout,
  prefetchOnIdle,
  preconnectToOrigins,
  loadScript,
  loadStylesheet,
} from './LazyLoad'

// Image Optimization
export {
  getOptimizedImageUrl,
  generateSrcSet,
  generateSizes,
  generateBlurPlaceholder,
  supportsWebP,
  supportsAVIF,
  getBestImageFormat,
  preloadImage,
  calculateAspectRatio,
  getImageDimensions,
  type ImageOptimizationOptions,
} from './ImageOptimization'

// Caching
export {
  LRUCache,
  SessionCache,
  IndexedDBCache,
  MultiLayerCache,
  memoryCache,
  sessionCache,
  multiLayerCache,
} from './Cache'

// Hooks
export { usePerformanceMonitor, useDeferredValue, useThrottledValue } from './hooks'

// Chapter 18 Utilities
export {
  useDelayedLoading,
  useRenderTime,
  useDebounce,
  useThrottle,
  useIntersectionObserver,
  useIdleCallback,
  usePrefetch,
  useMemoryMonitor,
  useLongTaskObserver,
} from './utils'

// Chapter 18 Prefetch Utilities
export {
  usePrefetchRoute,
  usePrefetchQuery,
  usePreloadImage,
  preloadImages,
  useGalleryPreload,
  preconnect,
  dnsPrefetch,
  preloadScript,
  usePreconnect,
  useViewportPrefetch,
} from './prefetch'
