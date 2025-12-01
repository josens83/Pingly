/**
 * React Query Hooks with Resilience
 * Production-ready data fetching hooks
 */

import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query'
import { api, ApiResponse, ApiError, RequestConfig } from './client'
import { ErrorCode, getErrorMessage, httpStatusToErrorCode, UserFriendlyError } from '../resilience/ErrorCodes'
import { HttpError } from '../resilience/RetryPolicy'

// ============================================
// Query Hook
// ============================================

interface UseApiQueryOptions<T> extends Omit<UseQueryOptions<T, UserFriendlyError>, 'queryFn'> {
  /** API endpoint */
  endpoint: string
  /** Request configuration */
  config?: RequestConfig
  /** Transform response data */
  transform?: (data: unknown) => T
}

export function useApiQuery<T>(options: UseApiQueryOptions<T>) {
  const { endpoint, config, transform, ...queryOptions } = options

  return useQuery<T, UserFriendlyError>({
    ...queryOptions,
    queryFn: async () => {
      try {
        const response: ApiResponse<T> = await api.get(endpoint, config)
        return transform ? transform(response.data) : response.data
      } catch (error) {
        throw normalizeQueryError(error)
      }
    },
    retry: (failureCount, error) => {
      // Don't retry on client errors
      if (!error.isRetryable) return false
      // Max 3 retries
      return failureCount < 3
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  })
}

// ============================================
// Mutation Hook
// ============================================

interface UseApiMutationOptions<TData, TVariables>
  extends Omit<UseMutationOptions<TData, UserFriendlyError, TVariables>, 'mutationFn'> {
  /** API endpoint */
  endpoint: string
  /** HTTP method */
  method?: 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  /** Request configuration */
  config?: RequestConfig
  /** Query keys to invalidate on success */
  invalidateQueries?: string[][]
  /** Optimistic update function */
  optimisticUpdate?: (variables: TVariables) => void
  /** Rollback function for failed optimistic update */
  rollback?: (variables: TVariables, error: UserFriendlyError) => void
}

export function useApiMutation<TData, TVariables = unknown>(
  options: UseApiMutationOptions<TData, TVariables>
) {
  const {
    endpoint,
    method = 'POST',
    config,
    invalidateQueries,
    optimisticUpdate,
    rollback,
    ...mutationOptions
  } = options

  const queryClient = useQueryClient()

  return useMutation<TData, UserFriendlyError, TVariables>({
    ...mutationOptions,
    mutationFn: async (variables) => {
      try {
        let response: ApiResponse<TData>

        switch (method) {
          case 'POST':
            response = await api.post(endpoint, variables, config)
            break
          case 'PUT':
            response = await api.put(endpoint, variables, config)
            break
          case 'PATCH':
            response = await api.patch(endpoint, variables, config)
            break
          case 'DELETE':
            response = await api.delete(endpoint, config)
            break
        }

        return response.data
      } catch (error) {
        throw normalizeQueryError(error)
      }
    },
    onMutate: async (variables) => {
      // Optimistic update
      if (optimisticUpdate) {
        optimisticUpdate(variables)
      }

      // Call original onMutate
      await mutationOptions.onMutate?.(variables)
    },
    onError: (error, variables, context) => {
      // Rollback optimistic update
      if (rollback) {
        rollback(variables, error)
      }

      // Call original onError
      mutationOptions.onError?.(error, variables, context)
    },
    onSuccess: async (data, variables, context) => {
      // Invalidate queries
      if (invalidateQueries) {
        await Promise.all(
          invalidateQueries.map((queryKey) => queryClient.invalidateQueries({ queryKey }))
        )
      }

      // Call original onSuccess
      await mutationOptions.onSuccess?.(data, variables, context)
    },
  })
}

// ============================================
// Infinite Query Hook
// ============================================

interface UseApiInfiniteQueryOptions<T> {
  /** Query key */
  queryKey: unknown[]
  /** Base API endpoint */
  endpoint: string
  /** Page size */
  pageSize?: number
  /** Request configuration */
  config?: RequestConfig
  /** Get next page param from response */
  getNextPageParam?: (lastPage: T, pages: T[]) => unknown
  /** Transform response data */
  transform?: (data: unknown) => T
}

export function useApiInfiniteQuery<T>(options: UseApiInfiniteQueryOptions<T>) {
  const {
    queryKey,
    endpoint,
    pageSize = 20,
    config,
    getNextPageParam,
    transform,
  } = options

  return useQuery({
    queryKey,
    queryFn: async ({ pageParam = 1 }) => {
      try {
        const url = `${endpoint}?page=${pageParam}&limit=${pageSize}`
        const response: ApiResponse<T> = await api.get(url, config)
        return transform ? transform(response.data) : response.data
      } catch (error) {
        throw normalizeQueryError(error)
      }
    },
  })
}

// ============================================
// Prefetch Utility
// ============================================

export function usePrefetch() {
  const queryClient = useQueryClient()

  const prefetch = async <T>(queryKey: unknown[], endpoint: string, config?: RequestConfig) => {
    await queryClient.prefetchQuery({
      queryKey,
      queryFn: async () => {
        const response: ApiResponse<T> = await api.get(endpoint, config)
        return response.data
      },
    })
  }

  return { prefetch }
}

// ============================================
// Error Handling Utilities
// ============================================

function normalizeQueryError(error: unknown): UserFriendlyError {
  if (error instanceof UserFriendlyError) {
    return error
  }

  if (error instanceof HttpError) {
    const code = httpStatusToErrorCode(error.status)
    return new UserFriendlyError(code, error)
  }

  if (error instanceof ApiError) {
    return new UserFriendlyError(error.code as ErrorCode, error)
  }

  if (error instanceof Error) {
    // Network error
    if (error.message.includes('fetch') || error.message.includes('network')) {
      return new UserFriendlyError('NETWORK_ERROR', error)
    }

    // Timeout
    if (error.message.includes('timeout')) {
      return new UserFriendlyError('TIMEOUT', error)
    }
  }

  return new UserFriendlyError('UNKNOWN', error as Error)
}

// ============================================
// Error Display Hook
// ============================================

export function useErrorMessage(error: UserFriendlyError | null) {
  if (!error) return null

  return {
    title: error.title,
    message: error.message,
    suggestion: error.suggestion,
    code: error.code,
    isRetryable: error.isRetryable,
  }
}
