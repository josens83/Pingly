'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Card,
  MetricCard,
  Button,
  Badge,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/primitives'
import { EmptyState } from '@/components/patterns'
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
  ArrowUpRight,
  Calendar,
  Target,
  TrendingUp,
  Zap,
  Users,
  BarChart3,
  ChevronDown,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// Animation variants
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
}

const stagger = {
  animate: { transition: { staggerChildren: 0.05 } },
}

const campaigns = [
  {
    id: '1',
    name: '11월 프로모션 캠페인',
    type: 'SMS',
    status: 'COMPLETED',
    content: '[Pingly] 11월 한정 특가! 전 상품 20% 할인 쿠폰을 지금 바로 받아가세요.',
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
    type: 'KAKAO',
    status: 'SENDING',
    content: '안녕하세요, {{name}}님! Pingly에 가입해주셔서 감사합니다.',
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
    content: '[Pingly] 12월 연말 이벤트가 곧 시작됩니다!',
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
    type: 'KAKAO',
    status: 'DRAFT',
    content: '{{name}}님, 장바구니에 담아두신 상품이 있어요!',
    totalRecipients: 0,
    sentCount: 0,
    deliveredCount: 0,
    clickCount: 0,
    scheduledAt: null,
    completedAt: null,
  },
]

const statusConfig = {
  DRAFT: { label: '작성중', color: 'secondary' as const, icon: Pause, bgColor: 'bg-muted' },
  SCHEDULED: { label: '예약됨', color: 'info' as const, icon: Clock, bgColor: 'bg-sky-100' },
  SENDING: { label: '발송중', color: 'warning' as const, icon: Send, bgColor: 'bg-amber-100' },
  COMPLETED: { label: '완료', color: 'success' as const, icon: CheckCircle, bgColor: 'bg-mint-100' },
  CANCELLED: { label: '취소됨', color: 'destructive' as const, icon: XCircle, bgColor: 'bg-rose-100' },
}

const typeConfig = {
  SMS: { label: 'SMS', color: 'bg-pingly-100 text-pingly-700' },
  LMS: { label: 'LMS', color: 'bg-violet-100 text-violet-700' },
  MMS: { label: 'MMS', color: 'bg-rose-100 text-rose-700' },
  KAKAO: { label: '카카오톡', color: 'bg-amber-100 text-amber-700' },
}

