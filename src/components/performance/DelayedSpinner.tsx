/**
 * Delayed Spinner Component
 * Chapter 18: Loading UX Strategy
 *
 * Only shows loading indicator after a delay to prevent flashing
 * for fast operations (< 100ms)
 */

'use client'

import { useState, useEffect } from 'react'

import { cn } from '@/lib/utils'

interface DelayedSpinnerProps {
  /** Delay before showing spinner (ms) */
  delay?: number
  /** Size of spinner */
  size?: 'sm' | 'md' | 'lg'
  /** Additional class names */
  className?: string
  /** Children to show while loading (optional custom spinner) */
  children?: React.ReactNode
}

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-8 w-8',
}

export function DelayedSpinner({
  delay = 100,
  size = 'md',
  className,
  children,
}: DelayedSpinnerProps) {
  const [showSpinner, setShowSpinner] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSpinner(true)
    }, delay)

    return () => clearTimeout(timer)
  }, [delay])

  if (!showSpinner) {
    return null
  }

  if (children) {
    return <>{children}</>
  }

  return (
    <svg
      className={cn(
        'animate-spin text-muted-foreground',
        sizeClasses[size],
        className
      )}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
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
  )
}

/**
 * Delayed Loading Wrapper
 * Shows children only after delay, useful for wrapping skeletons
 */
interface DelayedLoadingProps {
  /** Whether loading is active */
  isLoading: boolean
  /** Delay before showing loading state */
  delay?: number
  /** Loading content (skeleton, spinner, etc) */
  loadingContent: React.ReactNode
  /** Main content */
  children: React.ReactNode
}

export function DelayedLoading({
  isLoading,
  delay = 100,
  loadingContent,
  children,
}: DelayedLoadingProps) {
  const [showLoading, setShowLoading] = useState(false)

  useEffect(() => {
    let timer: NodeJS.Timeout

    if (isLoading) {
      timer = setTimeout(() => {
        setShowLoading(true)
      }, delay)
    } else {
      setShowLoading(false)
    }

    return () => {
      if (timer) clearTimeout(timer)
    }
  }, [isLoading, delay])

  if (isLoading && showLoading) {
    return <>{loadingContent}</>
  }

  if (isLoading) {
    // Still loading but delay hasn't passed - show nothing or previous content
    return null
  }

  return <>{children}</>
}
