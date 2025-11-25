'use client'

import * as React from 'react'
import * as AvatarPrimitive from '@radix-ui/react-avatar'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const avatarVariants = cva(
  'relative flex shrink-0 overflow-hidden rounded-full',
  {
    variants: {
      size: {
        xs: 'h-6 w-6 text-xs',
        sm: 'h-8 w-8 text-sm',
        default: 'h-10 w-10 text-sm',
        lg: 'h-12 w-12 text-base',
        xl: 'h-16 w-16 text-lg',
        '2xl': 'h-20 w-20 text-xl',
      },
      variant: {
        circle: 'rounded-full',
        square: 'rounded-lg',
        bubble: 'rounded-[40%_60%_60%_40%/40%_40%_60%_60%]',
      },
      ring: {
        none: '',
        default: 'ring-2 ring-background',
        primary: 'ring-2 ring-primary',
        gradient: 'ring-2 ring-offset-2 ring-offset-background ring-primary',
      },
    },
    defaultVariants: {
      size: 'default',
      variant: 'circle',
      ring: 'none',
    },
  }
)

export interface AvatarProps
  extends React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root>,
    VariantProps<typeof avatarVariants> {
  status?: 'online' | 'offline' | 'busy' | 'away'
}

const Avatar = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Root>,
  AvatarProps
>(({ className, size, variant, ring, status, ...props }, ref) => (
  <div className="relative inline-block">
    <AvatarPrimitive.Root
      ref={ref}
      className={cn(avatarVariants({ size, variant, ring }), className)}
      {...props}
    />
    {status && (
      <span
        className={cn(
          'absolute bottom-0 right-0 block rounded-full ring-2 ring-background',
          size === 'xs' && 'h-1.5 w-1.5',
          size === 'sm' && 'h-2 w-2',
          (size === 'default' || !size) && 'h-2.5 w-2.5',
          size === 'lg' && 'h-3 w-3',
          size === 'xl' && 'h-3.5 w-3.5',
          size === '2xl' && 'h-4 w-4',
          status === 'online' && 'bg-mint-500',
          status === 'offline' && 'bg-muted-foreground',
          status === 'busy' && 'bg-rose-500',
          status === 'away' && 'bg-amber-500'
        )}
      />
    )}
  </div>
))
Avatar.displayName = AvatarPrimitive.Root.displayName

const AvatarImage = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Image>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Image
    ref={ref}
    className={cn('aspect-square h-full w-full object-cover', className)}
    {...props}
  />
))
AvatarImage.displayName = AvatarPrimitive.Image.displayName

const avatarFallbackColors = [
  'bg-pingly-100 text-pingly-700',
  'bg-violet-100 text-violet-700',
  'bg-mint-100 text-mint-700',
  'bg-amber-100 text-amber-700',
  'bg-rose-100 text-rose-700',
  'bg-sky-100 text-sky-700',
]

export interface AvatarFallbackProps
  extends React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback> {
  colorIndex?: number
}

const AvatarFallback = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Fallback>,
  AvatarFallbackProps
>(({ className, colorIndex, children, ...props }, ref) => {
  // Generate a consistent color based on content if colorIndex not provided
  const content = typeof children === 'string' ? children : ''
  const autoIndex = content.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  const color = avatarFallbackColors[(colorIndex ?? autoIndex) % avatarFallbackColors.length]

  return (
    <AvatarPrimitive.Fallback
      ref={ref}
      className={cn(
        'flex h-full w-full items-center justify-center font-medium',
        color,
        className
      )}
      {...props}
    >
      {children}
    </AvatarPrimitive.Fallback>
  )
})
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName

// Avatar Group
interface AvatarGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  max?: number
  size?: 'xs' | 'sm' | 'default' | 'lg' | 'xl' | '2xl'
}

const AvatarGroup = React.forwardRef<HTMLDivElement, AvatarGroupProps>(
  ({ children, max, size = 'default', className, ...props }, ref) => {
    const childArray = React.Children.toArray(children)
    const visibleAvatars = max ? childArray.slice(0, max) : childArray
    const remainingCount = max ? childArray.length - max : 0

    const overlap = {
      xs: '-space-x-2',
      sm: '-space-x-2.5',
      default: '-space-x-3',
      lg: '-space-x-4',
      xl: '-space-x-5',
      '2xl': '-space-x-6',
    }

    return (
      <div
        ref={ref}
        className={cn('flex items-center', overlap[size], className)}
        {...props}
      >
        {visibleAvatars}
        {remainingCount > 0 && (
          <Avatar size={size} ring="default">
            <AvatarFallback className="bg-muted text-muted-foreground text-xs">
              +{remainingCount}
            </AvatarFallback>
          </Avatar>
        )}
      </div>
    )
  }
)
AvatarGroup.displayName = 'AvatarGroup'

export { Avatar, AvatarImage, AvatarFallback, AvatarGroup, avatarVariants }