export default function CampaignsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [showFilters, setShowFilters] = useState(false)

  const filteredCampaigns = campaigns.filter((campaign) => {
    const matchesSearch = campaign.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || campaign.status === statusFilter
    const matchesType = typeFilter === 'all' || campaign.type === typeFilter
    return matchesSearch && matchesStatus && matchesType
  })

  const stats = {
    total: campaigns.length,
    sending: campaigns.filter(c => c.status === 'SENDING').length,
    scheduled: campaigns.filter(c => c.status === 'SCHEDULED').length,
    completed: campaigns.filter(c => c.status === 'COMPLETED').length,
  }

  return (
    <motion.div
      className="space-y-6"
      initial="initial"
      animate="animate"
      variants={stagger}
    >
      {/* Header */}
      <motion.div
        variants={fadeInUp}
        className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold">캠페인 관리</h1>
          <p className="text-muted-foreground mt-1">메시지 캠페인을 생성하고 관리하세요</p>
        </div>
        <Link href="/dashboard/campaigns/new">
          <Button leftIcon={<Plus className="h-4 w-4" />}>
            새 캠페인
          </Button>
        </Link>
      </motion.div>

      {/* Stats */}
      <motion.div variants={fadeInUp} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="전체 캠페인"
          value={stats.total.toString()}
          icon={<Target className="h-5 w-5" />}
        />
        <MetricCard
          title="진행중"
          value={stats.sending.toString()}
          icon={<Send className="h-5 w-5" />}
          change={{ value: '활성', type: 'positive' }}
        />
        <MetricCard
          title="예약됨"
          value={stats.scheduled.toString()}
          icon={<Clock className="h-5 w-5" />}
          change={{ value: '대기중', type: 'positive' }}
        />
        <MetricCard
          title="완료"
          value={stats.completed.toString()}
          icon={<CheckCircle className="h-5 w-5" />}
          change={{ value: '이번 달', type: 'positive' }}
        />
      </motion.div>

      {/* Search and Filters */}
      <motion.div variants={fadeInUp}>
        <Card className="p-4">
          <div className="flex flex-col gap-4 sm:flex-row">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="캠페인 검색..."
                variant="filled"
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Filter toggle on mobile */}
            <Button
              variant="outline"
              className="sm:hidden"
              onClick={() => setShowFilters(!showFilters)}
              leftIcon={<Filter className="h-4 w-4" />}
            >
              필터
              <ChevronDown className={cn("h-4 w-4 ml-2 transition-transform", showFilters && "rotate-180")} />
            </Button>

            {/* Filters */}
            <div className={cn(
              "flex flex-col sm:flex-row gap-2",
              !showFilters && "hidden sm:flex"
            )}>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-36">
                  <SelectValue placeholder="상태" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체 상태</SelectItem>
                  <SelectItem value="DRAFT">작성중</SelectItem>
                  <SelectItem value="SCHEDULED">예약됨</SelectItem>
                  <SelectItem value="SENDING">발송중</SelectItem>
                  <SelectItem value="COMPLETED">완료</SelectItem>
                </SelectContent>
              </Select>

              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full sm:w-36">
                  <SelectValue placeholder="유형" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체 유형</SelectItem>
                  <SelectItem value="SMS">SMS</SelectItem>
                  <SelectItem value="LMS">LMS</SelectItem>
                  <SelectItem value="KAKAO">카카오톡</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Campaign List */}
      <motion.div variants={fadeInUp} className="space-y-4">
        <AnimatePresence mode="popLayout">
          {filteredCampaigns.map((campaign, i) => {
            const status = statusConfig[campaign.status as keyof typeof statusConfig]
            const type = typeConfig[campaign.type as keyof typeof typeConfig]
            const StatusIcon = status.icon
            const successRate = campaign.sentCount > 0
              ? Math.round((campaign.deliveredCount / campaign.sentCount) * 100)
              : 0

            return (
              <motion.div
                key={campaign.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.05 }}
                layout
              >
                <Card
                  variant="default"
                  interactive
                  className="p-6 group"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    {/* Left: Campaign Info */}
                    <div className="flex items-start gap-4 flex-1">
                      <div className={cn(
                        'h-12 w-12 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110',
                        type.color
                      )}>
                        <Send className="h-6 w-6" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <h3 className="font-semibold group-hover:text-primary transition-colors">
                            {campaign.name}
                          </h3>
                          <Badge variant="secondary" size="sm">{type.label}</Badge>
                          <Badge
                            variant={status.color}
                            size="sm"
                            icon={<StatusIcon className="h-3 w-3" />}
                          >
                            {status.label}
                          </Badge>
                        </div>

                        <p className="text-sm text-muted-foreground line-clamp-1 mb-2">
                          {campaign.content}
                        </p>

                        {campaign.scheduledAt && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            예약: {new Date(campaign.scheduledAt).toLocaleString('ko-KR')}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right: Stats & Actions */}
                    <div className="flex flex-wrap items-center gap-6 lg:gap-8">
                      {/* Stats */}
                      <div className="flex gap-6">
                        <div className="text-center">
                          <p className="text-xs text-muted-foreground mb-0.5">발송</p>
                          <p className="font-semibold tabular-nums">{campaign.sentCount.toLocaleString()}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-muted-foreground mb-0.5">수신</p>
                          <p className="font-semibold tabular-nums">{campaign.deliveredCount.toLocaleString()}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-muted-foreground mb-0.5">클릭</p>
                          <p className="font-semibold tabular-nums">{campaign.clickCount.toLocaleString()}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-muted-foreground mb-0.5">성공률</p>
                          <p className={cn(
                            'font-semibold tabular-nums',
                            successRate >= 95 ? 'text-mint-600' : successRate >= 80 ? 'text-amber-600' : 'text-rose-600'
                          )}>
                            {successRate}%
                          </p>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon-sm" aria-label="상세보기">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon-sm" aria-label="복제">
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon-sm" aria-label="삭제" className="hover:text-rose-600">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Progress bar for sending campaigns */}
                  {campaign.status === 'SENDING' && (
                    <div className="mt-4 pt-4 border-t">
                      <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                        <span>발송 진행률</span>
                        <span>{Math.round((campaign.sentCount / campaign.totalRecipients) * 100)}%</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                        <motion.div
                          className="h-full bg-gradient-to-r from-pingly-500 to-violet-500 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${(campaign.sentCount / campaign.totalRecipients) * 100}%` }}
                          transition={{ duration: 0.8, ease: 'easeOut' }}
                        />
                      </div>
                    </div>
                  )}
                </Card>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </motion.div>

      {/* Empty State */}
      {filteredCampaigns.length === 0 && (
        <motion.div variants={fadeInUp}>
          <Card className="p-8">
            <EmptyState
              preset="campaigns"
              action={{
                label: '새 캠페인 만들기',
                onClick: () => window.location.href = '/dashboard/campaigns/new',
              }}
            />
          </Card>
        </motion.div>
      )}
    </motion.div>
  )
}
