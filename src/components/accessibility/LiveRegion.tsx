/**
 * Live Region Component
 * Chapter 17: Accessibility - ARIA Live Regions
 *
 * Announces dynamic content changes to screen readers
 */

'use client'

import { useState, useEffect, useCallback } from 'react'

import { VisuallyHidden } from './VisuallyHidden'

type Politeness = 'polite' | 'assertive' | 'off'

interface LiveRegionProps {
  /** The message to announce */
  message: string
  /** Politeness level for the announcement */
  politeness?: Politeness
  /** Whether to announce immediately on mount */
  announceOnMount?: boolean
  /** Delay before announcement (ms) */
  delay?: number
  /** ID for the region */
  id?: string
}

export function LiveRegion({
  message,
  politeness = 'polite',
  announceOnMount = false,
  delay = 100,
  id,
}: LiveRegionProps) {
  const [announcement, setAnnouncement] = useState('')

  useEffect(() => {
    if (!message) return

    // Clear first to ensure re-announcement
    setAnnouncement('')

    const timer = setTimeout(() => {
      setAnnouncement(message)
    }, delay)

    return () => {
      clearTimeout(timer)
    }
  }, [message, delay])

  // Don't render if no message and not on mount
  if (!announceOnMount && !message) {
    return null
  }

  return (
    <VisuallyHidden>
      <div
        id={id}
        role="status"
        aria-live={politeness}
        aria-atomic="true"
      >
        {announcement}
      </div>
    </VisuallyHidden>
  )
}

/**
 * Hook for programmatic announcements
 */
export function useAnnounce() {
  const [message, setMessage] = useState('')
  const [politeness, setPoliteness] = useState<Politeness>('polite')

  const announce = useCallback((text: string, level: Politeness = 'polite') => {
    setPoliteness(level)
    // Clear first to force re-announcement of same text
    setMessage('')
    requestAnimationFrame(() => {
      setMessage(text)
    })
  }, [])

  const clear = useCallback(() => {
    setMessage('')
  }, [])

  return {
    message,
    politeness,
    announce,
    clear,
    // Component to render
    Announcer: () => <LiveRegion message={message} politeness={politeness} />,
  }
}

/**
 * Announce loading states
 */
interface LoadingAnnouncerProps {
  isLoading: boolean
  loadingMessage?: string
  loadedMessage?: string
}

export function LoadingAnnouncer({
  isLoading,
  loadingMessage = '로딩 중입니다',
  loadedMessage = '로딩이 완료되었습니다',
}: LoadingAnnouncerProps) {
  const [hasLoaded, setHasLoaded] = useState(false)

  useEffect(() => {
    if (!isLoading && hasLoaded) {
      // Was loading, now done
    }
    setHasLoaded(!isLoading)
  }, [isLoading, hasLoaded])

  return (
    <LiveRegion
      message={isLoading ? loadingMessage : hasLoaded ? loadedMessage : ''}
      politeness="polite"
    />
  )
}
