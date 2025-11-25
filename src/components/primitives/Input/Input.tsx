'use client'

import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertCircle, CheckCircle, Eye, EyeOff } from 'lucide-react'
import { cn } from '@/lib/utils'

const inputVariants = cva(
  `flex w-full rounded-lg border bg-background px-4 py-2.5
   text-sm placeholder:text-muted-foreground
   transition-all duration-200 ease-out
   focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1
   disabled:cursor-not-allowed disabled:opacity-50`,
  {
    variants: {
      variant: {
        default: `
          border-input
          hover:border-primary/50
          focus-visible:border-primary
        `,
        filled: `
          border-transparent bg-muted
          hover:bg-muted/80
          focus-visible:bg-background focus-visible:border-primary
        `,
        flushed: `
          rounded-none border-x-0 border-t-0 px-0
          focus-visible:ring-0 focus-visible:ring-offset-0
          focus-visible:border-b-2 focus-visible:border-primary
        `,
      },
      inputSize: {
        sm: 'h-9 text-xs',
        default: 'h-11',
        lg: 'h-12 text-base',
      },
      state: {
        default: '',
        error: 'border-destructive focus-visible:ring-destructive/30 focus-visible:border-destructive',
        success: 'border-mint-500 focus-visible:ring-mint-500/30 focus-visible:border-mint-500',
      },
    },
    defaultVariants: {
      variant: 'default',
      inputSize: 'default',
      state: 'default',
    },
  }
)

const labelVariants = cva(
  'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
  {
    variants: {
      required: {
        true: "after:content-['*'] after:ml-0.5 after:text-destructive",
      },
    },
  }
)

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof inputVariants> {
  label?: string
  helperText?: string
  error?: string
  success?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  showPasswordToggle?: boolean
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type = 'text',
      variant,
      inputSize,
      label,
      helperText,
      error,
      success,
      leftIcon,
      rightIcon,
      showPasswordToggle,
      required,
      disabled,
      id,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = React.useState(false)
    const inputId = id || React.useId()

    const state = error ? 'error' : success ? 'success' : 'default'
    const inputType = type === 'password' && showPassword ? 'text' : type

    return (
      <div className="w-full space-y-1.5">
        {/* Label */}
        {label && (
          <label
            htmlFor={inputId}
            className={cn(labelVariants({ required }))}
          >
            {label}
          </label>
        )}

        {/* Input wrapper */}
        <div className="relative">
          {/* Left icon */}
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {leftIcon}
            </div>
          )}

          {/* Input */}
          <input
            ref={ref}
            id={inputId}
            type={inputType}
            disabled={disabled}
            required={required}
            className={cn(
              inputVariants({ variant, inputSize, state }),
              leftIcon && 'pl-10',
              (rightIcon || showPasswordToggle || state !== 'default') && 'pr-10',
              className
            )}
            aria-invalid={error ? 'true' : undefined}
            aria-describedby={
              error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined
            }
            {...props}
          />

          {/* Right side icons */}
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
            {/* Status icon */}
            {state === 'error' && (
              <AlertCircle className="h-4 w-4 text-destructive" />
            )}
            {state === 'success' && (
              <CheckCircle className="h-4 w-4 text-mint-500" />
            )}

            {/* Custom right icon */}
            {rightIcon && state === 'default' && (
              <span className="text-muted-foreground">{rightIcon}</span>
            )}

            {/* Password toggle */}
            {type === 'password' && showPasswordToggle && (
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-muted-foreground hover:text-foreground transition-colors focus:outline-none"
                tabIndex={-1}
                aria-label={showPassword ? '비밀번호 숨기기' : '비밀번호 보기'}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            )}
          </div>
        </div>

        {/* Helper/Error text */}
        <AnimatePresence mode="wait">
          {(error || success || helperText) && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
              id={error ? `${inputId}-error` : `${inputId}-helper`}
              className={cn(
                'text-xs',
                error && 'text-destructive',
                success && 'text-mint-600',
                !error && !success && 'text-muted-foreground'
              )}
              role={error ? 'alert' : undefined}
            >
              {error || success || helperText}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    )
  }
)

Input.displayName = 'Input'

export { Input, inputVariants }
