'use client'

import * as React from 'react'
import * as TooltipPrimitive from '@radix-ui/react-tooltip'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const TooltipProvider = TooltipPrimitive.Provider

const Tooltip = TooltipPrimitive.Root

const TooltipTrigger = TooltipPrimitive.Trigger

const tooltipContentVariants = cva(
  `z-50 overflow-hidden rounded-lg px-3 py-1.5 text-sm
   animate-in fade-in-0 zoom-in-95
   data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95
   data-[side=bottom]:slide-in-from-top-2
   data-[side=left]:slide-in-from-right-2
   data-[side=right]:slide-in-from-left-2
   data-[side=top]:slide-in-from-bottom-2`,
  {
    variants: {
      variant: {
        default: 'bg-popover text-popover-foreground border shadow-md',
        dark: 'bg-gray-900 text-white',
        light: 'bg-white text-gray-900 border shadow-lg',
        primary: 'bg-primary text-primary-foreground',
        gradient: 'bg-gradient-to-r from-pingly-500 to-violet-500 text-white',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

export interface TooltipContentProps
  extends React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>,
    VariantProps<typeof tooltipContentVariants> {}

const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  TooltipContentProps
>(({ className, variant, sideOffset = 4, ...props }, ref) => (
  <TooltipPrimitive.Portal>
    <TooltipPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      className={cn(tooltipContentVariants({ variant }), className)}
      {...props}
    />
  </TooltipPrimitive.Portal>
))
TooltipContent.displayName = TooltipPrimitive.Content.displayName

// Simple tooltip wrapper
interface SimpleTooltipProps {
  children: React.ReactNode
  content: React.ReactNode
  side?: 'top' | 'right' | 'bottom' | 'left'
  align?: 'start' | 'center' | 'end'
  delayDuration?: number
  variant?: 'default' | 'dark' | 'light' | 'primary' | 'gradient'
}

const SimpleTooltip: React.FC<SimpleTooltipProps> = ({
  children,
  content,
  side = 'top',
  align = 'center',
  delayDuration = 200,
  variant = 'default',
}) => (
  <Tooltip delayDuration={delayDuration}>
    <TooltipTrigger asChild>{children}</TooltipTrigger>
    <TooltipContent side={side} align={align} variant={variant}>
      {content}
    </TooltipContent>
  </Tooltip>
)

export {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
  SimpleTooltip,
}
