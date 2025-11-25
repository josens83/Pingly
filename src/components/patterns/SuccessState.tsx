'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { Check, CheckCircle, PartyPopper, Sparkles, ArrowRight, Home } from 'lucide-react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { Button } from '@/components/primitives'

const successStateVariants = cva(
  'flex flex-col items-center justify-center text-center',
  {
    variants: {
      size: {
        sm: 'py-8 gap-3',
        default: 'py-12 gap-4',
        lg: 'py-16 gap-6',
      },
    },
    defaultVariants: {
      size: 'default',
    },
  }
)

const iconContainerVariants = cva(
  'rounded-full flex items-center justify-center',
  {
    variants: {
      size: {
        sm: 'h-12 w-12',
        default: 'h-16 w-16',
        lg: 'h-20 w-20',
      },
      variant: {
        default: 'bg-mint-100 text-mint-600 dark:bg-mint-900/30 dark:text-mint-400',
        gradient: 'bg-gradient-to-br from-mint-500 to-teal-500 text-white',
        celebration: 'bg-gradient-to-br from-pingly-500 via-violet-500 to-pink-500 text-white',
      },
    },
    defaultVariants: {
      size: 'default',
      variant: 'default',
    },
  }
)

// Check animation variants
const checkmarkVariants = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: {
    pathLength: 1,
    opacity: 1,
    transition: {
      pathLength: { duration: 0.5, ease: 'easeInOut' },
      opacity: { duration: 0.2 },
    },
  },
}

const circleVariants = {
  hidden: { scale: 0, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] },
  },
}

// Animated checkmark SVG
const AnimatedCheckmark: React.FC<{ size: 'sm' | 'default' | 'lg' | null | undefined }> = ({ size }) => {
  const svgSize = size === 'sm' ? 24 : size === 'lg' ? 40 : 32

  return (
    <motion.svg
      width={svgSize}
      height={svgSize}
      viewBox="0 0 24 24"
      fill="none"
      initial="hidden"
      animate="visible"
    >
      <motion.circle
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
        variants={circleVariants}
      />
      <motion.path
        d="M8 12l3 3 5-6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        variants={checkmarkVariants}
      />
    </motion.svg>
  )
}

// Confetti particles
const ConfettiParticles: React.FC = () => {
  const particles = Array.from({ length: 12 })
  const colors = ['#3B82F6', '#8B5CF6', '#EC4899', '#10B981', '#F59E0B']

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {particles.map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 rounded-full"
          style={{
            backgroundColor: colors[i % colors.length],
            left: `${50 + (Math.random() - 0.5) * 60}%`,
            top: '50%',
          }}
          initial={{ y: 0, opacity: 1, scale: 0 }}
          animate={{
            y: -100 - Math.random() * 100,
            x: (Math.random() - 0.5) * 200,
            opacity: [1, 1, 0],
            scale: [0, 1, 0.5],
            rotate: Math.random() * 360,
          }}
          transition={{
            duration: 1 + Math.random() * 0.5,
            ease: 'easeOut',
            delay: 0.2 + Math.random() * 0.3,
          }}
        />
      ))}
    </div>
  )
}

export interface SuccessStateProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof successStateVariants> {
  variant?: 'default' | 'gradient' | 'celebration'
  icon?: 'check' | 'animated' | 'party' | 'sparkles' | React.ReactNode
  title?: string
  description?: string
  showConfetti?: boolean
  primaryAction?: {
    label: string
    onClick: () => void
    icon?: React.ReactNode
  }
  secondaryAction?: {
    label: string
    onClick: () => void
  }
}

const SuccessState = React.forwardRef<HTMLDivElement, SuccessStateProps>(
  (
    {
      className,
      size,
      variant = 'default',
      icon = 'animated',
      title = '완료되었습니다',
      description,
      showConfetti = false,
      primaryAction,
      secondaryAction,
      children,
      ...props
    },
    ref
  ) => {
    // Icon size
    const iconSize = size === 'sm' ? 'h-6 w-6' : size === 'lg' ? 'h-10 w-10' : 'h-8 w-8'

    // Render icon
    const renderIcon = () => {
      if (React.isValidElement(icon)) return icon

      switch (icon) {
        case 'animated':
          return <AnimatedCheckmark size={size} />
        case 'check':
          return <CheckCircle className={iconSize} />
        case 'party':
          return <PartyPopper className={iconSize} />
        case 'sparkles':
          return <Sparkles className={iconSize} />
        default:
          return <Check className={iconSize} />
      }
    }

    return (
      <motion.div
        ref={ref}
        className={cn(successStateVariants({ size }), 'relative', className)}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        {...props}
      >
        {/* Confetti */}
        {showConfetti && <ConfettiParticles />}

        {/* Icon */}
        <motion.div
          className={cn(iconContainerVariants({ size, variant }))}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{
            type: 'spring',
            stiffness: 200,
            damping: 15,
            delay: 0.1,
          }}
        >
          {renderIcon()}
        </motion.div>

        {/* Text Content */}
        <motion.div
          className="space-y-1"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h3 className={cn(
            'font-semibold text-foreground',
            size === 'sm' && 'text-sm',
            size === 'lg' && 'text-xl'
          )}>
            {title}
          </h3>
          {description && (
            <p className={cn(
              'text-muted-foreground max-w-sm',
              size === 'sm' && 'text-xs',
              size === 'lg' && 'text-base',
              size === 'default' && 'text-sm'
            )}>
              {description}
            </p>
          )}
        </motion.div>

        {/* Actions */}
        {(primaryAction || secondaryAction) && (
          <motion.div
            className="flex flex-col sm:flex-row items-center gap-2 mt-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {primaryAction && (
              <Button
                onClick={primaryAction.onClick}
                size={size === 'sm' ? 'sm' : 'default'}
                rightIcon={primaryAction.icon || <ArrowRight className="h-4 w-4" />}
              >
                {primaryAction.label}
              </Button>
            )}
            {secondaryAction && (
              <Button
                variant="ghost"
                onClick={secondaryAction.onClick}
                size={size === 'sm' ? 'sm' : 'default'}
              >
                {secondaryAction.label}
              </Button>
            )}
          </motion.div>
        )}

        {/* Custom children */}
        {children}
      </motion.div>
    )
  }
)

SuccessState.displayName = 'SuccessState'

export { SuccessState }
