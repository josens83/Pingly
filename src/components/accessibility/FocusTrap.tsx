/**
 * Focus Trap Component
 * Chapter 17: Accessibility - Focus Management
 *
 * Traps focus within a container (useful for modals, dialogs)
 */

'use client'

import { useRef, useEffect, useCallback } from 'react'

interface FocusTrapProps {
  children: React.ReactNode
  /** Whether the trap is active */
  active?: boolean
  /** Element to focus when trap activates */
  initialFocus?: React.RefObject<HTMLElement>
  /** Element to focus when trap deactivates */
  returnFocus?: React.RefObject<HTMLElement>
  /** Allow escape key to deactivate trap */
  allowEscape?: boolean
  /** Callback when escape is pressed */
  onEscape?: () => void
}

const FOCUSABLE_SELECTORS = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'textarea:not([disabled])',
  'select:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
  'audio[controls]',
  'video[controls]',
  '[contenteditable]:not([contenteditable="false"])',
].join(', ')

export function FocusTrap({
  children,
  active = true,
  initialFocus,
  returnFocus,
  allowEscape = true,
  onEscape,
}: FocusTrapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const previousActiveElement = useRef<Element | null>(null)

  // Get all focusable elements within container
  const getFocusableElements = useCallback(() => {
    if (!containerRef.current) return []
    return Array.from(
      containerRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTORS)
    ).filter((el) => el.offsetParent !== null) // Only visible elements
  }, [])

  // Handle tab key navigation
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!active) return

      if (e.key === 'Escape' && allowEscape) {
        onEscape?.()
        return
      }

      if (e.key !== 'Tab') return

      const focusableElements = getFocusableElements()
      if (focusableElements.length === 0) return

      const firstElement = focusableElements[0]
      const lastElement = focusableElements[focusableElements.length - 1]

      // Shift+Tab on first element -> go to last
      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault()
        lastElement.focus()
        return
      }

      // Tab on last element -> go to first
      if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault()
        firstElement.focus()
        return
      }
    },
    [active, allowEscape, getFocusableElements, onEscape]
  )

  // Setup focus trap
  useEffect(() => {
    if (!active) return

    // Store current active element
    previousActiveElement.current = document.activeElement

    // Focus initial element or first focusable
    const focusTarget = initialFocus?.current || getFocusableElements()[0]
    if (focusTarget) {
      focusTarget.focus()
    }

    // Add event listener
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)

      // Return focus
      const returnTarget = returnFocus?.current || previousActiveElement.current
      if (returnTarget && returnTarget instanceof HTMLElement) {
        returnTarget.focus()
      }
    }
  }, [active, initialFocus, returnFocus, getFocusableElements, handleKeyDown])

  return (
    <div ref={containerRef} role="presentation">
      {children}
    </div>
  )
}

/**
 * Hook for managing focus within a component
 */
export function useFocusManagement() {
  const containerRef = useRef<HTMLDivElement>(null)

  const focusFirst = useCallback(() => {
    if (!containerRef.current) return
    const focusable = containerRef.current.querySelector<HTMLElement>(
      FOCUSABLE_SELECTORS
    )
    focusable?.focus()
  }, [])

  const focusLast = useCallback(() => {
    if (!containerRef.current) return
    const focusables = containerRef.current.querySelectorAll<HTMLElement>(
      FOCUSABLE_SELECTORS
    )
    const last = focusables[focusables.length - 1]
    last?.focus()
  }, [])

  const focusByIndex = useCallback((index: number) => {
    if (!containerRef.current) return
    const focusables = containerRef.current.querySelectorAll<HTMLElement>(
      FOCUSABLE_SELECTORS
    )
    const element = focusables[index]
    element?.focus()
  }, [])

  return {
    containerRef,
    focusFirst,
    focusLast,
    focusByIndex,
  }
}
