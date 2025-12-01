'use client'

/**
 * Graceful Degradation Components
 * Provide fallback UI when services are unavailable
 */

import React, { useState, useEffect, ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertCircle, WifiOff, RefreshCw, Clock, Server, ArrowRight } from 'lucide-react'
import { Button, Card, CardContent } from '@/components/primitives'

// ============================================
// Offline Detector
// ============================================

interface OfflineDetectorProps {
  children: ReactNode
  fallback?: ReactNode
}

export function OfflineDetector({ children, fallback }: OfflineDetectorProps) {
  const [isOnline, setIsOnline] = useState(true)

  useEffect(() => {
    // Check initial state
    setIsOnline(navigator.onLine)

    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  if (!isOnline) {
    return fallback || <OfflineFallback />
  }

  return <>{children}</>
}

function OfflineFallback() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
    >
      <Card className="mx-4 max-w-md">
        <CardContent className="pt-6 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-orange-100">
            <WifiOff className="h-8 w-8 text-orange-600" />
          </div>
          <h2 className="mb-2 text-lg font-semibold">인터넷 연결 없음</h2>
          <p className="mb-4 text-sm text-muted-foreground">
            인터넷에 연결되어 있지 않습니다. 연결을 확인한 후 다시 시도해주세요.
          </p>
          <Button onClick={() => window.location.reload()} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            다시 시도
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// ============================================
// Loading Fallback
// ============================================

interface LoadingFallbackProps {
  message?: string
  showRetry?: boolean
  onRetry?: () => void
  timeout?: number
}

export function LoadingFallback({
  message = '데이터를 불러오는 중...',
  showRetry = false,
  onRetry,
  timeout = 10000,
}: LoadingFallbackProps) {
  const [showTimeout, setShowTimeout] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setShowTimeout(true), timeout)
    return () => clearTimeout(timer)
  }, [timeout])

  return (
    <div className="flex min-h-[200px] flex-col items-center justify-center p-8">
      <AnimatePresence mode="wait">
        {!showTimeout ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center"
          >
            <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-pingly-200 border-t-pingly-500" />
            <p className="text-sm text-muted-foreground">{message}</p>
          </motion.div>
        ) : (
          <motion.div
            key="timeout"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-orange-100">
              <Clock className="h-6 w-6 text-orange-600" />
            </div>
            <h3 className="mb-2 font-medium">로딩이 오래 걸리고 있습니다</h3>
            <p className="mb-4 text-sm text-muted-foreground">
              네트워크 상태를 확인하거나 잠시 후 다시 시도해주세요.
            </p>
            {(showRetry || onRetry) && (
              <Button onClick={onRetry} variant="outline" size="sm" className="gap-2">
                <RefreshCw className="h-4 w-4" />
                다시 시도
              </Button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ============================================
// Service Unavailable Fallback
// ============================================

interface ServiceUnavailableProps {
  serviceName?: string
  onRetry?: () => void
  showAlternative?: boolean
  alternativeAction?: () => void
  alternativeLabel?: string
}

export function ServiceUnavailable({
  serviceName = '서비스',
  onRetry,
  showAlternative = false,
  alternativeAction,
  alternativeLabel = '다른 방법으로 진행',
}: ServiceUnavailableProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="rounded-lg border border-orange-200 bg-orange-50 p-6 text-center"
    >
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-orange-100">
        <Server className="h-6 w-6 text-orange-600" />
      </div>
      <h3 className="mb-2 font-medium text-orange-900">
        {serviceName}에 일시적인 문제가 발생했습니다
      </h3>
      <p className="mb-4 text-sm text-orange-700">
        잠시 후 자동으로 복구됩니다. 계속 문제가 발생하면 고객센터로 문의해주세요.
      </p>
      <div className="flex justify-center gap-3">
        {onRetry && (
          <Button onClick={onRetry} variant="outline" size="sm" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            다시 시도
          </Button>
        )}
        {showAlternative && alternativeAction && (
          <Button onClick={alternativeAction} size="sm" className="gap-2">
            {alternativeLabel}
            <ArrowRight className="h-4 w-4" />
          </Button>
        )}
      </div>
    </motion.div>
  )
}

// ============================================
// Error Message Display
// ============================================

interface ErrorMessageProps {
  title?: string
  message: string
  code?: string
  onRetry?: () => void
  onDismiss?: () => void
  variant?: 'inline' | 'toast' | 'page'
}

export function ErrorMessage({
  title = '오류가 발생했습니다',
  message,
  code,
  onRetry,
  onDismiss,
  variant = 'inline',
}: ErrorMessageProps) {
  const content = (
    <>
      <div className="flex items-start gap-3">
        <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-destructive" />
        <div className="flex-1">
          <h4 className="font-medium text-destructive">{title}</h4>
          <p className="mt-1 text-sm text-muted-foreground">{message}</p>
          {code && (
            <p className="mt-1 text-xs text-muted-foreground">오류 코드: {code}</p>
          )}
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="text-muted-foreground hover:text-foreground"
          >
            ×
          </button>
        )}
      </div>
      {onRetry && (
        <div className="mt-3 flex justify-end">
          <Button onClick={onRetry} size="sm" variant="outline" className="gap-2">
            <RefreshCw className="h-3 w-3" />
            다시 시도
          </Button>
        </div>
      )}
    </>
  )

  if (variant === 'page') {
    return (
      <div className="flex min-h-[400px] items-center justify-center p-8">
        <Card className="max-w-md">
          <CardContent className="pt-6">{content}</CardContent>
        </Card>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="rounded-lg border border-destructive/20 bg-destructive/10 p-4"
    >
      {content}
    </motion.div>
  )
}

// ============================================
// Empty State with Fallback
// ============================================

interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex min-h-[200px] flex-col items-center justify-center p-8 text-center"
    >
      {icon && (
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
          {icon}
        </div>
      )}
      <h3 className="mb-2 font-medium">{title}</h3>
      {description && (
        <p className="mb-4 max-w-sm text-sm text-muted-foreground">{description}</p>
      )}
      {action && (
        <Button onClick={action.onClick} size="sm">
          {action.label}
        </Button>
      )}
    </motion.div>
  )
}

// ============================================
// Skeleton Loading States
// ============================================

export function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-lg border bg-card p-4">
      <div className="mb-4 h-4 w-1/3 rounded bg-muted" />
      <div className="space-y-2">
        <div className="h-3 w-full rounded bg-muted" />
        <div className="h-3 w-2/3 rounded bg-muted" />
      </div>
    </div>
  )
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="animate-pulse space-y-4">
      <div className="flex gap-4 border-b pb-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-4 flex-1 rounded bg-muted" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4">
          {[1, 2, 3, 4].map((j) => (
            <div key={j} className="h-4 flex-1 rounded bg-muted" />
          ))}
        </div>
      ))}
    </div>
  )
}

export function SkeletonChart() {
  return (
    <div className="animate-pulse">
      <div className="mb-4 h-6 w-1/4 rounded bg-muted" />
      <div className="flex h-64 items-end gap-2">
        {[40, 65, 45, 80, 55, 70, 60].map((height, i) => (
          <div
            key={i}
            className="flex-1 rounded-t bg-muted"
            style={{ height: `${height}%` }}
          />
        ))}
      </div>
    </div>
  )
}
