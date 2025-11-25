'use client'

import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { motion, HTMLMotionProps } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  // Base styles
  `inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium
   transition-all duration-200 ease-out
   focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
   disabled:pointer-events-none disabled:opacity-50
   active:scale-[0.98]`,
  {
    variants: {
      variant: {
        // Primary - Gradient with glow
        default: `
          bg-gradient-to-r from-pingly-500 to-pingly-600
          text-white shadow-md
          hover:from-pingly-600 hover:to-pingly-700 hover:shadow-primary
          active:from-pingly-700 active:to-pingly-800
        `,
        // Secondary - Subtle background
        secondary: `
          bg-secondary text-secondary-foreground
          hover:bg-secondary/80 hover:shadow-sm
          border border-transparent hover:border-border
        `,
        // Outline - Bordered
        outline: `
          border-2 border-border bg-transparent
          hover:bg-accent hover:border-primary/50 hover:text-accent-foreground
        `,
        // Ghost - Minimal
        ghost: `
          bg-transparent
          hover:bg-accent hover:text-accent-foreground
        `,
        // Destructive
        destructive: `
          bg-gradient-to-r from-rose-500 to-rose-600
          text-white shadow-md
          hover:from-rose-600 hover:to-rose-700 hover:shadow-error
        `,
        // Success
        success: `
          bg-gradient-to-r from-mint-500 to-mint-600
          text-white shadow-md
          hover:from-mint-600 hover:to-mint-700 hover:shadow-success
        `,
        // Link style
        link: `
          text-primary underline-offset-4
          hover:underline hover:text-primary/80
          p-0 h-auto
        `,
        // Premium - Special gradient
        premium: `
          bg-gradient-to-r from-pingly-500 via-violet-500 to-pink-500
          text-white shadow-lg
          hover:shadow-xl hover:scale-[1.02]
          transition-transform
        `,
      },
      size: {
        sm: 'h-8 px-3 text-xs rounded-md',
        default: 'h-10 px-4 py-2 rounded-lg',
        lg: 'h-12 px-6 text-base rounded-lg',
        xl: 'h-14 px-8 text-lg rounded-xl',
        icon: 'h-10 w-10 rounded-lg',
        'icon-sm': 'h-8 w-8 rounded-md',
        'icon-lg': 'h-12 w-12 rounded-lg',
      },
      fullWidth: {
        true: 'w-full',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

// Motion variants for animation
const buttonMotion = {
  tap: { scale: 0.98 },
  hover: { scale: 1.02 },
}

export interface ButtonProps
  extends Omit<HTMLMotionProps<'button'>, 'size'>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean
  loadingText?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      fullWidth,
      isLoading = false,
      loadingText,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || isLoading

    return (
      <motion.button
        ref={ref}
        className={cn(buttonVariants({ variant, size, fullWidth, className }))}
        disabled={isDisabled}
        whileTap={isDisabled ? undefined : buttonMotion.tap}
        whileHover={isDisabled ? undefined : (variant === 'premium' ? buttonMotion.hover : undefined)}
        {...props}
      >
        {/* Loading spinner */}
        {isLoading && (
          <Loader2 className="h-4 w-4 animate-spin" />
        )}

        {/* Left icon */}
        {!isLoading && leftIcon && (
          <span className="shrink-0">{leftIcon}</span>
        )}

        {/* Content */}
        {isLoading && loadingText ? loadingText : children}

        {/* Right icon */}
        {!isLoading && rightIcon && (
          <span className="shrink-0">{rightIcon}</span>
        )}
      </motion.button>
    )
  }
)

Button.displayName = 'Button'

// Icon-only button variant
export interface IconButtonProps extends Omit<ButtonProps, 'leftIcon' | 'rightIcon' | 'loadingText'> {
  icon: React.ReactNode
  'aria-label': string
}

const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ icon, size = 'icon', className, ...props }, ref) => {
    return (
      <Button
        ref={ref}
        size={size}
        className={cn('p-0', className)}
        {...props}
      >
        {icon}
      </Button>
    )
  }
)

IconButton.displayName = 'IconButton'

export { Button, IconButton, buttonVariants }
