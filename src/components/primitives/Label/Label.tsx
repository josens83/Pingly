'use client'

import * as React from 'react'
import * as LabelPrimitive from '@radix-ui/react-label'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const labelVariants = cva(
  'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
  {
    variants: {
      variant: {
        default: 'text-foreground',
        muted: 'text-muted-foreground',
        error: 'text-destructive',
        success: 'text-mint-600',
      },
      size: {
        sm: 'text-xs',
        default: 'text-sm',
        lg: 'text-base',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface LabelProps
  extends React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root>,
    VariantProps<typeof labelVariants> {
  required?: boolean
  optional?: boolean
  hint?: string
}

const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  LabelProps
>(({ className, variant, size, required, optional, hint, children, ...props }, ref) => (
  <div className="space-y-1">
    <LabelPrimitive.Root
      ref={ref}
      className={cn(labelVariants({ variant, size }), className)}
      {...props}
    >
      {children}
      {required && <span className="text-destructive ml-1">*</span>}
      {optional && <span className="text-muted-foreground ml-1 text-xs font-normal">(선택)</span>}
    </LabelPrimitive.Root>
    {hint && (
      <p className="text-xs text-muted-foreground">{hint}</p>
    )}
  </div>
))
Label.displayName = LabelPrimitive.Root.displayName

// FormLabel - 폼 필드와 함께 사용하는 레이블
export interface FormLabelProps extends LabelProps {
  error?: string
}

const FormLabel = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  FormLabelProps
>(({ error, variant, ...props }, ref) => (
  <Label
    ref={ref}
    variant={error ? 'error' : variant}
    {...props}
  />
))
FormLabel.displayName = 'FormLabel'

export { Label, FormLabel, labelVariants }
