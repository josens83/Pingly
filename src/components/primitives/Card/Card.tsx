'use client'

import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { motion, HTMLMotionProps } from 'framer-motion'
import { cn } from '@/lib/utils'

const cardVariants = cva(
  'rounded-xl bg-card text-card-foreground transition-all duration-300',
  {
    variants: {
      variant: {
        default: 'border shadow-sm',
        elevated: 'shadow-lg',
        outlined: 'border-2 border-border',
        filled: 'bg-muted border-0',
        ghost: 'bg-transparent border-0 shadow-none',
        // Pingly signature - gradient subtle background
        gradient: 'border bg-gradient-card shadow-sm',
        // Glass effect
        glass: 'glass border-0',
        // Feature card with highlight
        feature: `
          border border-transparent bg-gradient-card
          hover:border-primary/20 hover:shadow-card-hover
        `,
      },
      interactive: {
        true: 'cursor-pointer',
        false: '',
      },
      padding: {
        none: '',
        sm: 'p-4',
        default: 'p-6',
        lg: 'p-8',
      },
    },
    compoundVariants: [
      {
        interactive: true,
        className: 'hover:-translate-y-1 hover:shadow-card-hover active:translate-y-0',
      },
    ],
    defaultVariants: {
      variant: 'default',
      interactive: false,
      padding: 'none',
    },
  }
)

// Motion variants for interactive cards
const cardMotion = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 10 },
  hover: { y: -4, transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] } },
  tap: { y: 0, transition: { duration: 0.1 } },
}

export interface CardProps
  extends Omit<HTMLMotionProps<'div'>, 'padding' | 'children'>,
    VariantProps<typeof cardVariants> {
  asChild?: boolean
  animateOnMount?: boolean
  children?: React.ReactNode
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, interactive, padding, animateOnMount = false, children, ...props }, ref) => {
    const Component = animateOnMount ? motion.div : 'div'

    const motionProps = animateOnMount
      ? {
          initial: cardMotion.initial,
          animate: cardMotion.animate,
          exit: cardMotion.exit,
          transition: { duration: 0.3 },
        }
      : {}

    const interactiveProps = interactive
      ? {
          whileHover: cardMotion.hover,
          whileTap: cardMotion.tap,
        }
      : {}

    if (animateOnMount || interactive) {
      return (
        <motion.div
          ref={ref}
          className={cn(cardVariants({ variant, interactive, padding }), className)}
          {...motionProps}
          {...interactiveProps}
          {...props}
        >
          {children}
        </motion.div>
      )
    }

    return (
      <div
        ref={ref as React.Ref<HTMLDivElement>}
        className={cn(cardVariants({ variant, interactive, padding }), className)}
        {...(props as React.HTMLAttributes<HTMLDivElement>)}
      >
        {children}
      </div>
    )
  }
)
Card.displayName = 'Card'

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex flex-col space-y-1.5 p-6', className)}
    {...props}
  />
))
CardHeader.displayName = 'CardHeader'

const CardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement> & { as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' }
>(({ className, as: Component = 'h3', ...props }, ref) => (
  <Component
    ref={ref}
    className={cn('text-xl font-semibold leading-none tracking-tight', className)}
    {...props}
  />
))
CardTitle.displayName = 'CardTitle'

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('text-sm text-muted-foreground', className)}
    {...props}
  />
))
CardDescription.displayName = 'CardDescription'

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('p-6 pt-0', className)} {...props} />
))
CardContent.displayName = 'CardContent'

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex items-center p-6 pt-0', className)}
    {...props}
  />
))
CardFooter.displayName = 'CardFooter'

// Metric Card - 통계 표시용 특화 카드
export interface MetricCardProps {
  title: string
  value: string | number
  change?: {
    value: string | number
    type: 'positive' | 'negative' | 'neutral'
  }
  icon?: React.ReactNode
  trend?: React.ReactNode
  className?: string
}

const MetricCard = React.forwardRef<HTMLDivElement, MetricCardProps>(
  ({ className, title, value, change, icon, trend }, ref) => (
    <Card ref={ref} variant="gradient" className={cn('p-6', className)}>
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold tracking-tight">{value}</p>
          {change && (
            <p
              className={cn(
                'text-xs font-medium flex items-center gap-1',
                change.type === 'positive' && 'text-mint-600',
                change.type === 'negative' && 'text-rose-600',
                change.type === 'neutral' && 'text-muted-foreground'
              )}
            >
              {trend}
              {change.value}
            </p>
          )}
        </div>
        {icon && (
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            {icon}
          </div>
        )}
      </div>
    </Card>
  )
)
MetricCard.displayName = 'MetricCard'

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
  MetricCard,
  cardVariants,
}
