/**
 * Progressive Loading Components
 * Chapter 18: Loading UX Strategy
 *
 * Components for progressive content loading with proper UX
 */

'use client'

import { Suspense, ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

/**
 * Progressive section loader with fade-in animation
 */
interface ProgressiveSectionProps {
  /** Section content */
  children: ReactNode
  /** Fallback while loading */
  fallback?: ReactNode
  /** Priority level (higher = load first) */
  priority?: number
  /** Additional delay for staggered loading effect */
  delay?: number
  /** Class name for wrapper */
  className?: string
}

export function ProgressiveSection({
  children,
  fallback,
  priority: _priority = 0,
  delay = 0,
  className,
}: ProgressiveSectionProps) {
  const defaultFallback = (
    <div className="space-y-4">
      <Skeleton className="h-8 w-1/3" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-2/3" />
    </div>
  )

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: delay / 1000 }}
      className={className}
    >
      <Suspense fallback={fallback ?? defaultFallback}>
        {children}
      </Suspense>
    </motion.div>
  )
}

/**
 * Staggered list loading animation
 */
interface StaggeredListProps<T> {
  items: T[]
  renderItem: (item: T, index: number) => ReactNode
  keyExtractor: (item: T, index: number) => string | number
  /** Delay between each item (ms) */
  staggerDelay?: number
  /** Loading state */
  isLoading?: boolean
  /** Number of skeleton items to show */
  skeletonCount?: number
  /** Skeleton component to render */
  skeleton?: ReactNode
  /** Empty state */
  emptyState?: ReactNode
  /** Container class name */
  className?: string
}

export function StaggeredList<T>({
  items,
  renderItem,
  keyExtractor,
  staggerDelay = 50,
  isLoading = false,
  skeletonCount = 5,
  skeleton,
  emptyState,
  className,
}: StaggeredListProps<T>) {
  if (isLoading) {
    return (
      <div className={className}>
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <motion.div
            key={`skeleton-${i}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: (i * staggerDelay) / 1000 }}
          >
            {skeleton ?? (
              <div className="py-4 border-b last:border-0">
                <Skeleton className="h-16 w-full" />
              </div>
            )}
          </motion.div>
        ))}
      </div>
    )
  }

  if (!items.length && emptyState) {
    return <>{emptyState}</>
  }

  return (
    <div className={className}>
      <AnimatePresence>
        {items.map((item, index) => (
          <motion.div
            key={keyExtractor(item, index)}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ delay: (index * staggerDelay) / 1000 }}
          >
            {renderItem(item, index)}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

/**
 * Image with progressive loading
 */
interface ProgressiveImageProps {
  src: string
  alt: string
  className?: string
  placeholderClassName?: string
  onLoad?: () => void
  onError?: () => void
}

export function ProgressiveImage({
  src,
  alt,
  className,
  placeholderClassName,
  onLoad,
  onError,
}: ProgressiveImageProps) {
  return (
    <div className={cn('relative overflow-hidden', className)}>
      {/* Placeholder / Skeleton */}
      <div
        className={cn(
          'absolute inset-0 bg-muted animate-pulse',
          placeholderClassName
        )}
      />

      {/* Actual Image */}
      <motion.img
        src={src}
        alt={alt}
        className={cn('relative w-full h-full object-cover', className)}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        onLoad={() => onLoad?.()}
        onError={() => onError?.()}
      />
    </div>
  )
}

/**
 * Content placeholder with shimmer effect
 */
interface ShimmerPlaceholderProps {
  className?: string
  children?: ReactNode
}

export function ShimmerPlaceholder({ className, children }: ShimmerPlaceholderProps) {
  return (
    <div
      className={cn(
        'relative overflow-hidden bg-muted rounded-md',
        className
      )}
    >
      <div
        className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent"
      />
      {children}
    </div>
  )
}
