'use client'

import * as React from 'react'
import * as SwitchPrimitive from '@radix-ui/react-switch'
import { motion } from 'framer-motion'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const switchVariants = cva(
  `peer inline-flex shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent
   transition-all duration-200
   focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
   disabled:cursor-not-allowed disabled:opacity-50
   data-[state=unchecked]:bg-input`,
  {
    variants: {
      variant: {
        default: 'data-[state=checked]:bg-primary',
        success: 'data-[state=checked]:bg-mint-500',
        warning: 'data-[state=checked]:bg-amber-500',
        destructive: 'data-[state=checked]:bg-rose-500',
        gradient: 'data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-pingly-500 data-[state=checked]:to-violet-500',
      },
      size: {
        sm: 'h-5 w-9',
        default: 'h-6 w-11',
        lg: 'h-7 w-[52px]',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

const thumbVariants = cva(
  `pointer-events-none block rounded-full bg-white shadow-lg ring-0
   transition-transform duration-200 ease-out`,
  {
    variants: {
      size: {
        sm: 'h-4 w-4 data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0',
        default: 'h-5 w-5 data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0',
        lg: 'h-6 w-6 data-[state=checked]:translate-x-6 data-[state=unchecked]:translate-x-0',
      },
    },
    defaultVariants: {
      size: 'default',
    },
  }
)

export interface SwitchProps
  extends React.ComponentPropsWithoutRef<typeof SwitchPrimitive.Root>,
    VariantProps<typeof switchVariants> {
  label?: string
  description?: string
  labelPosition?: 'left' | 'right'
}

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitive.Root>,
  SwitchProps
>(({ className, variant, size, label, description, labelPosition = 'right', id, ...props }, ref) => {
  const switchId = id || React.useId()

  const switchElement = (
    <SwitchPrimitive.Root
      ref={ref}
      id={switchId}
      className={cn(switchVariants({ variant, size }), className)}
      {...props}
    >
      <SwitchPrimitive.Thumb className={cn(thumbVariants({ size }))} />
    </SwitchPrimitive.Root>
  )

  if (!label && !description) {
    return switchElement
  }

  const labelContent = (
    <div className="grid gap-1">
      {label && (
        <label
          htmlFor={switchId}
          className={cn(
            'text-sm font-medium leading-none cursor-pointer',
            'peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
          )}
        >
          {label}
        </label>
      )}
      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}
    </div>
  )

  return (
    <div className="flex items-center gap-3">
      {labelPosition === 'left' && labelContent}
      {switchElement}
      {labelPosition === 'right' && labelContent}
    </div>
  )
})
Switch.displayName = SwitchPrimitive.Root.displayName

export { Switch, switchVariants }
