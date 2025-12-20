/**
 * Visually Hidden Component
 * Chapter 17: Accessibility - Screen Reader Support
 *
 * Hides content visually but keeps it accessible to screen readers
 */

import { cn } from '@/lib/utils'

interface VisuallyHiddenProps {
  children: React.ReactNode
  /** Render as a specific element */
  as?: keyof JSX.IntrinsicElements
  /** Additional CSS classes */
  className?: string
}

export function VisuallyHidden({
  children,
  as: Component = 'span',
  className,
}: VisuallyHiddenProps) {
  return (
    <Component
      className={cn(
        // Standard visually hidden styles
        'absolute',
        'w-px h-px',
        'p-0 m-[-1px]',
        'overflow-hidden',
        'whitespace-nowrap',
        'border-0',
        '[clip:rect(0,0,0,0)]',
        className
      )}
    >
      {children}
    </Component>
  )
}

// Convenience wrapper for labels
export function ScreenReaderOnly({ children }: { children: React.ReactNode }) {
  return <VisuallyHidden>{children}</VisuallyHidden>
}
