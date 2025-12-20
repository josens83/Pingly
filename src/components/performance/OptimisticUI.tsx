/**
 * Optimistic UI Components
 * Chapter 18: Loading UX Strategy
 *
 * Components for optimistic updates that provide instant feedback
 */

'use client'

import { useState, useTransition, useOptimistic, ReactNode, useCallback } from 'react'
import { Heart, Check, X } from 'lucide-react'

import { Button, ButtonProps } from '@/components/ui/button'
import { cn } from '@/lib/utils'

/**
 * Generic optimistic action hook
 */
export function useOptimisticAction<T>(
  initialState: T,
  action: (currentState: T) => Promise<T>
) {
  const [isPending, startTransition] = useTransition()
  const [optimisticState, setOptimisticState] = useOptimistic(initialState)
  const [error, setError] = useState<Error | null>(null)

  const execute = useCallback(
    (newState: T) => {
      startTransition(async () => {
        setOptimisticState(newState)
        setError(null)

        try {
          await action(newState)
        } catch (e) {
          setError(e instanceof Error ? e : new Error('Action failed'))
          // State will automatically rollback due to useOptimistic
        }
      })
    },
    [action, setOptimisticState]
  )

  return {
    state: optimisticState,
    isPending,
    error,
    execute,
  }
}

/**
 * Optimistic Like Button
 */
interface LikeButtonProps {
  initialLiked: boolean
  initialCount: number
  onToggle: (liked: boolean) => Promise<void>
  size?: 'sm' | 'md' | 'lg'
  showCount?: boolean
  className?: string
}

export function LikeButton({
  initialLiked,
  initialCount,
  onToggle,
  size = 'md',
  showCount = true,
  className,
}: LikeButtonProps) {
  const [isPending, startTransition] = useTransition()
  const [optimisticState, setOptimisticState] = useOptimistic(
    { liked: initialLiked, count: initialCount },
    (state, newLiked: boolean) => ({
      liked: newLiked,
      count: newLiked ? state.count + 1 : state.count - 1,
    })
  )

  const handleClick = () => {
    const newLiked = !optimisticState.liked

    startTransition(async () => {
      setOptimisticState(newLiked)

      try {
        await onToggle(newLiked)
      } catch {
        // Rollback happens automatically
        console.error('Failed to toggle like')
      }
    })
  }

  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12',
  }

  const iconSizes = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full transition-all',
        'hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        sizeClasses[size],
        isPending && 'opacity-70',
        className
      )}
      aria-label={optimisticState.liked ? '좋아요 취소' : '좋아요'}
      aria-pressed={optimisticState.liked}
    >
      <Heart
        className={cn(
          iconSizes[size],
          'transition-all',
          optimisticState.liked
            ? 'fill-red-500 text-red-500 scale-110'
            : 'text-muted-foreground'
        )}
      />
      {showCount && (
        <span className="text-sm tabular-nums">{optimisticState.count}</span>
      )}
    </button>
  )
}

/**
 * Optimistic Toggle Button
 */
interface OptimisticToggleProps extends Omit<ButtonProps, 'onClick'> {
  initialState: boolean
  onToggle: (state: boolean) => Promise<void>
  activeLabel?: string
  inactiveLabel?: string
  activeIcon?: ReactNode
  inactiveIcon?: ReactNode
}

export function OptimisticToggle({
  initialState,
  onToggle,
  activeLabel = '활성',
  inactiveLabel = '비활성',
  activeIcon,
  inactiveIcon,
  className,
  ...props
}: OptimisticToggleProps) {
  const [isPending, startTransition] = useTransition()
  const [optimisticState, setOptimisticState] = useOptimistic(initialState)

  const handleToggle = () => {
    const newState = !optimisticState

    startTransition(async () => {
      setOptimisticState(newState)

      try {
        await onToggle(newState)
      } catch {
        console.error('Toggle failed')
      }
    })
  }

  return (
    <Button
      onClick={handleToggle}
      disabled={isPending}
      variant={optimisticState ? 'default' : 'outline'}
      className={cn(isPending && 'opacity-70', className)}
      {...props}
    >
      {optimisticState ? (
        <>
          {activeIcon ?? <Check className="h-4 w-4 mr-2" />}
          {activeLabel}
        </>
      ) : (
        <>
          {inactiveIcon ?? <X className="h-4 w-4 mr-2" />}
          {inactiveLabel}
        </>
      )}
    </Button>
  )
}

/**
 * Optimistic Action Button with loading state
 */
interface OptimisticActionButtonProps extends Omit<ButtonProps, 'onClick'> {
  action: () => Promise<void>
  successMessage?: string
  errorMessage?: string
  pendingLabel?: ReactNode
}

export function OptimisticActionButton({
  action,
  successMessage,
  errorMessage: _errorMessage,
  pendingLabel = '처리 중...',
  children,
  className,
  ...props
}: OptimisticActionButtonProps) {
  const [isPending, startTransition] = useTransition()
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const handleClick = () => {
    startTransition(async () => {
      try {
        await action()
        setStatus('success')
        setTimeout(() => setStatus('idle'), 2000)
      } catch {
        setStatus('error')
        setTimeout(() => setStatus('idle'), 3000)
      }
    })
  }

  return (
    <Button
      onClick={handleClick}
      disabled={isPending}
      className={cn(
        status === 'success' && 'bg-green-600 hover:bg-green-600',
        status === 'error' && 'bg-destructive hover:bg-destructive',
        className
      )}
      {...props}
    >
      {isPending ? (
        <>
          <svg
            className="mr-2 h-4 w-4 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          {pendingLabel}
        </>
      ) : status === 'success' && successMessage ? (
        <>
          <Check className="mr-2 h-4 w-4" />
          {successMessage}
        </>
      ) : (
        children
      )}
    </Button>
  )
}
