'use client'

import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  Info,
  X,
  Loader2,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// Toast types
export type ToastType = 'success' | 'error' | 'warning' | 'info' | 'loading'

export interface Toast {
  id: string
  type: ToastType
  title: string
  description?: string
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
}

interface ToastContextType {
  toasts: Toast[]
  addToast: (toast: Omit<Toast, 'id'>) => string
  removeToast: (id: string) => void
  updateToast: (id: string, toast: Partial<Toast>) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

// Hook to use toast
export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

// Convenience functions
export function toast(options: Omit<Toast, 'id'>) {
  // This will be set by the provider
  return toastFunctions.addToast(options)
}

toast.success = (title: string, description?: string) => {
  return toastFunctions.addToast({ type: 'success', title, description })
}

toast.error = (title: string, description?: string) => {
  return toastFunctions.addToast({ type: 'error', title, description, duration: 5000 })
}

toast.warning = (title: string, description?: string) => {
  return toastFunctions.addToast({ type: 'warning', title, description })
}

toast.info = (title: string, description?: string) => {
  return toastFunctions.addToast({ type: 'info', title, description })
}

toast.loading = (title: string, description?: string) => {
  return toastFunctions.addToast({ type: 'loading', title, description, duration: Infinity })
}

toast.dismiss = (id: string) => {
  toastFunctions.removeToast(id)
}

toast.update = (id: string, options: Partial<Toast>) => {
  toastFunctions.updateToast(id, options)
}

// Global functions (set by provider)
const toastFunctions = {
  addToast: (_toast: Omit<Toast, 'id'>): string => '',
  removeToast: (_id: string) => {},
  updateToast: (_id: string, _toast: Partial<Toast>) => {},
}

// Toast config
const toastConfig = {
  success: {
    icon: CheckCircle,
    className: 'bg-mint-50 border-mint-200 dark:bg-mint-500/10 dark:border-mint-500/30',
    iconClass: 'text-mint-600',
    titleClass: 'text-mint-800 dark:text-mint-200',
    descClass: 'text-mint-700 dark:text-mint-300',
  },
  error: {
    icon: XCircle,
    className: 'bg-rose-50 border-rose-200 dark:bg-rose-500/10 dark:border-rose-500/30',
    iconClass: 'text-rose-600',
    titleClass: 'text-rose-800 dark:text-rose-200',
    descClass: 'text-rose-700 dark:text-rose-300',
  },
  warning: {
    icon: AlertCircle,
    className: 'bg-amber-50 border-amber-200 dark:bg-amber-500/10 dark:border-amber-500/30',
    iconClass: 'text-amber-600',
    titleClass: 'text-amber-800 dark:text-amber-200',
    descClass: 'text-amber-700 dark:text-amber-300',
  },
  info: {
    icon: Info,
    className: 'bg-sky-50 border-sky-200 dark:bg-sky-500/10 dark:border-sky-500/30',
    iconClass: 'text-sky-600',
    titleClass: 'text-sky-800 dark:text-sky-200',
    descClass: 'text-sky-700 dark:text-sky-300',
  },
  loading: {
    icon: Loader2,
    className: 'bg-gray-50 border-gray-200 dark:bg-gray-500/10 dark:border-gray-500/30',
    iconClass: 'text-gray-600 animate-spin',
    titleClass: 'text-gray-800 dark:text-gray-200',
    descClass: 'text-gray-700 dark:text-gray-300',
  },
}

// Single toast component
function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  const config = toastConfig[toast.type]
  const Icon = config.icon

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.9 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      className={cn(
        'pointer-events-auto w-full max-w-sm rounded-xl border p-4 shadow-lg',
        config.className
      )}
    >
      <div className="flex items-start gap-3">
        <Icon className={cn('h-5 w-5 shrink-0 mt-0.5', config.iconClass)} />

        <div className="flex-1 min-w-0">
          <p className={cn('text-sm font-semibold', config.titleClass)}>
            {toast.title}
          </p>
          {toast.description && (
            <p className={cn('mt-1 text-sm', config.descClass)}>
              {toast.description}
            </p>
          )}
          {toast.action && (
            <button
              onClick={() => {
                toast.action?.onClick()
                onDismiss()
              }}
              className={cn(
                'mt-2 text-sm font-medium underline-offset-4 hover:underline',
                config.titleClass
              )}
            >
              {toast.action.label}
            </button>
          )}
        </div>

        <button
          onClick={onDismiss}
          className={cn(
            'shrink-0 rounded-lg p-1 transition-colors hover:bg-black/5 dark:hover:bg-white/5',
            config.iconClass
          )}
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </motion.div>
  )
}

// Toast provider
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9)
    const newToast: Toast = {
      ...toast,
      id,
      duration: toast.duration ?? 4000,
    }

    setToasts((prev) => [...prev, newToast])

    // Auto dismiss
    if (newToast.duration !== Infinity) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id))
      }, newToast.duration)
    }

    return id
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const updateToast = useCallback((id: string, updates: Partial<Toast>) => {
    setToasts((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updates } : t))
    )

    // If duration is updated and not Infinity, set new timeout
    if (updates.duration && updates.duration !== Infinity) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id))
      }, updates.duration)
    }
  }, [])

  // Set global functions
  toastFunctions.addToast = addToast
  toastFunctions.removeToast = removeToast
  toastFunctions.updateToast = updateToast

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, updateToast }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  )
}

// Toast container
function ToastContainer({
  toasts,
  removeToast,
}: {
  toasts: Toast[]
  removeToast: (id: string) => void
}) {
  return (
    <div
      className="pointer-events-none fixed bottom-0 right-0 z-50 flex flex-col gap-2 p-4 sm:max-w-sm w-full"
      aria-live="polite"
      aria-atomic="true"
    >
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <ToastItem
            key={toast.id}
            toast={toast}
            onDismiss={() => removeToast(toast.id)}
          />
        ))}
      </AnimatePresence>
    </div>
  )
}

// Sonner-style Toaster (alternative position options)
export function Toaster({
  position = 'bottom-right',
}: {
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'top-center' | 'bottom-center'
}) {
  const { toasts, removeToast } = useToast()

  const positionClasses = {
    'top-left': 'top-0 left-0',
    'top-right': 'top-0 right-0',
    'bottom-left': 'bottom-0 left-0',
    'bottom-right': 'bottom-0 right-0',
    'top-center': 'top-0 left-1/2 -translate-x-1/2',
    'bottom-center': 'bottom-0 left-1/2 -translate-x-1/2',
  }

  return (
    <div
      className={cn(
        'pointer-events-none fixed z-50 flex flex-col gap-2 p-4 sm:max-w-sm w-full',
        positionClasses[position]
      )}
      aria-live="polite"
      aria-atomic="true"
    >
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <ToastItem
            key={toast.id}
            toast={toast}
            onDismiss={() => removeToast(toast.id)}
          />
        ))}
      </AnimatePresence>
    </div>
  )
}

export default toast
