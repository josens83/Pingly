'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import {
  ArrowLeft,
  Send,
  Clock,
  Users,
  MessageSquare,
  Image,
  Link as LinkIcon,
  AlertCircle,
} from 'lucide-react'
import Link from 'next/link'
import { calculateCreditCost, getMessageTypeLabel } from '@/lib/utils'

const messageTypes = [
  { value: 'SMS', label: 'SMS (단문)', description: '90바이트 이하', cost: 1 },
  { value: 'LMS', label: 'LMS (장문)', description: '2,000바이트 이하', cost: 3 },
  { value: 'MMS', label: 'MMS (멀티미디어)', description: '이미지 첨부 가능', cost: 5 },
  { value: 'KAKAO_ALIMTALK', label: '카카오 알림톡', description: '정보성 메시지', cost: 1 },
  { value: 'KAKAO_FRIENDTALK', label: '카카오 친구톡', description: '광고성 메시지', cost: 2 },
]

const contactGroups = [
  { value: 'all', label: '전체 연락처 (1,234명)' },
  { value: 'vip', label: 'VIP 고객 (152명)' },
  { value: 'new', label: '신규 고객 (89명)' },
  { value: 'regular', label: '일반 고객 (543명)' },
]

export default function NewCampaignPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    type: 'SMS',
    targetGroup: 'all',
    content: '',
    mediaUrl: '',
    scheduleType: 'now',
    scheduledAt: '',
  })

  const contentLength = new TextEncoder().encode(formData.content).length
  const estimatedCost = calculateCreditCost(formData.type, contentLength)
  const recipientCount = contactGroups.find((g) => g.value === formData.targetGroup)?.label.match(/\((\d+)/)?.[1] || '0'
  const totalCost = parseInt(recipientCount) * estimatedCost

  const handleSubmit = async () => {
    setIsLoading(true)
    // API 호출 시뮬레이션
    await new Promise((resolve) => setTimeout(resolve, 1500))
    router.push('/dashboard/campaigns')
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/campaigns">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">새 캠페인 만들기</h1>
          <p className="text-muted-foreground">메시지 캠페인을 설정하고 발송하세요</p>
        </div>
      </div>

      {/* Progress */}
      <div className="flex items-center gap-2">
        {[1, 2, 3].map((s) => (
          <div
            key={s}
            className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
              s === step
                ? 'bg-primary text-primary-foreground'
                : s < step
                ? 'bg-green-500 text-white'
                : 'bg-muted text-muted-foreground'
            }`}
          >
            {s}
          </div>
        ))}
      </div>

      {/* Step 1: Basic Info */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>기본 정보</CardTitle>
            <CardDescription>캠페인의 기본 정보를 입력하세요</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">캠페인 이름 *</Label>
              <Input
                id="name"
                placeholder="예: 11월 프로모션 캠페인"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>메시지 유형 *</Label>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {messageTypes.map((type) => (
                  <div
                    key={type.value}
                    className={`cursor-pointer rounded-lg border p-4 transition-colors ${
                      formData.type === type.value
                        ? 'border-primary bg-primary/5'
                        : 'hover:border-primary/50'
                    }`}
                    onClick={() => setFormData({ ...formData, type: type.value })}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{type.label}</span>
                      <Badge variant="secondary">{type.cost} 크레딧</Badge>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{type.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>발송 대상 *</Label>
              <Select
                options={contactGroups}
                value={formData.targetGroup}
                onChange={(e) => setFormData({ ...formData, targetGroup: e.target.value })}
              />
            </div>

            <div className="flex justify-end">
              <Button onClick={() => setStep(2)} disabled={!formData.name}>
                다음
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Message Content */}
      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>메시지 내용</CardTitle>
            <CardDescription>발송할 메시지 내용을 작성하세요</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="content">메시지 내용 *</Label>
                <span className="text-sm text-muted-foreground">
                  {contentLength} / {formData.type === 'SMS' ? '90' : '2000'} 바이트
                </span>
              </div>
              <Textarea
                id="content"
                placeholder="메시지 내용을 입력하세요..."
                rows={6}
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              />
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" onClick={() => setFormData({ ...formData, content: formData.content + '{{name}}' })}>
                  이름 삽입
                </Button>
                <Button variant="outline" size="sm" onClick={() => setFormData({ ...formData, content: formData.content + '{{company}}' })}>
                  회사명 삽입
                </Button>
              </div>
            </div>

            {(formData.type === 'MMS' || formData.type === 'KAKAO_FRIENDTALK') && (
              <div className="space-y-2">
                <Label htmlFor="mediaUrl">이미지 URL</Label>
                <div className="flex gap-2">
                  <Input
                    id="mediaUrl"
                    placeholder="https://example.com/image.jpg"
                    value={formData.mediaUrl}
                    onChange={(e) => setFormData({ ...formData, mediaUrl: e.target.value })}
                  />
                  <Button variant="outline">
                    <Image className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
              <div className="flex gap-2">
                <AlertCircle className="h-5 w-5 text-yellow-600" />
                <div>
                  <p className="font-medium text-yellow-800">광고 메시지 규정</p>
                  <p className="mt-1 text-sm text-yellow-700">
                    광고성 메시지는 반드시 (광고) 표시와 수신거부 방법을 포함해야 합니다.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(1)}>
                이전
              </Button>
              <Button onClick={() => setStep(3)} disabled={!formData.content}>
                다음
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Review & Send */}
      {step === 3 && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>발송 설정</CardTitle>
              <CardDescription>발송 시점을 선택하세요</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <div
                  className={`flex-1 cursor-pointer rounded-lg border p-4 ${
                    formData.scheduleType === 'now' ? 'border-primary bg-primary/5' : ''
                  }`}
                  onClick={() => setFormData({ ...formData, scheduleType: 'now' })}
                >
                  <div className="flex items-center gap-2">
                    <Send className="h-5 w-5" />
                    <span className="font-medium">즉시 발송</span>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">지금 바로 메시지를 발송합니다</p>
                </div>
                <div
                  className={`flex-1 cursor-pointer rounded-lg border p-4 ${
                    formData.scheduleType === 'scheduled' ? 'border-primary bg-primary/5' : ''
                  }`}
                  onClick={() => setFormData({ ...formData, scheduleType: 'scheduled' })}
                >
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    <span className="font-medium">예약 발송</span>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">원하는 시간에 발송합니다</p>
                </div>
              </div>

              {formData.scheduleType === 'scheduled' && (
                <div className="space-y-2">
                  <Label htmlFor="scheduledAt">발송 예약 시간</Label>
                  <Input
                    id="scheduledAt"
                    type="datetime-local"
                    value={formData.scheduledAt}
                    onChange={(e) => setFormData({ ...formData, scheduledAt: e.target.value })}
                  />
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>발송 요약</CardTitle>
              <CardDescription>캠페인 정보를 확인하세요</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-lg bg-muted p-4">
                    <p className="text-sm text-muted-foreground">캠페인 이름</p>
                    <p className="font-medium">{formData.name}</p>
                  </div>
                  <div className="rounded-lg bg-muted p-4">
                    <p className="text-sm text-muted-foreground">메시지 유형</p>
                    <p className="font-medium">{getMessageTypeLabel(formData.type)}</p>
                  </div>
                  <div className="rounded-lg bg-muted p-4">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">발송 대상</p>
                    </div>
                    <p className="font-medium">{recipientCount}명</p>
                  </div>
                  <div className="rounded-lg bg-muted p-4">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">예상 비용</p>
                    </div>
                    <p className="font-medium">{totalCost.toLocaleString()} 크레딧</p>
                  </div>
                </div>

                <div className="rounded-lg border p-4">
                  <p className="text-sm font-medium text-muted-foreground">메시지 미리보기</p>
                  <div className="mt-2 whitespace-pre-wrap rounded-lg bg-muted p-4 text-sm">
                    {formData.content || '(메시지 내용 없음)'}
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-between">
                <Button variant="outline" onClick={() => setStep(2)}>
                  이전
                </Button>
                <div className="flex gap-2">
                  <Button variant="outline">임시 저장</Button>
                  <Button onClick={handleSubmit} isLoading={isLoading}>
                    <Send className="mr-2 h-4 w-4" />
                    {formData.scheduleType === 'now' ? '발송하기' : '예약하기'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
