'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Card,
  Button,
  Badge,
  Input,
  Checkbox,
} from '@/components/primitives'
import { MessageEditor } from '@/components/features/message-editor'
import {
  ArrowLeft,
  ArrowRight,
  Send,
  Clock,
  Users,
  MessageSquare,
  Image,
  AlertCircle,
  Check,
  Target,
  Calendar,
  CreditCard,
  Sparkles,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// Animation variants
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
}

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 300 : -300,
    opacity: 0,
  }),
}

const messageTypes = [
  {
    value: 'SMS',
    label: 'SMS',
    description: '단문 메시지 (90바이트)',
    cost: 1,
    icon: MessageSquare,
    color: 'from-pingly-500 to-pingly-600',
    bgColor: 'bg-pingly-50',
  },
  {
    value: 'LMS',
    label: 'LMS',
    description: '장문 메시지 (2,000바이트)',
    cost: 3,
    icon: MessageSquare,
    color: 'from-violet-500 to-violet-600',
    bgColor: 'bg-violet-50',
  },
  {
    value: 'MMS',
    label: 'MMS',
    description: '멀티미디어 (이미지 첨부)',
    cost: 5,
    icon: Image,
    color: 'from-rose-500 to-rose-600',
    bgColor: 'bg-rose-50',
  },
  {
    value: 'KAKAO_ALIMTALK',
    label: '카카오 알림톡',
    description: '정보성 메시지',
    cost: 1,
    icon: MessageSquare,
    color: 'from-amber-500 to-amber-600',
    bgColor: 'bg-amber-50',
  },
  {
    value: 'KAKAO_FRIENDTALK',
    label: '카카오 친구톡',
    description: '광고성 메시지',
    cost: 2,
    icon: MessageSquare,
    color: 'from-yellow-500 to-yellow-600',
    bgColor: 'bg-yellow-50',
  },
]

const contactGroups = [
  { value: 'all', label: '전체 연락처', count: 1234, icon: Users },
  { value: 'vip', label: 'VIP 고객', count: 152, icon: Target },
  { value: 'new', label: '신규 고객', count: 89, icon: Sparkles },
  { value: 'regular', label: '일반 고객', count: 543, icon: Users },
]

const steps = [
  { id: 1, name: '기본 정보', description: '캠페인 설정' },
  { id: 2, name: '메시지 작성', description: '내용 입력' },
  { id: 3, name: '발송 설정', description: '검토 및 발송' },
]

