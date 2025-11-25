'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const loadingStateVariants = cva(
  'flex flex-col items-center justify-center',
  {
    variants: {
      size: {
        sm: 'gap-2 py-4',
        default: 'gap-3 py-8',
        lg: 'gap-4 py-12',
        fullscreen: 'gap-4 min-h-screen',
      },
    },
    defaultVariants: {
      size: 'default',
    },
  }
)

// Spinner variants
const spinnerVariants = cva('animate-spin', {
  variants: {
    size: {
      sm: 'h-4 w-4',
      default: 'h-6 w-6',
      lg: 'h-8 w-8',
      fullscreen: 'h-10 w-10',
    },
    variant: {
      default: 'text-primary',
      muted: 'text-muted-foreground',
      white: 'text-white',
    },
  },
  defaultVariants: {
    size: 'default',
    variant: 'default',
  },
})

export interface LoadingStateProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof loadingStateVariants> {
  variant?: 'spinner' | 'dots' | 'pulse' | 'skeleton' | 'pingly'
  spinnerVariant?: 'default' | 'muted' | 'white'
  text?: string
  overlay?: boolean
}

// Animated dots loading
const DotsLoader: React.FC<{ size: 'sm' | 'default' | 'lg' | 'fullscreen' | null | undefined }> = ({ size }) => {
  const dotSize = size === 'sm' ? 'h-1.5 w-1.5' : size === 'lg' || size === 'fullscreen' ? 'h-3 w-3' : 'h-2 w-2'

  return (
    <div className="flex items-center gap-1">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className={cn('rounded-full bg-primary', dotSize)}
          animate={{
            y: [0, -8, 0],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            delay: i * 0.15,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  )
}

// Pulse loading
const PulseLoader: React.FC<{ size: 'sm' | 'default' | 'lg' | 'fullscreen' | null | undefined }> = ({ size }) => {
  const ringSize = size === 'sm' ? 'h-8 w-8' : size === 'lg' || size === 'fullscreen' ? 'h-16 w-16' : 'h-12 w-12'

  return (
    <div className="relative">
      <motion.div
        className={cn('rounded-full bg-primary/20', ringSize)}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.1, 0.3],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      <motion.div
        className={cn('absolute inset-0 rounded-full bg-primary/40', ringSize)}
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.5, 0.2, 0.5],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 0.2,
        }}
      />
      <motion.div
        className={cn(
          'absolute inset-0 m-auto rounded-full bg-primary',
          size === 'sm' ? 'h-3 w-3' : size === 'lg' || size === 'fullscreen' ? 'h-6 w-6' : 'h-4 w-4'
        )}
      />
    </div>
  )
}

// Pingly branded loader
const PinglyLoader: React.FC<{ size: 'sm' | 'default' | 'lg' | 'fullscreen' | null | undefined }> = ({ size }) => {
  const containerSize = size === 'sm' ? 'h-10 w-10' : size === 'lg' || size === 'fullscreen' ? 'h-20 w-20' : 'h-14 w-14'

  return (
    <div className={cn('relative', containerSize)}>
      {/* Outer ring */}
      <motion.div
        className="absolute inset-0 rounded-full border-2 border-pingly-200"
        style={{ borderTopColor: 'transparent' }}
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      />

      {/* Middle ring */}
      <motion.div
        className="absolute inset-2 rounded-full border-2 border-violet-200"
        style={{ borderRightColor: 'transparent' }}
        animate={{ rotate: -360 }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
      />

      {/* Center gradient dot */}
      <motion.div
        className="absolute inset-0 m-auto h-4 w-4 rounded-full bg-gradient-to-br from-pingly-500 to-violet-500"
        animate={{
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
    </div>
  )
}

// Skeleton loader
const SkeletonLoader: React.FC = () => (
  <div className="w-full max-w-sm space-y-3">
    <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
    <div className="h-4 w-full animate-pulse rounded bg-muted" />
    <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
  </div>
)

const LoadingState = React.forwardRef<HTMLDivElement, LoadingStateProps>(
  (
    {
      className,
      size,
      variant = 'spinner',
      spinnerVariant = 'default',
      text,
      overlay,
      ...props
    },
    ref
  ) => {
    const content = (
      <div
        ref={ref}
        className={cn(loadingStateVariants({ size }), className)}
        {...props}
      >
        {/* Loader based on variant */}
        {variant === 'spinner' && (
          <Loader2 className={cn(spinnerVariants({ size, variant: spinnerVariant }))} />
        )}
        {variant === 'dots' && <DotsLoader size={size} />}
        {variant === 'pulse' && <PulseLoader size={size} />}
        {variant === 'pingly' && <PinglyLoader size={size} />}
        {variant === 'skeleton' && <SkeletonLoader />}

        {/* Loading text */}
        {text && (
          <p className={cn(
            'text-muted-foreground',
            size === 'sm' && 'text-xs',
            size === 'lg' || size === 'fullscreen' ? 'text-base' : 'text-sm'
          )}>
            {text}
          </p>
        )}
      </div>
    )

    if (overlay) {
      return (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {content}
        </motion.div>
      )
    }

    return content
  }
)

LoadingState.displayName = 'LoadingState'

// Inline spinner for buttons etc.
interface SpinnerProps extends VariantProps<typeof spinnerVariants> {
  className?: string
}

const Spinner: React.FC<SpinnerProps> = ({ size, variant, className }) => (
  <Loader2 className={cn(spinnerVariants({ size, variant }), className)} />
)

export { LoadingState, Spinner }
