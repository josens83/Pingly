/**
 * Skip Link Component
 * Chapter 17: Accessibility - Keyboard Navigation
 *
 * Allows keyboard users to skip navigation and go directly to main content
 */

'use client'

import { cn } from '@/lib/utils'

interface SkipLinkProps {
  /** Target ID to skip to (without #) */
  targetId?: string
  /** Custom label */
  label?: string
  /** Additional CSS classes */
  className?: string
}

export function SkipLink({
  targetId = 'main-content',
  label = '본문으로 바로가기',
  className,
}: SkipLinkProps) {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    const target = document.getElementById(targetId)
    if (target) {
      target.focus()
      target.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <a
      href={`#${targetId}`}
      onClick={handleClick}
      className={cn(
        // Visually hidden by default
        'absolute -top-full left-0 z-[100]',
        // Show on focus
        'focus:top-0 focus:z-[100]',
        // Styling
        'bg-primary text-primary-foreground',
        'px-4 py-2 text-sm font-medium',
        'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
        'transition-all duration-200',
        className
      )}
    >
      {label}
    </a>
  )
}
