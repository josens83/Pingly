'use client'

/**
 * Virtual List Component
 * Efficient rendering for large lists (Instagram/TikTok style)
 */

import React, { useRef, useState, useEffect, useCallback, ReactNode, memo } from 'react'

export interface VirtualListProps<T> {
  /** Items to render */
  items: T[]
  /** Height of each item (or function for variable heights) */
  itemHeight: number | ((item: T, index: number) => number)
  /** Render function for each item */
  renderItem: (item: T, index: number) => ReactNode
  /** Container height */
  height: number
  /** Number of items to render outside viewport */
  overscan?: number
  /** Key extractor */
  keyExtractor?: (item: T, index: number) => string | number
  /** Callback when reaching end */
  onEndReached?: () => void
  /** Threshold for triggering onEndReached (0-1) */
  onEndReachedThreshold?: number
  /** Loading state */
  isLoading?: boolean
  /** Loading component */
  loadingComponent?: ReactNode
  /** Empty state component */
  emptyComponent?: ReactNode
  /** Container className */
  className?: string
}

function VirtualListInner<T>({
  items,
  itemHeight,
  renderItem,
  height,
  overscan = 3,
  keyExtractor,
  onEndReached,
  onEndReachedThreshold = 0.8,
  isLoading,
  loadingComponent,
  emptyComponent,
  className,
}: VirtualListProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [scrollTop, setScrollTop] = useState(0)
  const endReachedRef = useRef(false)

  // Calculate item heights
  const getItemHeight = useCallback(
    (index: number): number => {
      if (typeof itemHeight === 'function') {
        return itemHeight(items[index], index)
      }
      return itemHeight
    },
    [itemHeight, items]
  )

  // Calculate item offsets
  const getItemOffset = useCallback(
    (index: number): number => {
      let offset = 0
      for (let i = 0; i < index; i++) {
        offset += getItemHeight(i)
      }
      return offset
    },
    [getItemHeight]
  )

  // Calculate total height
  const totalHeight = items.reduce((sum, _, index) => sum + getItemHeight(index), 0)

  // Calculate visible range
  const getVisibleRange = useCallback((): { start: number; end: number } => {
    let start = 0
    let offset = 0

    // Find start index
    for (let i = 0; i < items.length; i++) {
      const itemH = getItemHeight(i)
      if (offset + itemH > scrollTop) {
        start = i
        break
      }
      offset += itemH
    }

    // Find end index
    let end = start
    let visibleHeight = 0
    for (let i = start; i < items.length; i++) {
      visibleHeight += getItemHeight(i)
      end = i
      if (visibleHeight >= height) {
        break
      }
    }

    // Add overscan
    start = Math.max(0, start - overscan)
    end = Math.min(items.length - 1, end + overscan)

    return { start, end }
  }, [scrollTop, height, items.length, getItemHeight, overscan])

  const { start, end } = getVisibleRange()

  // Handle scroll
  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      const target = e.currentTarget
      setScrollTop(target.scrollTop)

      // Check if end reached
      if (onEndReached && !endReachedRef.current) {
        const scrollProgress =
          (target.scrollTop + target.clientHeight) / target.scrollHeight
        if (scrollProgress >= onEndReachedThreshold) {
          endReachedRef.current = true
          onEndReached()
        }
      }
    },
    [onEndReached, onEndReachedThreshold]
  )

  // Reset end reached when items change
  useEffect(() => {
    endReachedRef.current = false
  }, [items.length])

  // Empty state
  if (items.length === 0 && !isLoading) {
    return <>{emptyComponent}</> || null
  }

  // Render visible items
  const visibleItems = []
  for (let i = start; i <= end && i < items.length; i++) {
    const item = items[i]
    const key = keyExtractor ? keyExtractor(item, i) : i
    const top = getItemOffset(i)
    const itemH = getItemHeight(i)

    visibleItems.push(
      <div
        key={key}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: itemH,
          transform: `translateY(${top}px)`,
        }}
      >
        {renderItem(item, i)}
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        height,
        overflow: 'auto',
        position: 'relative',
      }}
      onScroll={handleScroll}
    >
      <div
        style={{
          height: totalHeight,
          position: 'relative',
        }}
      >
        {visibleItems}
      </div>
      {isLoading && loadingComponent}
    </div>
  )
}

export const VirtualList = memo(VirtualListInner) as typeof VirtualListInner

// ============================================
// Infinite Scroll Component
// ============================================

export interface InfiniteScrollProps<T> extends Omit<VirtualListProps<T>, 'height'> {
  /** Fetch more data */
  fetchMore: () => Promise<void>
  /** Has more data */
  hasMore: boolean
  /** Error state */
  error?: Error | null
  /** Retry function */
  onRetry?: () => void
}

export function InfiniteScroll<T>({
  fetchMore,
  hasMore,
  error,
  onRetry,
  isLoading,
  ...props
}: InfiniteScrollProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [containerHeight, setContainerHeight] = useState(400)

  useEffect(() => {
    if (containerRef.current) {
      const updateHeight = () => {
        setContainerHeight(window.innerHeight - containerRef.current!.offsetTop - 100)
      }
      updateHeight()
      window.addEventListener('resize', updateHeight)
      return () => window.removeEventListener('resize', updateHeight)
    }
  }, [])

  const handleEndReached = useCallback(async () => {
    if (hasMore && !isLoading && !error) {
      await fetchMore()
    }
  }, [hasMore, isLoading, error, fetchMore])

  return (
    <div ref={containerRef}>
      <VirtualList
        {...props}
        height={containerHeight}
        onEndReached={handleEndReached}
        isLoading={isLoading}
        loadingComponent={
          <div className="flex justify-center py-4">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-pingly-500 border-t-transparent" />
          </div>
        }
      />
      {error && (
        <div className="flex flex-col items-center py-4">
          <p className="mb-2 text-sm text-destructive">데이터를 불러오는데 실패했습니다</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="text-sm text-pingly-600 hover:text-pingly-700"
            >
              다시 시도
            </button>
          )}
        </div>
      )}
    </div>
  )
}
