/**
 * Accessibility Utilities
 * WCAG 2.1 AA Compliance
 */

// ============================================
// Focus Management
// ============================================

/**
 * Trap focus within a container
 */
export function trapFocus(container: HTMLElement): () => void {
  const focusableElements = container.querySelectorAll<HTMLElement>(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
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

  container.addEventListener('keydown', handleKeyDown)
  firstElement?.focus()

  return () => container.removeEventListener('keydown', handleKeyDown)
}

/**
 * Return focus to trigger element
 */
export function returnFocus(triggerElement: HTMLElement | null): void {
  if (triggerElement && typeof triggerElement.focus === 'function') {
    triggerElement.focus()
  }
}

// ============================================
// Announcements
// ============================================

let announceElement: HTMLElement | null = null

/**
 * Announce message to screen readers
 */
export function announce(message: string, priority: 'polite' | 'assertive' = 'polite'): void {
  if (typeof document === 'undefined') return

  if (!announceElement) {
    announceElement = document.createElement('div')
    announceElement.setAttribute('aria-live', priority)
    announceElement.setAttribute('aria-atomic', 'true')
    announceElement.className = 'sr-only'
    document.body.appendChild(announceElement)
  }

  announceElement.setAttribute('aria-live', priority)
  announceElement.textContent = ''

  // Force reflow
  void announceElement.offsetHeight

  announceElement.textContent = message
}

// ============================================
// Color Contrast
// ============================================

/**
 * Calculate relative luminance
 */
function getLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    c = c / 255
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  })
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
}

/**
 * Calculate contrast ratio between two colors
 */
export function getContrastRatio(
  color1: { r: number; g: number; b: number },
  color2: { r: number; g: number; b: number }
): number {
  const l1 = getLuminance(color1.r, color1.g, color1.b)
  const l2 = getLuminance(color2.r, color2.g, color2.b)
  const lighter = Math.max(l1, l2)
  const darker = Math.min(l1, l2)
  return (lighter + 0.05) / (darker + 0.05)
}

/**
 * Check if contrast meets WCAG requirements
 */
export function meetsContrastRequirements(
  contrastRatio: number,
  level: 'AA' | 'AAA' = 'AA',
  isLargeText: boolean = false
): boolean {
  if (level === 'AAA') {
    return isLargeText ? contrastRatio >= 4.5 : contrastRatio >= 7
  }
  return isLargeText ? contrastRatio >= 3 : contrastRatio >= 4.5
}

// ============================================
// Keyboard Navigation
// ============================================

/**
 * Handle arrow key navigation in a list
 */
export function handleArrowNavigation(
  e: KeyboardEvent,
  items: HTMLElement[],
  currentIndex: number,
  options: { wrap?: boolean; vertical?: boolean } = {}
): number {
  const { wrap = true, vertical = true } = options
  const prevKey = vertical ? 'ArrowUp' : 'ArrowLeft'
  const nextKey = vertical ? 'ArrowDown' : 'ArrowRight'

  let newIndex = currentIndex

  if (e.key === prevKey) {
    e.preventDefault()
    newIndex = currentIndex - 1
    if (newIndex < 0) {
      newIndex = wrap ? items.length - 1 : 0
    }
  } else if (e.key === nextKey) {
    e.preventDefault()
    newIndex = currentIndex + 1
    if (newIndex >= items.length) {
      newIndex = wrap ? 0 : items.length - 1
    }
  } else if (e.key === 'Home') {
    e.preventDefault()
    newIndex = 0
  } else if (e.key === 'End') {
    e.preventDefault()
    newIndex = items.length - 1
  }

  if (newIndex !== currentIndex) {
    items[newIndex]?.focus()
  }

  return newIndex
}

// ============================================
// Reduced Motion
// ============================================

/**
 * Check if user prefers reduced motion
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/**
 * Get safe animation duration
 */
export function getSafeAnimationDuration(normalDuration: number): number {
  return prefersReducedMotion() ? 0 : normalDuration
}

// ============================================
// Skip Links
// ============================================

/**
 * Create skip link handler
 */
export function handleSkipLink(targetId: string): void {
  const target = document.getElementById(targetId)
  if (target) {
    target.tabIndex = -1
    target.focus()
    target.scrollIntoView()
  }
}

// ============================================
// Form Accessibility
// ============================================

/**
 * Generate unique ID for form elements
 */
export function generateFieldId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).substring(2, 9)}`
}

/**
 * Get error message ID for aria-describedby
 */
export function getErrorId(fieldId: string): string {
  return `${fieldId}-error`
}

/**
 * Get help text ID for aria-describedby
 */
export function getHelpId(fieldId: string): string {
  return `${fieldId}-help`
}
