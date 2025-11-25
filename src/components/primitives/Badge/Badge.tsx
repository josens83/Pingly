'use client'

import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  `inline-flex items-center gap-1.5 font-medium transition-all duration-200
   border rounded-full`,
  {
    variants: {
      variant: {
        default: 'bg-primary/10 text-primary border-primary/20 hover:bg-primary/20',
        secondary: 'bg-secondary text-secondary-foreground border-transparent',
        outline: 'bg-transparent border-border text-foreground hover:bg-accent',
        success: 'bg-mint-500/10 text-mint-600 border-mint-500/20 hover:bg-mint-500/20',
        warning: 'bg-amber-500/10 text-amber-600 border-amber-500/20 hover:bg-amber-500/20',
        destructive: 'bg-rose-500/10 text-rose-600 border-rose-500/20 hover:bg-rose-500/20',
        info: 'bg-sky-500/10 text-sky-600 border-sky-500/20 hover:bg-sky-500/20',
        // Pingly branded
        pingly: 'bg-gradient-to-r from-pingly-500/10 to-violet-500/10 text-pingly-600 border-pingly-500/20',
        // Gradient filled
        gradient: `
          bg-gradient-to-r from-pingly-500 to-violet-500
          text-white border-transparent
          shadow-sm
        `,
        // Status indicators
        active: 'bg-mint-500 text-white border-transparent',
        inactive: 'bg-muted text-muted-foreground border-transparent',
        pending: 'bg-amber-500 text-white border-transparent',
      },
      size: {
        sm: 'px-2 py-0.5 text-xs',
        default: 'px-2.5 py-1 text-xs',
        lg: 'px-3 py-1.5 text-sm',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

// Dot indicator variants
const dotVariants = cva('rounded-full', {
  variants: {
    status: {
      default: 'bg-current',
      online: 'bg-mint-500',
      offline: 'bg-muted-foreground',
      busy: 'bg-rose-500',
      away: 'bg-amber-500',
    },
    size: {
      sm: 'h-1.5 w-1.5',
      default: 'h-2 w-2',
      lg: 'h-2.5 w-2.5',
    },
    pulse: {
      true: 'animate-pulse',
    },
  },
  defaultVariants: {
    status: 'default',
    size: 'default',
  },
})

export interface BadgeProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onAnimationStart' | 'onAnimationEnd' | 'onDrag' | 'onDragStart' | 'onDragEnd'>,
    VariantProps<typeof badgeVariants> {
  removable?: boolean
  onRemove?: () => void
  dot?: boolean
  dotStatus?: 'default' | 'online' | 'offline' | 'busy' | 'away'
  dotPulse?: boolean
  icon?: React.ReactNode
}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  (
    {
      className,
      variant,
      size,
      removable,
      onRemove,
      dot,
      dotStatus = 'default',
      dotPulse,
      icon,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <motion.div
        ref={ref}
        className={cn(badgeVariants({ variant, size }), className)}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        transition={{ duration: 0.15 }}
        {...props}
      >
        {/* Status dot */}
        {dot && (
          <span
            className={cn(
              dotVariants({ status: dotStatus, size, pulse: dotPulse })
            )}
          />
        )}

        {/* Icon */}
        {icon && <span className="shrink-0">{icon}</span>}

        {/* Content */}
        <span>{children}</span>

        {/* Remove button */}
        {removable && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onRemove?.()
            }}
            className={cn(
              'ml-0.5 rounded-full p-0.5 transition-colors',
              'hover:bg-black/10 dark:hover:bg-white/10',
              'focus:outline-none focus:ring-1 focus:ring-current'
            )}
            aria-label="Remove"
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </motion.div>
    )
  }
)

Badge.displayName = 'Badge'

// Badge Group for managing multiple badges
interface BadgeGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  max?: number
  onOverflowClick?: () => void
}

const BadgeGroup = React.forwardRef<HTMLDivElement, BadgeGroupProps>(
  ({ children, max, onOverflowClick, className, ...props }, ref) => {
    const childArray = React.Children.toArray(children)
    const visibleChildren = max ? childArray.slice(0, max) : childArray
    const overflowCount = max ? childArray.length - max : 0

    return (
      <div
        ref={ref}
        className={cn('flex flex-wrap items-center gap-2', className)}
        {...props}
      >
        <AnimatePresence>
          {visibleChildren.map((child, index) => (
            <React.Fragment key={index}>{child}</React.Fragment>
          ))}
        </AnimatePresence>

        {overflowCount > 0 && (
          <Badge
            variant="secondary"
            className="cursor-pointer"
            onClick={onOverflowClick}
          >
            +{overflowCount}
          </Badge>
        )}
      </div>
    )
  }
)

BadgeGroup.displayName = 'BadgeGroup'

// Count Badge - 숫자 표시용
interface CountBadgeProps extends VariantProps<typeof badgeVariants> {
  count: number
  max?: number
  showZero?: boolean
  className?: string
}

const CountBadge = React.forwardRef<HTMLDivElement, CountBadgeProps>(
  ({ count, max = 99, showZero = false, variant = 'destructive', size = 'sm', className }, ref) => {
    if (count === 0 && !showZero) return null

    const displayCount = count > max ? `${max}+` : count

    return (
      <Badge
        ref={ref}
        variant={variant}
        size={size}
        className={cn('min-w-[1.25rem] justify-center px-1.5', className)}
      >
        {displayCount}
      </Badge>
    )
  }
)

CountBadge.displayName = 'CountBadge'

export { Badge, BadgeGroup, CountBadge, badgeVariants }
