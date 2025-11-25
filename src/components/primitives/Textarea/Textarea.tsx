'use client'

import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertCircle, CheckCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

const textareaVariants = cva(
  `flex min-h-[80px] w-full rounded-lg border bg-background px-4 py-3
   text-sm placeholder:text-muted-foreground
   transition-all duration-200 ease-out
   focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1
   disabled:cursor-not-allowed disabled:opacity-50
   resize-y`,
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
      state: {
        default: '',
        error: 'border-destructive focus-visible:ring-destructive/30 focus-visible:border-destructive',
        success: 'border-mint-500 focus-visible:ring-mint-500/30 focus-visible:border-mint-500',
      },
    },
    defaultVariants: {
      variant: 'default',
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

export interface TextareaProps
  extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'size'>,
    VariantProps<typeof textareaVariants> {
  label?: string
  helperText?: string
  error?: string
  success?: string
  showCount?: boolean
  autoResize?: boolean
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      className,
      variant,
      label,
      helperText,
      error,
      success,
      required,
      disabled,
      id,
      maxLength,
      showCount,
      autoResize,
      value,
      defaultValue,
      onChange,
      ...props
    },
    ref
  ) => {
    const textareaId = id || React.useId()
    const [charCount, setCharCount] = React.useState(
      String(value || defaultValue || '').length
    )
    const textareaRef = React.useRef<HTMLTextAreaElement | null>(null)

    const state = error ? 'error' : success ? 'success' : 'default'

    // Auto-resize functionality
    const adjustHeight = React.useCallback(() => {
      const textarea = textareaRef.current
      if (textarea && autoResize) {
        textarea.style.height = 'auto'
        textarea.style.height = `${textarea.scrollHeight}px`
      }
    }, [autoResize])

    React.useEffect(() => {
      adjustHeight()
    }, [adjustHeight, value])

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setCharCount(e.target.value.length)
      if (autoResize) {
        adjustHeight()
      }
      onChange?.(e)
    }

    // Combine refs
    const combinedRef = React.useCallback(
      (node: HTMLTextAreaElement | null) => {
        textareaRef.current = node
        if (typeof ref === 'function') {
          ref(node)
        } else if (ref) {
          ref.current = node
        }
      },
      [ref]
    )

    return (
      <div className="w-full space-y-1.5">
        {/* Label */}
        {label && (
          <label
            htmlFor={textareaId}
            className={cn(labelVariants({ required }))}
          >
            {label}
          </label>
        )}

        {/* Textarea wrapper */}
        <div className="relative">
          <textarea
            ref={combinedRef}
            id={textareaId}
            disabled={disabled}
            required={required}
            maxLength={maxLength}
            value={value}
            defaultValue={defaultValue}
            onChange={handleChange}
            className={cn(
              textareaVariants({ variant, state }),
              showCount && 'pb-8',
              className
            )}
            aria-invalid={error ? 'true' : undefined}
            aria-describedby={
              error ? `${textareaId}-error` : helperText ? `${textareaId}-helper` : undefined
            }
            {...props}
          />

          {/* Status icon */}
          {state !== 'default' && (
            <div className="absolute right-3 top-3">
              {state === 'error' && (
                <AlertCircle className="h-4 w-4 text-destructive" />
              )}
              {state === 'success' && (
                <CheckCircle className="h-4 w-4 text-mint-500" />
              )}
            </div>
          )}

          {/* Character count */}
          {showCount && (
            <div className="absolute bottom-2 right-3 text-xs text-muted-foreground">
              {charCount}
              {maxLength && `/${maxLength}`}
            </div>
          )}
        </div>

        {/* Helper/Error text */}
        <AnimatePresence mode="wait">
          {(error || success || helperText) && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
              id={error ? `${textareaId}-error` : `${textareaId}-helper`}
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

Textarea.displayName = 'Textarea'

export { Textarea, textareaVariants }
