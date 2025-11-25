'use client'

import { forwardRef, useEffect, useRef, ReactNode } from 'react'
import { cn } from '@/lib/utils'

/**
 * VisuallyHidden - Hides content visually but keeps it accessible to screen readers
 */
export const VisuallyHidden = forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement>
>(({ className, ...props }, ref) => {
  return (
    <span
      ref={ref}
      className={cn(
        'absolute w-px h-px p-0 -m-px overflow-hidden whitespace-nowrap border-0',
        '[clip:rect(0,0,0,0)]',
        className
      )}
      {...props}
    />
  )
})
VisuallyHidden.displayName = 'VisuallyHidden'

/**
 * SkipLink - Allows keyboard users to skip to main content
 */
export function SkipLink({
  href = '#main-content',
  children = '본문으로 건너뛰기',
}: {
  href?: string
  children?: ReactNode
}) {
  return (
    <a
      href={href}
      className={cn(
        'fixed top-4 left-4 z-[100] px-4 py-2 rounded-lg',
        'bg-pingly-600 text-white font-medium text-sm',
        'transform -translate-y-full opacity-0',
        'focus:translate-y-0 focus:opacity-100',
        'transition-all duration-200',
        'focus:outline-none focus:ring-2 focus:ring-pingly-500 focus:ring-offset-2'
      )}
    >
      {children}
    </a>
  )
}

/**
 * FocusTrap - Traps focus within a container (useful for modals)
 */
interface FocusTrapProps {
  children: ReactNode
  active?: boolean
  className?: string
}

export function FocusTrap({ children, active = true, className }: FocusTrapProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!active) return

    const container = containerRef.current
    if (!container) return

    const focusableElements = container.querySelectorAll<HTMLElement>(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )

    const firstElement = focusableElements[0]
    const lastElement = focusableElements[focusableElements.length - 1]

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault()
          lastElement?.focus()
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault()
          firstElement?.focus()
        }
      }
    }

    // Focus first element on mount
    firstElement?.focus()

    container.addEventListener('keydown', handleKeyDown)
    return () => container.removeEventListener('keydown', handleKeyDown)
  }, [active])

  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  )
}

/**
 * LiveRegion - Announces dynamic content changes to screen readers
 */
export function LiveRegion({
  children,
  'aria-live': ariaLive = 'polite',
  'aria-atomic': ariaAtomic = true,
  className,
}: {
  children: ReactNode
  'aria-live'?: 'polite' | 'assertive' | 'off'
  'aria-atomic'?: boolean
  className?: string
}) {
  return (
    <div
      role="status"
      aria-live={ariaLive}
      aria-atomic={ariaAtomic}
      className={cn('sr-only', className)}
    >
      {children}
    </div>
  )
}

/**
 * Announcer - A global announcer for dynamic content
 */
let announceCallback: ((message: string) => void) | null = null

export function announce(message: string) {
  announceCallback?.(message)
}

export function Announcer() {
  const [message, setMessage] = useState('')

  useEffect(() => {
    announceCallback = setMessage
    return () => {
      announceCallback = null
    }
  }, [])

  return <LiveRegion aria-live="assertive">{message}</LiveRegion>
}

import { useState } from 'react'

/**
 * useReducedMotion - Hook to detect reduced motion preference
 */
export function useReducedMotion() {
  const [reducedMotion, setReducedMotion] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReducedMotion(mediaQuery.matches)

    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches)
    mediaQuery.addEventListener('change', handler)
    return () => mediaQuery.removeEventListener('change', handler)
  }, [])

  return reducedMotion
}

/**
 * useFocusReturn - Returns focus to the previously focused element
 */
export function useFocusReturn(isOpen: boolean) {
  const previousFocusRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement as HTMLElement
    } else {
      previousFocusRef.current?.focus()
    }
  }, [isOpen])
}

/**
 * KeyboardShortcut - Displays keyboard shortcut hints
 */
export function KeyboardShortcut({
  keys,
  className,
}: {
  keys: string[]
  className?: string
}) {
  return (
    <span className={cn('inline-flex items-center gap-0.5', className)}>
      {keys.map((key, i) => (
        <kbd
          key={i}
          className={cn(
            'inline-flex items-center justify-center px-1.5 py-0.5',
            'min-w-[1.25rem] h-5 rounded border',
            'bg-muted text-muted-foreground',
            'font-mono text-[10px] font-medium'
          )}
        >
          {key}
        </kbd>
      ))}
    </span>
  )
}

/**
 * Focus visible ring styles - can be used as a class
 */
export const focusRingClass = cn(
  'focus:outline-none',
  'focus-visible:ring-2 focus-visible:ring-pingly-500 focus-visible:ring-offset-2',
  'focus-visible:ring-offset-background'
)

/**
 * A11yProgress - Accessible progress indicator with announcements
 */
interface A11yProgressProps {
  value: number
  max?: number
  label: string
  showValue?: boolean
  className?: string
}

export function A11yProgress({
  value,
  max = 100,
  label,
  showValue = true,
  className,
}: A11yProgressProps) {
  const percentage = Math.round((value / max) * 100)

  return (
    <div className={cn('space-y-1', className)}>
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        {showValue && (
          <span className="font-medium tabular-nums">{percentage}%</span>
        )}
      </div>
      <div
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={`${label}: ${percentage}%`}
        className="h-2 w-full rounded-full bg-muted overflow-hidden"
      >
        <div
          className="h-full bg-gradient-to-r from-pingly-500 to-violet-500 rounded-full transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}
