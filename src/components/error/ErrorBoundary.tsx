'use client'

/**
 * React Error Boundary Component
 *
 * Enterprise-grade error boundary with:
 * - Graceful error handling
 * - Error reporting integration
 * - Recovery options
 * - Development mode stack traces
 */

import React, { Component, type ReactNode, type ErrorInfo } from 'react'
import { motion } from 'framer-motion'
import { AlertTriangle, RefreshCw, Home, Bug, Copy, ChevronDown, ChevronUp } from 'lucide-react'
import { Button, Card, CardContent, CardHeader, CardTitle } from '@/components/primitives'

// Types
interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
  showDetails?: boolean
  resetKeys?: unknown[]
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
  showStack: boolean
  copied: boolean
}

// Error Boundary Class Component (required for componentDidCatch)
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      showStack: false,
      copied: false,
    }
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({ errorInfo })

    // Call optional error handler
    this.props.onError?.(error, errorInfo)

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error Boundary caught an error:', error, errorInfo)
    }

    // Report to analytics/monitoring
    this.reportError(error, errorInfo)
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps): void {
    // Reset error state when resetKeys change
    if (this.state.hasError && this.props.resetKeys) {
      const hasChanged = this.props.resetKeys.some(
        (key, index) => prevProps.resetKeys?.[index] !== key
      )
      if (hasChanged) {
        this.reset()
      }
    }
  }

  private reportError(error: Error, errorInfo: ErrorInfo): void {
    // Integration with analytics
    try {
      if (typeof window !== 'undefined') {
        // Report to analytics service
        fetch('/api/analytics', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            events: [{
              name: '$error_boundary',
              properties: {
                message: error.message,
                name: error.name,
                stack: error.stack,
                componentStack: errorInfo.componentStack,
                url: window.location.href,
                timestamp: new Date().toISOString(),
              },
              timestamp: new Date(),
            }],
          }),
        }).catch(() => {
          // Silently fail if reporting fails
        })
      }
    } catch {
      // Silently fail
    }
  }

  private reset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      showStack: false,
      copied: false,
    })
  }

  private handleRefresh = (): void => {
    window.location.reload()
  }

  private handleGoHome = (): void => {
    window.location.href = '/'
  }

  private toggleStack = (): void => {
    this.setState(prev => ({ showStack: !prev.showStack }))
  }

  private copyError = async (): Promise<void> => {
    const { error, errorInfo } = this.state
    const errorText = `Error: ${error?.message}\n\nStack: ${error?.stack}\n\nComponent Stack: ${errorInfo?.componentStack}`

    try {
      await navigator.clipboard.writeText(errorText)
      this.setState({ copied: true })
      setTimeout(() => this.setState({ copied: false }), 2000)
    } catch {
      // Clipboard API failed
    }
  }

  render(): ReactNode {
    if (this.state.hasError) {
      // Custom fallback
      if (this.props.fallback) {
        return this.props.fallback
      }

      const { error, errorInfo, showStack, copied } = this.state
      const isDev = process.env.NODE_ENV === 'development'
      const showDetails = this.props.showDetails ?? isDev

      return (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex min-h-[400px] items-center justify-center p-4"
        >
          <Card className="mx-auto max-w-2xl w-full">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
                <AlertTriangle className="h-8 w-8 text-destructive" />
              </div>
              <CardTitle className="text-xl">
                문제가 발생했습니다
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-2">
                예기치 않은 오류가 발생했습니다. 페이지를 새로고침하거나 홈으로 돌아가주세요.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Error message */}
              <div className="rounded-lg bg-destructive/10 p-4">
                <p className="text-sm font-medium text-destructive">
                  {error?.name}: {error?.message}
                </p>
              </div>

              {/* Action buttons */}
              <div className="flex flex-wrap gap-3 justify-center">
                <Button onClick={this.reset} variant="default" className="gap-2">
                  <RefreshCw className="h-4 w-4" />
                  다시 시도
                </Button>
                <Button onClick={this.handleRefresh} variant="outline" className="gap-2">
                  <RefreshCw className="h-4 w-4" />
                  페이지 새로고침
                </Button>
                <Button onClick={this.handleGoHome} variant="outline" className="gap-2">
                  <Home className="h-4 w-4" />
                  홈으로
                </Button>
              </div>

              {/* Developer details */}
              {showDetails && (
                <div className="mt-6 border-t pt-4">
                  <button
                    onClick={this.toggleStack}
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
                  >
                    <Bug className="h-4 w-4" />
                    개발자 정보
                    {showStack ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </button>

                  {showStack && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-4 space-y-4"
                    >
                      {/* Copy button */}
                      <Button
                        onClick={this.copyError}
                        variant="outline"
                        size="sm"
                        className="gap-2"
                      >
                        <Copy className="h-3 w-3" />
                        {copied ? '복사됨!' : '에러 정보 복사'}
                      </Button>

                      {/* Stack trace */}
                      <div className="rounded-lg bg-neutral-900 p-4 overflow-auto max-h-64">
                        <pre className="text-xs text-neutral-300 whitespace-pre-wrap font-mono">
                          {error?.stack}
                        </pre>
                      </div>

                      {/* Component stack */}
                      {errorInfo?.componentStack && (
                        <div className="rounded-lg bg-neutral-900 p-4 overflow-auto max-h-64">
                          <p className="text-xs text-neutral-500 mb-2">Component Stack:</p>
                          <pre className="text-xs text-neutral-300 whitespace-pre-wrap font-mono">
                            {errorInfo.componentStack}
                          </pre>
                        </div>
                      )}
                    </motion.div>
                  )}
                </div>
              )}

              {/* Support link */}
              <p className="text-center text-xs text-muted-foreground">
                문제가 지속되면{' '}
                <a href="/support" className="text-primary hover:underline">
                  고객 지원
                </a>
                에 문의해주세요.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      )
    }

    return this.props.children
  }
}

// Functional wrapper with hooks support
interface ErrorBoundaryWrapperProps extends Omit<ErrorBoundaryProps, 'resetKeys'> {
  resetOnRouteChange?: boolean
}

export function ErrorBoundaryWrapper({
  children,
  resetOnRouteChange = true,
  ...props
}: ErrorBoundaryWrapperProps) {
  // In a real implementation, this would use usePathname for route change detection
  return (
    <ErrorBoundary {...props}>
      {children}
    </ErrorBoundary>
  )
}

// HOC for wrapping components with error boundary
export function withErrorBoundary<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, 'children'>
) {
  const displayName = WrappedComponent.displayName || WrappedComponent.name || 'Component'

  const ComponentWithErrorBoundary = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <WrappedComponent {...props} />
    </ErrorBoundary>
  )

  ComponentWithErrorBoundary.displayName = `withErrorBoundary(${displayName})`

  return ComponentWithErrorBoundary
}

// Async error boundary for Suspense
interface AsyncErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
  loadingFallback?: ReactNode
}

export function AsyncErrorBoundary({
  children,
  fallback,
  loadingFallback,
}: AsyncErrorBoundaryProps) {
  return (
    <ErrorBoundary fallback={fallback}>
      <React.Suspense fallback={loadingFallback || <DefaultLoadingFallback />}>
        {children}
      </React.Suspense>
    </ErrorBoundary>
  )
}

function DefaultLoadingFallback() {
  return (
    <div className="flex min-h-[200px] items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
    </div>
  )
}

export default ErrorBoundary
