'use client'

import * as React from 'react'
import * as CheckboxPrimitive from '@radix-ui/react-checkbox'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, Minus } from 'lucide-react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const checkboxVariants = cva(
  `peer shrink-0 rounded border-2 transition-all duration-200
   focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
   disabled:cursor-not-allowed disabled:opacity-50`,
  {
    variants: {
      variant: {
        default: `
          border-input bg-background
          hover:border-primary/50
          data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground
          data-[state=indeterminate]:border-primary data-[state=indeterminate]:bg-primary data-[state=indeterminate]:text-primary-foreground
        `,
        success: `
          border-input bg-background
          hover:border-mint-500/50
          data-[state=checked]:border-mint-500 data-[state=checked]:bg-mint-500 data-[state=checked]:text-white
        `,
        gradient: `
          border-input bg-background
          hover:border-pingly-500/50
          data-[state=checked]:border-transparent data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-pingly-500 data-[state=checked]:to-violet-500 data-[state=checked]:text-white
        `,
      },
      size: {
        sm: 'h-4 w-4',
        default: 'h-5 w-5',
        lg: 'h-6 w-6',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

const checkIconVariants = {
  hidden: { opacity: 0, scale: 0.5 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.15, ease: 'easeOut' as const } },
}

export interface CheckboxProps
  extends React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>,
    VariantProps<typeof checkboxVariants> {
  label?: string
  description?: string
}

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  CheckboxProps
>(({ className, variant, size, label, description, id, ...props }, ref) => {
  const checkboxId = id || React.useId()
  const iconSize = size === 'sm' ? 'h-3 w-3' : size === 'lg' ? 'h-4 w-4' : 'h-3.5 w-3.5'

  const checkbox = (
    <CheckboxPrimitive.Root
      ref={ref}
      id={checkboxId}
      className={cn(checkboxVariants({ variant, size }), className)}
      {...props}
    >
      <CheckboxPrimitive.Indicator asChild>
        <motion.span
          className="flex items-center justify-center"
          initial="hidden"
          animate="visible"
          exit="hidden"
          variants={checkIconVariants}
        >
          {props.checked === 'indeterminate' ? (
            <Minus className={cn(iconSize, 'stroke-[3]')} />
          ) : (
            <Check className={cn(iconSize, 'stroke-[3]')} />
          )}
        </motion.span>
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )

  if (!label && !description) {
    return checkbox
  }

  return (
    <div className="flex items-start gap-3">
      {checkbox}
      <div className="grid gap-1 leading-none">
        {label && (
          <label
            htmlFor={checkboxId}
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
    </div>
  )
})
Checkbox.displayName = CheckboxPrimitive.Root.displayName

export { Checkbox, checkboxVariants }
