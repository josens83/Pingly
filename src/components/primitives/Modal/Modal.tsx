'use client'

import * as React from 'react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

// Motion variants
const overlayMotion = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
}

const contentMotion = {
  initial: { opacity: 0, scale: 0.95, y: 10 },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.2, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 10,
    transition: { duration: 0.15 }
  },
}

const slideMotion = {
  initial: { opacity: 0, x: '100%' },
  animate: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }
  },
  exit: {
    opacity: 0,
    x: '100%',
    transition: { duration: 0.2 }
  },
}

const modalVariants = cva(
  `fixed z-50 bg-background shadow-2xl
   focus:outline-none focus-visible:ring-2 focus-visible:ring-ring`,
  {
    variants: {
      variant: {
        default: 'rounded-2xl border',
        sheet: 'rounded-l-2xl border-l h-full',
        fullscreen: 'rounded-none',
      },
      size: {
        sm: 'max-w-sm w-full',
        default: 'max-w-lg w-full',
        lg: 'max-w-2xl w-full',
        xl: 'max-w-4xl w-full',
        full: 'max-w-[calc(100vw-2rem)] w-full max-h-[calc(100vh-2rem)]',
      },
      position: {
        center: 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
        top: 'top-4 left-1/2 -translate-x-1/2',
        right: 'top-0 right-0 h-full',
        bottom: 'bottom-4 left-1/2 -translate-x-1/2',
      },
    },
    compoundVariants: [
      {
        variant: 'sheet',
        position: 'right',
        className: 'max-w-md',
      },
    ],
    defaultVariants: {
      variant: 'default',
      size: 'default',
      position: 'center',
    },
  }
)

interface ModalContextValue {
  variant: 'default' | 'sheet' | 'fullscreen' | null | undefined
}

const ModalContext = React.createContext<ModalContextValue>({ variant: 'default' })

// Root
const Modal = DialogPrimitive.Root

// Trigger
const ModalTrigger = DialogPrimitive.Trigger

// Portal
const ModalPortal = DialogPrimitive.Portal

// Close
const ModalClose = DialogPrimitive.Close

// Overlay
const ModalOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className }, ref) => (
  <DialogPrimitive.Overlay ref={ref} asChild>
    <motion.div
      className={cn(
        'fixed inset-0 z-50 bg-black/60 backdrop-blur-sm',
        className
      )}
      {...overlayMotion}
    />
  </DialogPrimitive.Overlay>
))
ModalOverlay.displayName = DialogPrimitive.Overlay.displayName

// Content
export interface ModalContentProps
  extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>,
    VariantProps<typeof modalVariants> {
  showClose?: boolean
}

const ModalContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  ModalContentProps
>(({ className, children, variant, size, position, showClose = true }, ref) => {
  const isSheet = variant === 'sheet'
  const motionVariant = isSheet ? slideMotion : contentMotion

  return (
    <ModalContext.Provider value={{ variant }}>
      <ModalPortal>
        <AnimatePresence>
          <ModalOverlay />
          <DialogPrimitive.Content ref={ref} asChild>
            <motion.div
              className={cn(modalVariants({ variant, size, position }), className)}
              {...motionVariant}
            >
              {children}
              {showClose && (
                <DialogPrimitive.Close
                  className={cn(
                    'absolute top-4 right-4 rounded-full p-2',
                    'text-muted-foreground hover:text-foreground',
                    'hover:bg-muted transition-colors',
                    'focus:outline-none focus:ring-2 focus:ring-ring',
                    'disabled:pointer-events-none'
                  )}
                >
                  <X className="h-4 w-4" />
                  <span className="sr-only">Close</span>
                </DialogPrimitive.Close>
              )}
            </motion.div>
          </DialogPrimitive.Content>
        </AnimatePresence>
      </ModalPortal>
    </ModalContext.Provider>
  )
})
ModalContent.displayName = DialogPrimitive.Content.displayName

// Header
const ModalHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      'flex flex-col space-y-1.5 p-6 pb-4',
      className
    )}
    {...props}
  />
)
ModalHeader.displayName = 'ModalHeader'

// Footer
const ModalFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      'flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2',
      'p-6 pt-4 border-t bg-muted/30',
      className
    )}
    {...props}
  />
)
ModalFooter.displayName = 'ModalFooter'

// Title
const ModalTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      'text-xl font-semibold leading-none tracking-tight',
      className
    )}
    {...props}
  />
))
ModalTitle.displayName = DialogPrimitive.Title.displayName

// Description
const ModalDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn('text-sm text-muted-foreground', className)}
    {...props}
  />
))
ModalDescription.displayName = DialogPrimitive.Description.displayName

// Body
const ModalBody = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn('flex-1 overflow-y-auto px-6 py-4', className)}
    {...props}
  />
)
ModalBody.displayName = 'ModalBody'

export {
  Modal,
  ModalPortal,
  ModalOverlay,
  ModalTrigger,
  ModalClose,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalTitle,
  ModalDescription,
  ModalBody,
}
