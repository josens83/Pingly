'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import {
  AlertCircle,
  AlertTriangle,
  XCircle,
  RefreshCw,
  Home,
  ArrowLeft,
  WifiOff,
  ServerCrash,
  ShieldAlert,
  FileX
} from 'lucide-react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { Button } from '@/components/primitives'

const errorStateVariants = cva(
  'flex flex-col items-center justify-center text-center',
  {
    variants: {
      size: {
        sm: 'py-8 gap-3',
        default: 'py-12 gap-4',
        lg: 'py-16 gap-6',
        fullscreen: 'min-h-screen gap-6',
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
        fullscreen: 'h-24 w-24',
      },
      severity: {
        error: 'bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400',
        warning: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
        info: 'bg-sky-100 text-sky-600 dark:bg-sky-900/30 dark:text-sky-400',
      },
    },
    defaultVariants: {
      size: 'default',
      severity: 'error',
    },
  }
)

// Preset error types
type ErrorPreset = 'generic' | 'network' | 'server' | 'notFound' | 'forbidden' | 'validation'

const presetConfigs: Record<ErrorPreset, {
  icon: React.ElementType
  title: string
  description: string
  severity: 'error' | 'warning' | 'info'
}> = {
  generic: {
    icon: AlertCircle,
    title: '오류가 발생했습니다',
    description: '잠시 후 다시 시도해 주세요.',
    severity: 'error',
  },
  network: {
    icon: WifiOff,
    title: '네트워크 연결 오류',
    description: '인터넷 연결을 확인하고 다시 시도해 주세요.',
    severity: 'warning',
  },
  server: {
    icon: ServerCrash,
    title: '서버 오류',
    description: '서버에 일시적인 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.',
    severity: 'error',
  },
  notFound: {
    icon: FileX,
    title: '페이지를 찾을 수 없습니다',
    description: '요청하신 페이지가 존재하지 않거나 이동되었습니다.',
    severity: 'info',
  },
  forbidden: {
    icon: ShieldAlert,
    title: '접근 권한이 없습니다',
    description: '이 페이지에 접근할 권한이 없습니다.',
    severity: 'warning',
  },
  validation: {
    icon: AlertTriangle,
    title: '입력 오류',
    description: '입력한 정보를 확인하고 다시 시도해 주세요.',
    severity: 'warning',
  },
}

export interface ErrorStateProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onAnimationStart' | 'onAnimationEnd' | 'onDrag' | 'onDragStart' | 'onDragEnd'>,
    VariantProps<typeof errorStateVariants> {
  preset?: ErrorPreset
  icon?: React.ElementType
  severity?: 'error' | 'warning' | 'info'
  title?: string
  description?: string
  error?: Error | string
  showDetails?: boolean
  onRetry?: () => void
  onBack?: () => void
  onHome?: () => void
  retryText?: string
}

const ErrorState = React.forwardRef<HTMLDivElement, ErrorStateProps>(
  (
    {
      className,
      size,
      preset,
      icon,
      severity,
      title,
      description,
      error,
      showDetails,
      onRetry,
      onBack,
      onHome,
      retryText = '다시 시도',
      ...props
    },
    ref
  ) => {
    const [showError, setShowError] = React.useState(false)

    // Get preset config
    const presetConfig = preset ? presetConfigs[preset] : null

    // Determine final values
    const Icon = icon || presetConfig?.icon || AlertCircle
    const finalSeverity = severity || presetConfig?.severity || 'error'
    const finalTitle = title || presetConfig?.title || '오류가 발생했습니다'
    const finalDescription = description || presetConfig?.description

    // Icon size based on container size
    const iconSize = size === 'sm' ? 'h-6 w-6' : size === 'lg' || size === 'fullscreen' ? 'h-10 w-10' : 'h-8 w-8'

    // Error message
    const errorMessage = typeof error === 'string' ? error : error?.message

    return (
      <motion.div
        ref={ref}
        className={cn(errorStateVariants({ size }), className)}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        {...props}
      >
        {/* Icon */}
        <motion.div
          className={cn(iconContainerVariants({ size, severity: finalSeverity }))}
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Icon className={iconSize} />
        </motion.div>

        {/* Text Content */}
        <div className="space-y-1 max-w-md">
          <h3 className={cn(
            'font-semibold text-foreground',
            size === 'sm' && 'text-sm',
            (size === 'lg' || size === 'fullscreen') && 'text-xl',
            size === 'default' && 'text-base'
          )}>
            {finalTitle}
          </h3>
          {finalDescription && (
            <p className={cn(
              'text-muted-foreground',
              size === 'sm' && 'text-xs',
              (size === 'lg' || size === 'fullscreen') && 'text-base',
              size === 'default' && 'text-sm'
            )}>
              {finalDescription}
            </p>
          )}
        </div>

        {/* Error Details Toggle */}
        {showDetails && errorMessage && (
          <div className="w-full max-w-md">
            <button
              onClick={() => setShowError(!showError)}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              {showError ? '오류 상세 숨기기' : '오류 상세 보기'}
            </button>
            {showError && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-2 p-3 rounded-lg bg-muted text-xs text-muted-foreground font-mono overflow-auto max-h-32"
              >
                {errorMessage}
              </motion.div>
            )}
          </div>
        )}

        {/* Actions */}
        {(onRetry || onBack || onHome) && (
          <motion.div
            className="flex flex-wrap items-center justify-center gap-2 mt-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            {onRetry && (
              <Button
                onClick={onRetry}
                size={size === 'sm' ? 'sm' : 'default'}
                leftIcon={<RefreshCw className="h-4 w-4" />}
              >
                {retryText}
              </Button>
            )}
            {onBack && (
              <Button
                variant="outline"
                onClick={onBack}
                size={size === 'sm' ? 'sm' : 'default'}
                leftIcon={<ArrowLeft className="h-4 w-4" />}
              >
                뒤로 가기
              </Button>
            )}
            {onHome && (
              <Button
                variant="ghost"
                onClick={onHome}
                size={size === 'sm' ? 'sm' : 'default'}
                leftIcon={<Home className="h-4 w-4" />}
              >
                홈으로
              </Button>
            )}
          </motion.div>
        )}
      </motion.div>
    )
  }
)

ErrorState.displayName = 'ErrorState'

// Error Boundary Component
interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.props.onError?.(error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <ErrorState
          preset="generic"
          error={this.state.error ?? undefined}
          showDetails={process.env.NODE_ENV === 'development'}
          onRetry={() => this.setState({ hasError: false, error: null })}
        />
      )
    }

    return this.props.children
  }
}

export { ErrorState, ErrorBoundary }
