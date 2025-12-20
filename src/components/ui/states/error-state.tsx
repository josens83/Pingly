import { AlertCircle, RefreshCw, Home, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ErrorStateProps {
  title?: string
  message?: string
  onRetry?: () => void
  onGoBack?: () => void
  onGoHome?: () => void
}

export function ErrorState({
  title = '문제가 발생했습니다',
  message = '데이터를 불러오는 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
  onRetry,
  onGoBack,
  onGoHome,
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      {/* Error Icon */}
      <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
        <AlertCircle className="h-8 w-8 text-destructive" />
      </div>

      {/* Title */}
      <h3 className="text-lg font-semibold text-foreground">{title}</h3>

      {/* Message */}
      <p className="text-muted-foreground mt-1 max-w-sm">{message}</p>

      {/* Actions */}
      <div className="flex flex-wrap gap-3 mt-6 justify-center">
        {onRetry && (
          <Button onClick={onRetry}>
            <RefreshCw className="h-4 w-4 mr-2" />
            다시 시도
          </Button>
        )}
        {onGoBack && (
          <Button variant="outline" onClick={onGoBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            뒤로 가기
          </Button>
        )}
        {onGoHome && (
          <Button variant="outline" onClick={onGoHome}>
            <Home className="h-4 w-4 mr-2" />
            홈으로
          </Button>
        )}
      </div>
    </div>
  )
}
