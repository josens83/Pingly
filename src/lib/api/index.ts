/**
 * API Module Index
 * Production-ready API utilities
 */

export { api, ApiClient, ApiError, type RequestConfig, type ApiResponse } from './client'
export {
  useApiQuery,
  useApiMutation,
  useApiInfiniteQuery,
  usePrefetch,
  useErrorMessage,
} from './hooks'
