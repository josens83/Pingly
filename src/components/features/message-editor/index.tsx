'use client'

import { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Card,
  Button,
  Badge,
  Input,
  Textarea,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/primitives'
import {
  Smile,
  AtSign,
  Hash,
  Link2,
  Image,
  FileText,
  Sparkles,
  Copy,
  Check,
  ChevronDown,
  X,
  User,
  Building,
  Phone,
  Calendar,
  AlertCircle,
  Info,
  Smartphone,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// Variable types that can be inserted
const variables = [
  { key: 'name', label: '이름', icon: User, example: '홍길동' },
  { key: 'company', label: '회사명', icon: Building, example: '테크컴퍼니' },
  { key: 'phone', label: '전화번호', icon: Phone, example: '010-1234-5678' },
  { key: 'date', label: '날짜', icon: Calendar, example: '2024-11-25' },
]

// Emoji categories
const emojiCategories = [
  { name: '자주 사용', emojis: ['👍', '❤️', '🎉', '✨', '🔥', '💯', '🙏', '👏'] },
  { name: '감정', emojis: ['😀', '😊', '🥰', '😍', '🤗', '😎', '🥳', '🤩'] },
  { name: '기호', emojis: ['✅', '❌', '⭐', '💡', '🎁', '🏷️', '📢', '🔔'] },
  { name: '화살표', emojis: ['👉', '👈', '👆', '👇', '➡️', '⬅️', '⬆️', '⬇️'] },
]

// Message templates
const templates = [
  {
    id: 'promo',
    name: '프로모션',
    content: '[Pingly] {{name}}님, 특별 할인 이벤트!\n지금 바로 확인하세요 👉\n\n무료수신거부 080-XXX-XXXX',
  },
  {
    id: 'reminder',
    name: '리마인더',
    content: '{{name}}님, 예약하신 일정을 알려드립니다.\n📅 {{date}}\n\n문의: 1588-XXXX',
  },
  {
    id: 'welcome',
    name: '환영',
    content: '{{name}}님, {{company}}에 오신 것을 환영합니다! 🎉\n\n가입 혜택을 확인해보세요.',
  },
  {
    id: 'thankyou',
    name: '감사',
    content: '{{name}}님, 이용해 주셔서 감사합니다. 💙\n\n다음에 또 만나요!',
  },
]

interface MessageEditorProps {
  value: string
  onChange: (value: string) => void
  messageType: 'SMS' | 'LMS' | 'MMS' | 'KAKAO_ALIMTALK' | 'KAKAO_FRIENDTALK'
  maxBytes?: number
  showPreview?: boolean
  className?: string
}

export function MessageEditor({
  value,
  onChange,
  messageType,
  maxBytes,
  showPreview = true,
  className,
}: MessageEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [showVariables, setShowVariables] = useState(false)
  const [showEmojis, setShowEmojis] = useState(false)
  const [showTemplates, setShowTemplates] = useState(false)
  const [copied, setCopied] = useState(false)
  const [selectedEmojiCategory, setSelectedEmojiCategory] = useState(0)

  // Calculate byte length (Korean = 2 bytes, ASCII = 1 byte for SMS)
  const getByteLength = (str: string) => {
    let byteLength = 0
    for (let i = 0; i < str.length; i++) {
      const charCode = str.charCodeAt(i)
      byteLength += charCode > 127 ? 2 : 1
    }
    return byteLength
  }

  const byteLength = getByteLength(value)
  const maxBytesValue = maxBytes || (messageType === 'SMS' ? 90 : 2000)
  const isOverLimit = byteLength > maxBytesValue

  // Calculate SMS segments
  const getSmsSegments = () => {
    if (messageType !== 'SMS') return null
    if (byteLength <= 90) return 1
    return Math.ceil(byteLength / 67) // Long SMS uses 67 bytes per segment
  }

  const segments = getSmsSegments()

  // Insert text at cursor position
  const insertAtCursor = useCallback((text: string) => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const newValue = value.substring(0, start) + text + value.substring(end)
    onChange(newValue)

    // Reset cursor position after insert
    setTimeout(() => {
      textarea.selectionStart = textarea.selectionEnd = start + text.length
      textarea.focus()
    }, 0)
  }, [value, onChange])

  // Insert variable
  const insertVariable = (varKey: string) => {
    insertAtCursor(`{{${varKey}}}`)
    setShowVariables(false)
  }

  // Insert emoji
  const insertEmoji = (emoji: string) => {
    insertAtCursor(emoji)
  }

  // Apply template
  const applyTemplate = (template: typeof templates[0]) => {
    onChange(template.content)
    setShowTemplates(false)
  }

  // Copy to clipboard
  const handleCopy = async () => {
    await navigator.clipboard.writeText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Preview with variables replaced
  const getPreviewText = () => {
    let preview = value
    variables.forEach((v) => {
      preview = preview.replace(new RegExp(`{{${v.key}}}`, 'g'), v.example)
    })
    return preview
  }

  return (
    <div className={cn('space-y-4', className)}>
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Editor Section */}
        <div className="space-y-3">
          {/* Toolbar */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Variables dropdown */}
            <div className="relative">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowVariables(!showVariables)
                  setShowEmojis(false)
                  setShowTemplates(false)
                }}
                leftIcon={<AtSign className="h-4 w-4" />}
                rightIcon={<ChevronDown className={cn('h-3 w-3 transition-transform', showVariables && 'rotate-180')} />}
              >
                변수
              </Button>
              <AnimatePresence>
                {showVariables && (
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 4 }}
                    className="absolute left-0 top-full z-20 mt-1 w-48 rounded-xl border bg-card p-2 shadow-lg"
                  >
                    {variables.map((v) => (
                      <button
                        key={v.key}
                        onClick={() => insertVariable(v.key)}
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-muted transition-colors"
                      >
                        <v.icon className="h-4 w-4 text-muted-foreground" />
                        <span>{v.label}</span>
                        <Badge variant="secondary" size="sm" className="ml-auto">
                          {`{{${v.key}}}`}
                        </Badge>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Emoji dropdown */}
            <div className="relative">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowEmojis(!showEmojis)
                  setShowVariables(false)
                  setShowTemplates(false)
                }}
                leftIcon={<Smile className="h-4 w-4" />}
              >
                이모지
              </Button>
              <AnimatePresence>
                {showEmojis && (
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 4 }}
                    className="absolute left-0 top-full z-20 mt-1 w-64 rounded-xl border bg-card p-3 shadow-lg"
                  >
                    {/* Category tabs */}
                    <div className="flex gap-1 mb-2 overflow-x-auto pb-1">
                      {emojiCategories.map((cat, idx) => (
                        <button
                          key={cat.name}
                          onClick={() => setSelectedEmojiCategory(idx)}
                          className={cn(
                            'px-2 py-1 text-xs rounded-md whitespace-nowrap transition-colors',
                            idx === selectedEmojiCategory
                              ? 'bg-pingly-100 text-pingly-700'
                              : 'text-muted-foreground hover:bg-muted'
                          )}
                        >
                          {cat.name}
                        </button>
                      ))}
                    </div>
                    {/* Emoji grid */}
                    <div className="grid grid-cols-8 gap-1">
                      {emojiCategories[selectedEmojiCategory].emojis.map((emoji) => (
                        <button
                          key={emoji}
                          onClick={() => insertEmoji(emoji)}
                          className="p-1.5 text-lg hover:bg-muted rounded transition-colors"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Templates dropdown */}
            <div className="relative">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowTemplates(!showTemplates)
                  setShowVariables(false)
                  setShowEmojis(false)
                }}
                leftIcon={<FileText className="h-4 w-4" />}
                rightIcon={<ChevronDown className={cn('h-3 w-3 transition-transform', showTemplates && 'rotate-180')} />}
              >
                템플릿
              </Button>
              <AnimatePresence>
                {showTemplates && (
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 4 }}
                    className="absolute left-0 top-full z-20 mt-1 w-72 rounded-xl border bg-card p-2 shadow-lg"
                  >
                    {templates.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => applyTemplate(t)}
                        className="w-full text-left rounded-lg px-3 py-2 hover:bg-muted transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium text-sm">{t.name}</span>
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                          {t.content}
                        </p>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="flex-1" />

            {/* Copy button */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon-sm" onClick={handleCopy}>
                  {copied ? (
                    <Check className="h-4 w-4 text-mint-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>복사</TooltipContent>
            </Tooltip>

            {/* AI Enhance button */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm" className="bg-gradient-to-r from-pingly-50 to-violet-50 border-pingly-200">
                  <Sparkles className="h-4 w-4 mr-1 text-pingly-600" />
                  <span className="text-pingly-700">AI 개선</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>AI로 메시지 개선하기</TooltipContent>
            </Tooltip>
          </div>

          {/* Textarea */}
          <div className="relative">
            <Textarea
              ref={textareaRef}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="메시지 내용을 입력하세요..."
              rows={8}
              className={cn(
                'resize-none font-mono text-sm',
                isOverLimit && 'border-rose-500 focus:ring-rose-500'
              )}
            />

            {/* Variable chips in text */}
            {value.includes('{{') && (
              <div className="absolute right-3 top-3">
                <Badge variant="secondary" size="sm">
                  변수 포함
                </Badge>
              </div>
            )}
          </div>

          {/* Stats bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
            <div className="flex items-center gap-4">
              {/* Byte count */}
              <div className={cn('flex items-center gap-1', isOverLimit && 'text-rose-600')}>
                <span className="font-medium">{byteLength}</span>
                <span className="text-muted-foreground">/ {maxBytesValue} 바이트</span>
              </div>

              {/* SMS segments */}
              {segments && segments > 1 && (
                <div className="flex items-center gap-1 text-amber-600">
                  <AlertCircle className="h-4 w-4" />
                  <span>{segments}건 분할 발송</span>
                </div>
              )}
            </div>

            {/* Progress bar */}
            <div className="flex-1 max-w-[200px]">
              <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                <motion.div
                  className={cn(
                    'h-full rounded-full transition-colors',
                    isOverLimit
                      ? 'bg-rose-500'
                      : byteLength / maxBytesValue > 0.8
                      ? 'bg-amber-500'
                      : 'bg-pingly-500'
                  )}
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min((byteLength / maxBytesValue) * 100, 100)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Compliance warning */}
          {(messageType === 'SMS' || messageType === 'LMS' || messageType === 'MMS' || messageType === 'KAKAO_FRIENDTALK') && (
            <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm dark:bg-amber-500/10 dark:border-amber-500/30">
              <Info className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-amber-800 dark:text-amber-200">광고성 메시지 규정</p>
                <p className="mt-0.5 text-amber-700 dark:text-amber-300">
                  (광고) 표시와 무료 수신거부 번호를 포함해야 합니다.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Preview Section */}
        {showPreview && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Smartphone className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">미리보기</span>
              <Badge variant="secondary" size="sm">
                {messageType}
              </Badge>
            </div>

            {/* Phone mockup */}
            <div className="relative mx-auto w-full max-w-[280px]">
              {/* Phone frame */}
              <div className="rounded-[2rem] border-4 border-gray-800 bg-gray-800 p-2 shadow-xl">
                {/* Notch */}
                <div className="absolute left-1/2 top-4 -translate-x-1/2 h-6 w-20 rounded-full bg-gray-800" />

                {/* Screen */}
                <div className="rounded-[1.5rem] bg-gray-100 dark:bg-gray-900 overflow-hidden">
                  {/* Status bar */}
                  <div className="flex items-center justify-between px-6 py-2 text-xs">
                    <span className="font-medium">9:41</span>
                    <div className="flex gap-1">
                      <div className="h-2.5 w-4 rounded-sm bg-current" />
                      <div className="h-2.5 w-2.5 rounded-full bg-current" />
                    </div>
                  </div>

                  {/* Message header */}
                  <div className="bg-white dark:bg-gray-800 px-4 py-3 border-b">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-pingly-500 to-violet-500 flex items-center justify-center text-white text-sm font-bold">
                        P
                      </div>
                      <div>
                        <p className="font-medium text-sm">Pingly</p>
                        <p className="text-xs text-muted-foreground">발신번호</p>
                      </div>
                    </div>
                  </div>

                  {/* Message content */}
                  <div className="p-4 min-h-[200px] bg-gray-50 dark:bg-gray-900">
                    {value ? (
                      <div className="max-w-[85%] rounded-2xl rounded-tl-md bg-white dark:bg-gray-800 p-3 shadow-sm">
                        <p className="text-sm whitespace-pre-wrap break-words">
                          {getPreviewText()}
                        </p>
                        <p className="text-[10px] text-muted-foreground mt-1 text-right">
                          오후 2:30
                        </p>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-32 text-sm text-muted-foreground">
                        메시지를 입력하세요
                      </div>
                    )}
                  </div>

                  {/* Bottom bar */}
                  <div className="h-6 bg-white dark:bg-gray-800" />
                </div>
              </div>

              {/* Home indicator */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 h-1 w-24 rounded-full bg-gray-600" />
            </div>

            {/* Variable legend */}
            {value.includes('{{') && (
              <Card className="p-3">
                <p className="text-xs font-medium text-muted-foreground mb-2">변수 치환 예시</p>
                <div className="space-y-1">
                  {variables.filter(v => value.includes(`{{${v.key}}}`)).map(v => (
                    <div key={v.key} className="flex items-center justify-between text-xs">
                      <Badge variant="secondary" size="sm">{`{{${v.key}}}`}</Badge>
                      <span className="text-muted-foreground">→</span>
                      <span>{v.example}</span>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        )}
      </div>

      {/* Close dropdowns when clicking outside */}
      {(showVariables || showEmojis || showTemplates) && (
        <div
          className="fixed inset-0 z-10"
          onClick={() => {
            setShowVariables(false)
            setShowEmojis(false)
            setShowTemplates(false)
          }}
        />
      )}
    </div>
  )
}

export default MessageEditor
