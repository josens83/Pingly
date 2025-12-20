/**
 * Feedback Widget Component
 * Chapter 20: Working Without a Designer
 *
 * Simple in-app feedback collection widget
 */

'use client'

import { useState, useCallback } from 'react'
import { MessageSquare, X, Send, ThumbsUp, ThumbsDown, Meh } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type FeedbackType = 'positive' | 'neutral' | 'negative'

interface FeedbackData {
  type?: FeedbackType
  message: string
  page: string
  timestamp: string
  userAgent: string
}

interface FeedbackWidgetProps {
  /** API endpoint to submit feedback */
  endpoint?: string
  /** Position of the widget */
  position?: 'bottom-right' | 'bottom-left'
  /** Show quick reaction buttons */
  showQuickReactions?: boolean
  /** Placeholder text */
  placeholder?: string
  /** Title text */
  title?: string
  /** Custom submit handler */
  onSubmit?: (data: FeedbackData) => Promise<void>
  /** Hide after successful submission for duration (ms) */
  hideAfterSubmit?: number
}

export function FeedbackWidget({
  endpoint = '/api/feedback',
  position = 'bottom-right',
  showQuickReactions = true,
  placeholder = '개선 아이디어, 버그, 불편한 점을 알려주세요',
  title = '피드백 보내기',
  onSubmit,
  hideAfterSubmit = 5000,
}: FeedbackWidgetProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [selectedType, setSelectedType] = useState<FeedbackType | undefined>()
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')

  const handleSubmit = useCallback(async () => {
    if (!message.trim() && !selectedType) return

    setStatus('submitting')

    const feedbackData: FeedbackData = {
      type: selectedType,
      message: message.trim(),
      page: typeof window !== 'undefined' ? window.location.pathname : '',
      timestamp: new Date().toISOString(),
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
    }

    try {
      if (onSubmit) {
        await onSubmit(feedbackData)
      } else {
        await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(feedbackData),
        })
      }

      setStatus('success')
      setMessage('')
      setSelectedType(undefined)

      if (hideAfterSubmit > 0) {
        setTimeout(() => {
          setIsOpen(false)
          setStatus('idle')
        }, hideAfterSubmit)
      }
    } catch {
      setStatus('error')
    }
  }, [message, selectedType, endpoint, onSubmit, hideAfterSubmit])

  const positionClasses = {
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
  }

  return (
    <>
      {/* Trigger Button */}
      <motion.button
        onClick={() => setIsOpen(true)}
        className={cn(
          'fixed z-50 h-12 w-12 rounded-full shadow-lg',
          'bg-primary text-primary-foreground',
          'flex items-center justify-center',
          'hover:scale-105 active:scale-95 transition-transform',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          positionClasses[position],
          isOpen && 'hidden'
        )}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label="피드백 보내기"
      >
        <MessageSquare className="h-5 w-5" />
      </motion.button>

      {/* Feedback Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={cn(
              'fixed z-50 w-80 bg-background border rounded-lg shadow-xl',
              position === 'bottom-right' ? 'bottom-4 right-4' : 'bottom-4 left-4'
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-semibold text-foreground">{title}</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="닫기"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Content */}
            <div className="p-4">
              {status === 'success' ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-4"
                >
                  <div className="h-12 w-12 mx-auto rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-3">
                    <ThumbsUp className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <p className="text-green-600 dark:text-green-400 font-medium">
                    감사합니다!
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    피드백이 전송되었습니다.
                  </p>
                </motion.div>
              ) : status === 'error' ? (
                <div className="text-center py-4">
                  <p className="text-destructive font-medium">전송 실패</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    잠시 후 다시 시도해주세요.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setStatus('idle')}
                    className="mt-3"
                  >
                    다시 시도
                  </Button>
                </div>
              ) : (
                <>
                  {/* Quick Reactions */}
                  {showQuickReactions && (
                    <div className="flex justify-center gap-2 mb-4">
                      {[
                        { type: 'positive' as const, icon: ThumbsUp, label: '좋아요' },
                        { type: 'neutral' as const, icon: Meh, label: '보통' },
                        { type: 'negative' as const, icon: ThumbsDown, label: '개선 필요' },
                      ].map(({ type, icon: Icon, label }) => (
                        <button
                          key={type}
                          onClick={() => setSelectedType(type)}
                          className={cn(
                            'flex flex-col items-center gap-1 p-2 rounded-lg transition-all',
                            'hover:bg-muted',
                            selectedType === type && 'bg-muted ring-2 ring-primary'
                          )}
                          aria-pressed={selectedType === type}
                          aria-label={label}
                        >
                          <Icon
                            className={cn(
                              'h-6 w-6',
                              selectedType === type
                                ? type === 'positive'
                                  ? 'text-green-500'
                                  : type === 'negative'
                                  ? 'text-red-500'
                                  : 'text-yellow-500'
                                : 'text-muted-foreground'
                            )}
                          />
                          <span className="text-xs text-muted-foreground">{label}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Message Input */}
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={placeholder}
                    rows={3}
                    className={cn(
                      'w-full px-3 py-2 rounded-md border bg-transparent',
                      'text-sm placeholder:text-muted-foreground',
                      'focus:outline-none focus:ring-2 focus:ring-ring',
                      'resize-none'
                    )}
                  />

                  {/* Submit Button */}
                  <Button
                    onClick={handleSubmit}
                    disabled={status === 'submitting' || (!message.trim() && !selectedType)}
                    className="w-full mt-3"
                  >
                    {status === 'submitting' ? (
                      <>
                        <svg
                          className="mr-2 h-4 w-4 animate-spin"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        전송 중...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        보내기
                      </>
                    )}
                  </Button>
                </>
              )}
            </div>

            {/* Footer */}
            <div className="px-4 pb-3">
              <p className="text-xs text-center text-muted-foreground">
                소중한 피드백을 보내주셔서 감사합니다
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default FeedbackWidget