export default function NewCampaignPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [direction, setDirection] = useState(0)
  const [isLoading, setIsLoading] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    type: 'SMS' as 'SMS' | 'LMS' | 'MMS' | 'KAKAO_ALIMTALK' | 'KAKAO_FRIENDTALK',
    targetGroups: ['all'] as string[],
    content: '',
    mediaUrl: '',
    scheduleType: 'now' as 'now' | 'scheduled',
    scheduledAt: '',
    addAdLabel: true,
    addOptOut: true,
  })

  const messageTypeConfig = messageTypes.find(t => t.value === formData.type)!
  const recipientCount = formData.targetGroups.reduce((acc, groupId) => {
    const group = contactGroups.find(g => g.value === groupId)
    return acc + (group?.count || 0)
  }, 0)
  const totalCost = recipientCount * messageTypeConfig.cost

  const goToStep = (newStep: number) => {
    setDirection(newStep > step ? 1 : -1)
    setStep(newStep)
  }

  const handleSubmit = async () => {
    setIsLoading(true)
    // API 호출 시뮬레이션
    await new Promise((resolve) => setTimeout(resolve, 1500))
    router.push('/dashboard/campaigns')
  }

  const toggleGroup = (groupId: string) => {
    if (formData.targetGroups.includes(groupId)) {
      if (formData.targetGroups.length > 1) {
        setFormData({
          ...formData,
          targetGroups: formData.targetGroups.filter(g => g !== groupId),
        })
      }
    } else {
      setFormData({
        ...formData,
        targetGroups: [...formData.targetGroups, groupId],
      })
    }
  }

  const canProceed = () => {
    if (step === 1) return formData.name.length > 0
    if (step === 2) return formData.content.length > 0
    return true
  }

  return (
    <motion.div
      className="mx-auto max-w-5xl space-y-6"
      initial="initial"
      animate="animate"
      variants={fadeInUp}
    >
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/campaigns">
          <Button variant="ghost" size="icon" className="shrink-0">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold truncate">새 캠페인 만들기</h1>
          <p className="text-muted-foreground text-sm">메시지 캠페인을 설정하고 발송하세요</p>
        </div>

        {/* Cost indicator */}
        <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-pingly-50 to-violet-50 border border-pingly-200">
          <CreditCard className="h-4 w-4 text-pingly-600" />
          <div className="text-sm">
            <span className="text-muted-foreground">예상 비용: </span>
            <span className="font-bold text-pingly-700">{totalCost.toLocaleString()} 크레딧</span>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          {steps.map((s, idx) => (
            <div key={s.id} className="flex items-center flex-1">
              <button
                onClick={() => s.id < step && goToStep(s.id)}
                className={cn(
                  'flex items-center gap-3 transition-all',
                  s.id < step && 'cursor-pointer hover:opacity-80',
                  s.id > step && 'cursor-not-allowed opacity-50'
                )}
                disabled={s.id > step}
              >
                <div
                  className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-xl text-sm font-semibold transition-all',
                    s.id === step
                      ? 'bg-gradient-to-r from-pingly-500 to-violet-500 text-white shadow-lg scale-110'
                      : s.id < step
                      ? 'bg-mint-500 text-white'
                      : 'bg-muted text-muted-foreground'
                  )}
                >
                  {s.id < step ? <Check className="h-5 w-5" /> : s.id}
                </div>
                <div className="hidden sm:block text-left">
                  <p className={cn(
                    'text-sm font-medium',
                    s.id === step ? 'text-foreground' : 'text-muted-foreground'
                  )}>
                    {s.name}
                  </p>
                  <p className="text-xs text-muted-foreground">{s.description}</p>
                </div>
              </button>

              {idx < steps.length - 1 && (
                <div className="flex-1 mx-4 hidden sm:block">
                  <div className="h-0.5 w-full rounded-full bg-muted overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-pingly-500 to-violet-500"
                      initial={{ width: 0 }}
                      animate={{ width: step > s.id ? '100%' : '0%' }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Step Content */}
      <AnimatePresence mode="wait" custom={direction}>
        {/* Step 1: Basic Info */}
        {step === 1 && (
          <motion.div
            key="step1"
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">캠페인 이름</h2>
              <Input
                placeholder="예: 11월 프로모션 캠페인"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="text-lg"
              />
            </Card>

            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">메시지 유형</h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {messageTypes.map((type) => {
                  const isSelected = formData.type === type.value
                  const Icon = type.icon
                  return (
                    <motion.button
                      key={type.value}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setFormData({ ...formData, type: type.value as typeof formData.type })}
                      className={cn(
                        'relative rounded-xl border p-4 text-left transition-all',
                        isSelected
                          ? 'border-pingly-500 bg-gradient-to-br from-pingly-50 to-violet-50 shadow-md'
                          : 'border-border hover:border-pingly-300 hover:bg-muted/50'
                      )}
                    >
                      {isSelected && (
                        <motion.div
                          layoutId="selectedType"
                          className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-pingly-500 flex items-center justify-center"
                        >
                          <Check className="h-4 w-4 text-white" />
                        </motion.div>
                      )}

                      <div className="flex items-start gap-3">
                        <div className={cn(
                          'h-10 w-10 rounded-lg bg-gradient-to-br flex items-center justify-center text-white',
                          type.color
                        )}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">{type.label}</span>
                            <Badge variant="secondary" size="sm">
                              {type.cost} 크레딧
                            </Badge>
                          </div>
                          <p className="mt-0.5 text-sm text-muted-foreground">{type.description}</p>
                        </div>
                      </div>
                    </motion.button>
                  )
                })}
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">발송 대상</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {contactGroups.map((group) => {
                  const isSelected = formData.targetGroups.includes(group.value)
                  const Icon = group.icon
                  return (
                    <motion.button
                      key={group.value}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => toggleGroup(group.value)}
                      className={cn(
                        'flex items-center gap-4 rounded-xl border p-4 transition-all text-left',
                        isSelected
                          ? 'border-pingly-500 bg-pingly-50 dark:bg-pingly-500/10'
                          : 'border-border hover:border-pingly-300'
                      )}
                    >
                      <Checkbox checked={isSelected} onChange={() => {}} />
                      <div className={cn(
                        'h-10 w-10 rounded-lg flex items-center justify-center',
                        isSelected ? 'bg-pingly-500 text-white' : 'bg-muted text-muted-foreground'
                      )}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium">{group.label}</p>
                        <p className="text-sm text-muted-foreground">{group.count.toLocaleString()}명</p>
                      </div>
                    </motion.button>
                  )
                })}
              </div>

              <div className="mt-4 p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4 text-pingly-600" />
                  <span>총 발송 대상: </span>
                  <span className="font-bold text-pingly-700">{recipientCount.toLocaleString()}명</span>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Step 2: Message Content */}
        {step === 2 && (
          <motion.div
            key="step2"
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">메시지 작성</h2>
                <Badge variant="secondary">{messageTypeConfig.label}</Badge>
              </div>

              <MessageEditor
                value={formData.content}
                onChange={(content) => setFormData({ ...formData, content })}
                messageType={formData.type}
                maxBytes={formData.type === 'SMS' ? 90 : 2000}
                showPreview
              />
            </Card>

            {/* MMS Image upload */}
            {(formData.type === 'MMS' || formData.type === 'KAKAO_FRIENDTALK') && (
              <Card className="p-6">
                <h2 className="text-lg font-semibold mb-4">이미지 첨부</h2>
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-xl p-8 text-center hover:border-pingly-500 transition-colors cursor-pointer">
                  <Image className="h-12 w-12 mx-auto text-muted-foreground" />
                  <p className="mt-4 font-medium">이미지를 드래그하거나 클릭하여 업로드</p>
                  <p className="mt-1 text-sm text-muted-foreground">JPG, PNG (최대 300KB)</p>
                </div>

                <div className="mt-4">
                  <Input
                    label="또는 이미지 URL 입력"
                    placeholder="https://example.com/image.jpg"
                    value={formData.mediaUrl}
                    onChange={(e) => setFormData({ ...formData, mediaUrl: e.target.value })}
                    leftIcon={<Image className="h-4 w-4" />}
                  />
                </div>
              </Card>
            )}

            {/* Ad compliance options */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">광고 규정 준수</h2>
              <div className="space-y-4">
                <Checkbox
                  checked={formData.addAdLabel}
                  onCheckedChange={(checked) => setFormData({ ...formData, addAdLabel: !!checked })}
                  label="(광고) 문구 자동 추가"
                  description="메시지 시작 부분에 (광고) 표시를 자동으로 추가합니다"
                />
                <Checkbox
                  checked={formData.addOptOut}
                  onCheckedChange={(checked) => setFormData({ ...formData, addOptOut: !!checked })}
                  label="수신거부 안내 자동 추가"
                  description="무료 수신거부 번호를 메시지 끝에 자동으로 추가합니다"
                />
              </div>
            </Card>
          </motion.div>
        )}

        {/* Step 3: Review & Send */}
        {step === 3 && (
          <motion.div
            key="step3"
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">발송 시점</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => setFormData({ ...formData, scheduleType: 'now' })}
                  className={cn(
                    'rounded-xl border p-6 text-left transition-all',
                    formData.scheduleType === 'now'
                      ? 'border-pingly-500 bg-gradient-to-br from-pingly-50 to-violet-50 shadow-md'
                      : 'border-border hover:border-pingly-300'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      'h-12 w-12 rounded-xl flex items-center justify-center',
                      formData.scheduleType === 'now'
                        ? 'bg-gradient-to-br from-pingly-500 to-violet-500 text-white'
                        : 'bg-muted text-muted-foreground'
                    )}>
                      <Send className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="font-semibold">즉시 발송</p>
                      <p className="text-sm text-muted-foreground">지금 바로 메시지를 발송합니다</p>
                    </div>
                  </div>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => setFormData({ ...formData, scheduleType: 'scheduled' })}
                  className={cn(
                    'rounded-xl border p-6 text-left transition-all',
                    formData.scheduleType === 'scheduled'
                      ? 'border-pingly-500 bg-gradient-to-br from-pingly-50 to-violet-50 shadow-md'
                      : 'border-border hover:border-pingly-300'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      'h-12 w-12 rounded-xl flex items-center justify-center',
                      formData.scheduleType === 'scheduled'
                        ? 'bg-gradient-to-br from-pingly-500 to-violet-500 text-white'
                        : 'bg-muted text-muted-foreground'
                    )}>
                      <Clock className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="font-semibold">예약 발송</p>
                      <p className="text-sm text-muted-foreground">원하는 시간에 발송합니다</p>
                    </div>
                  </div>
                </motion.button>
              </div>

              <AnimatePresence>
                {formData.scheduleType === 'scheduled' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4 overflow-hidden"
                  >
                    <Input
                      type="datetime-local"
                      label="발송 예약 시간"
                      value={formData.scheduledAt}
                      onChange={(e) => setFormData({ ...formData, scheduledAt: e.target.value })}
                      leftIcon={<Calendar className="h-4 w-4" />}
                    />

                    {/* AI recommendation */}
                    <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-pingly-50 to-violet-50 border border-pingly-200">
                      <div className="flex items-start gap-3">
                        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-pingly-500 to-violet-500 flex items-center justify-center shrink-0">
                          <Sparkles className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <p className="font-medium text-pingly-700">AI 추천 발송 시간</p>
                          <p className="mt-1 text-sm text-muted-foreground">
                            내일 오후 2:00에 발송하면 평균 32% 더 높은 오픈율을 기대할 수 있어요
                          </p>
                          <Button
                            variant="outline"
                            size="sm"
                            className="mt-2"
                            onClick={() => {
                              const tomorrow = new Date()
                              tomorrow.setDate(tomorrow.getDate() + 1)
                              tomorrow.setHours(14, 0, 0, 0)
                              setFormData({
                                ...formData,
                                scheduledAt: tomorrow.toISOString().slice(0, 16),
                              })
                            }}
                          >
                            추천 시간으로 설정
                          </Button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>

            {/* Summary */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">발송 요약</h2>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="p-4 rounded-xl bg-muted/50">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <Target className="h-4 w-4" />
                    캠페인 이름
                  </div>
                  <p className="font-semibold truncate">{formData.name}</p>
                </div>

                <div className="p-4 rounded-xl bg-muted/50">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <MessageSquare className="h-4 w-4" />
                    메시지 유형
                  </div>
                  <p className="font-semibold">{messageTypeConfig.label}</p>
                </div>

                <div className="p-4 rounded-xl bg-muted/50">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <Users className="h-4 w-4" />
                    발송 대상
                  </div>
                  <p className="font-semibold">{recipientCount.toLocaleString()}명</p>
                </div>

                <div className="p-4 rounded-xl bg-gradient-to-br from-pingly-50 to-violet-50 border border-pingly-200">
                  <div className="flex items-center gap-2 text-sm text-pingly-600 mb-1">
                    <CreditCard className="h-4 w-4" />
                    예상 비용
                  </div>
                  <p className="font-bold text-pingly-700">{totalCost.toLocaleString()} 크레딧</p>
                </div>
              </div>

              {/* Message preview */}
              <div className="mt-6">
                <p className="text-sm font-medium text-muted-foreground mb-2">메시지 미리보기</p>
                <div className="p-4 rounded-xl bg-muted/50 whitespace-pre-wrap text-sm font-mono">
                  {formData.addAdLabel && '(광고) '}
                  {formData.content || '(메시지 내용 없음)'}
                  {formData.addOptOut && '\n\n무료수신거부 080-XXX-XXXX'}
                </div>
              </div>

              {/* Final warning */}
              <div className="mt-6 p-4 rounded-xl bg-amber-50 border border-amber-200 dark:bg-amber-500/10 dark:border-amber-500/30">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-amber-800 dark:text-amber-200">발송 전 확인사항</p>
                    <ul className="mt-2 text-sm text-amber-700 dark:text-amber-300 space-y-1">
                      <li>• 발송 후에는 취소가 불가능합니다</li>
                      <li>• 광고 메시지는 08:00~21:00 사이에만 발송 가능합니다</li>
                      <li>• 예상 비용은 실제 발송 건수에 따라 달라질 수 있습니다</li>
                    </ul>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation buttons */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => goToStep(step - 1)}
            disabled={step === 1}
            leftIcon={<ArrowLeft className="h-4 w-4" />}
          >
            이전
          </Button>

          <div className="flex gap-2">
            {step === 3 && (
              <Button variant="outline">
                임시 저장
              </Button>
            )}

            {step < 3 ? (
              <Button
                onClick={() => goToStep(step + 1)}
                disabled={!canProceed()}
                rightIcon={<ArrowRight className="h-4 w-4" />}
              >
                다음
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                isLoading={isLoading}
                className="bg-gradient-to-r from-pingly-500 to-violet-500 hover:from-pingly-600 hover:to-violet-600"
                leftIcon={<Send className="h-4 w-4" />}
              >
                {formData.scheduleType === 'now' ? '발송하기' : '예약하기'}
              </Button>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  )
}
