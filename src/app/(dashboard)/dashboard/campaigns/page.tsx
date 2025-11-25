'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select } from '@/components/ui/select'
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Send,
  Clock,
  CheckCircle,
  XCircle,
  Pause,
  Play,
  Copy,
  Trash2,
  Eye,
} from 'lucide-react'
import { formatDateTime, getMessageTypeLabel, getStatusColor } from '@/lib/utils'

const campaigns = [
  {
    id: '1',
    name: '11월 프로모션 캠페인',
    type: 'SMS',
    status: 'COMPLETED',
    content: '[Pingly] 11월 한정 특가! 전 상품 20% 할인 쿠폰을 지금 바로 받아가세요. 수신거부 080-XXX-XXXX',
    totalRecipients: 1250,
    sentCount: 1250,
    deliveredCount: 1238,
    clickCount: 423,
    scheduledAt: null,
    completedAt: '2024-11-20T14:30:00',
  },
  {
    id: '2',
    name: '신규 가입 혜택 안내',
    type: 'KAKAO_ALIMTALK',
    status: 'SENDING',
    content: '안녕하세요, {{name}}님! Pingly에 가입해주셔서 감사합니다. 신규 가입 혜택으로 1,000원 쿠폰을 드립니다.',
    totalRecipients: 500,
    sentCount: 423,
    deliveredCount: 415,
    clickCount: 156,
    scheduledAt: null,
    completedAt: null,
  },
  {
    id: '3',
    name: '12월 이벤트 사전 안내',
    type: 'LMS',
    status: 'SCHEDULED',
    content: '[Pingly] 12월 연말 이벤트가 곧 시작됩니다! 미리 알림 신청하시면 추가 혜택을 드립니다.',
    totalRecipients: 2500,
    sentCount: 0,
    deliveredCount: 0,
    clickCount: 0,
    scheduledAt: '2024-11-25T10:00:00',
    completedAt: null,
  },
  {
    id: '4',
    name: '장바구니 알림',
    type: 'KAKAO_FRIENDTALK',
    status: 'DRAFT',
    content: '{{name}}님, 장바구니에 담아두신 상품이 있어요! 지금 구매하시면 무료 배송 혜택을 드려요.',
    totalRecipients: 0,
    sentCount: 0,
    deliveredCount: 0,
    clickCount: 0,
    scheduledAt: null,
    completedAt: null,
  },
]

const statusOptions = [
  { value: '', label: '전체 상태' },
  { value: 'DRAFT', label: '작성중' },
  { value: 'SCHEDULED', label: '예약됨' },
  { value: 'SENDING', label: '발송중' },
  { value: 'COMPLETED', label: '완료' },
  { value: 'CANCELLED', label: '취소됨' },
]

const typeOptions = [
  { value: '', label: '전체 유형' },
  { value: 'SMS', label: 'SMS' },
  { value: 'LMS', label: 'LMS' },
  { value: 'MMS', label: 'MMS' },
  { value: 'KAKAO_ALIMTALK', label: '카카오 알림톡' },
  { value: 'KAKAO_FRIENDTALK', label: '카카오 친구톡' },
]

export default function CampaignsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')

  const filteredCampaigns = campaigns.filter((campaign) => {
    const matchesSearch = campaign.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = !statusFilter || campaign.status === statusFilter
    const matchesType = !typeFilter || campaign.type === typeFilter
    return matchesSearch && matchesStatus && matchesType
  })

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'SENDING':
        return <Send className="h-4 w-4 text-yellow-500" />
      case 'SCHEDULED':
        return <Clock className="h-4 w-4 text-blue-500" />
      case 'DRAFT':
        return <Pause className="h-4 w-4 text-gray-500" />
      case 'CANCELLED':
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return null
    }
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      DRAFT: '작성중',
      SCHEDULED: '예약됨',
      SENDING: '발송중',
      COMPLETED: '완료',
      CANCELLED: '취소됨',
    }
    return labels[status] || status
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">캠페인 관리</h1>
          <p className="text-muted-foreground">메시지 캠페인을 생성하고 관리하세요</p>
        </div>
        <Link href="/dashboard/campaigns/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            새 캠페인
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">전체 캠페인</p>
            <p className="text-2xl font-bold">{campaigns.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">진행중</p>
            <p className="text-2xl font-bold text-yellow-500">
              {campaigns.filter((c) => c.status === 'SENDING').length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">예약됨</p>
            <p className="text-2xl font-bold text-blue-500">
              {campaigns.filter((c) => c.status === 'SCHEDULED').length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">완료</p>
            <p className="text-2xl font-bold text-green-500">
              {campaigns.filter((c) => c.status === 'COMPLETED').length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="캠페인 검색..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select
              options={statusOptions}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full sm:w-40"
            />
            <Select
              options={typeOptions}
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full sm:w-40"
            />
          </div>
        </CardContent>
      </Card>

      {/* Campaign List */}
      <div className="space-y-4">
        {filteredCampaigns.map((campaign) => (
          <Card key={campaign.id} className="transition-shadow hover:shadow-md">
            <CardContent className="p-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold">{campaign.name}</h3>
                    <Badge variant="outline">{getMessageTypeLabel(campaign.type)}</Badge>
                    <Badge className={getStatusColor(campaign.status)}>
                      {getStatusIcon(campaign.status)}
                      <span className="ml-1">{getStatusLabel(campaign.status)}</span>
                    </Badge>
                  </div>
                  <p className="line-clamp-2 text-sm text-muted-foreground">{campaign.content}</p>
                  {campaign.scheduledAt && (
                    <p className="text-sm text-muted-foreground">
                      <Clock className="mr-1 inline h-3 w-3" />
                      예약: {formatDateTime(campaign.scheduledAt)}
                    </p>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-6">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">발송</p>
                    <p className="font-semibold">{campaign.sentCount.toLocaleString()}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">수신</p>
                    <p className="font-semibold">{campaign.deliveredCount.toLocaleString()}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">클릭</p>
                    <p className="font-semibold">{campaign.clickCount.toLocaleString()}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">성공률</p>
                    <p className="font-semibold">
                      {campaign.sentCount > 0
                        ? Math.round((campaign.deliveredCount / campaign.sentCount) * 100)
                        : 0}
                      %
                    </p>
                  </div>

                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" title="상세보기">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" title="복제">
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" title="삭제">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredCampaigns.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Send className="h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 font-semibold">캠페인이 없습니다</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              새 캠페인을 생성하여 메시지를 발송해보세요
            </p>
            <Link href="/dashboard/campaigns/new" className="mt-4">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                새 캠페인 만들기
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
