'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { LucideIcon, Inbox, Search, FileText, Users, MessageSquare, BarChart3, Plus } from 'lucide-react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { Button } from '@/components/primitives'

const emptyStateVariants = cva(
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
        default: 'bg-muted text-muted-foreground',
        primary: 'bg-primary/10 text-primary',
        gradient: 'bg-gradient-to-br from-pingly-100 to-violet-100 text-pingly-600',
      },
    },
    defaultVariants: {
      size: 'default',
      variant: 'default',
    },
  }
)

// Preset types for common empty states
type EmptyStatePreset = 'search' | 'data' | 'contacts' | 'campaigns' | 'messages' | 'analytics'

const presetConfigs: Record<EmptyStatePreset, { icon: LucideIcon; title: string; description: string }> = {
  search: {
    icon: Search,
    title: '검색 결과가 없습니다',
    description: '다른 검색어로 다시 시도해 보세요.',
  },
  data: {
    icon: Inbox,
    title: '데이터가 없습니다',
    description: '아직 등록된 데이터가 없습니다.',
  },
  contacts: {
    icon: Users,
    title: '연락처가 없습니다',
    description: '연락처를 추가하여 메시지를 보내보세요.',
  },
  campaigns: {
    icon: FileText,
    title: '캠페인이 없습니다',
    description: '첫 번째 캠페인을 만들어 마케팅을 시작하세요.',
  },
  messages: {
    icon: MessageSquare,
    title: '메시지가 없습니다',
    description: '아직 발송된 메시지가 없습니다.',
  },
  analytics: {
    icon: BarChart3,
    title: '분석 데이터가 없습니다',
    description: '캠페인을 실행하면 분석 데이터를 볼 수 있습니다.',
  },
}

export interface EmptyStateProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onAnimationStart' | 'onAnimationEnd' | 'onDrag' | 'onDragStart' | 'onDragEnd'>,
    VariantProps<typeof emptyStateVariants> {
  preset?: EmptyStatePreset
  icon?: LucideIcon | React.ReactNode
  iconVariant?: 'default' | 'primary' | 'gradient'
  title?: string
  description?: string
  action?: {
    label: string
    onClick: () => void
    icon?: React.ReactNode
  }
  secondaryAction?: {
    label: string
    onClick: () => void
  }
}

const EmptyState = React.forwardRef<HTMLDivElement, EmptyStateProps>(
  (
    {
      className,
      size,
      preset,
      icon,
      iconVariant = 'gradient',
      title,
      description,
      action,
      secondaryAction,
      children,
      ...props
    },
    ref
  ) => {
    // Get preset config if preset is provided
    const presetConfig = preset ? presetConfigs[preset] : null

    // Determine final values
    const IconComponent = icon || presetConfig?.icon || Inbox
    const finalTitle = title || presetConfig?.title || '데이터가 없습니다'
    const finalDescription = description || presetConfig?.description

    // Icon size based on container size
    const iconSize = size === 'sm' ? 'h-6 w-6' : size === 'lg' ? 'h-10 w-10' : 'h-8 w-8'

    return (
      <motion.div
        ref={ref}
        className={cn(emptyStateVariants({ size }), className)}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        {...props}
      >
        {/* Icon */}
        <motion.div
          className={cn(iconContainerVariants({ size, variant: iconVariant }))}
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          {React.isValidElement(IconComponent) ? (
            IconComponent
          ) : typeof IconComponent === 'function' ? (
            <IconComponent className={iconSize} />
          ) : null}
        </motion.div>

        {/* Text Content */}
        <div className="space-y-1">
          <h3 className={cn(
            'font-semibold text-foreground',
            size === 'sm' && 'text-sm',
            size === 'lg' && 'text-lg'
          )}>
            {finalTitle}
          </h3>
          {finalDescription && (
            <p className={cn(
              'text-muted-foreground max-w-sm',
              size === 'sm' && 'text-xs',
              size === 'lg' && 'text-base',
              size === 'default' && 'text-sm'
            )}>
              {finalDescription}
            </p>
          )}
        </div>

        {/* Actions */}
        {(action || secondaryAction) && (
          <motion.div
            className="flex flex-col sm:flex-row items-center gap-2 mt-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            {action && (
              <Button
                onClick={action.onClick}
                size={size === 'sm' ? 'sm' : 'default'}
                leftIcon={action.icon || <Plus className="h-4 w-4" />}
              >
                {action.label}
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

EmptyState.displayName = 'EmptyState'

export { EmptyState }
