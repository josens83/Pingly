'use client'

import { motion } from 'framer-motion'
import { Card, MetricCard, Button, Badge } from '@/components/primitives'
import { useSession } from 'next-auth/react'
import {
  MessageSquare,
  Users,
  Send,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Calendar,
  Clock,
  Target,
  Zap,
  ArrowRight,
  Sparkles,
  CheckCircle,
  Activity,
} from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

// Animation variants
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
}

const stagger = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const stats = [
  {
    name: '총 연락처',
    value: '1,234',
    change: { value: '+12%', type: 'positive' as const },
    icon: Users,
    color: 'pingly',
  },
  {
    name: '이번 달 발송',
    value: '5,678',
    change: { value: '+23%', type: 'positive' as const },
    icon: Send,
    color: 'violet',
  },
  {
    name: '전송 성공률',
    value: '99.2%',
    change: { value: '+0.5%', type: 'positive' as const },
    icon: TrendingUp,
    color: 'mint',
  },
  {
    name: '남은 크레딧',
    value: '8,500',
    change: { value: '-15%', type: 'negative' as const },
    icon: MessageSquare,
    color: 'amber',
  },
]

const recentCampaigns = [
  {
    id: '1',
    name: '11월 프로모션',
    type: 'SMS',
    status: 'COMPLETED',
    sent: 1250,
    delivered: 1238,
    rate: '99%',
    date: '2024-11-20',
  },
  {
    id: '2',
    name: '신규 가입 혜택 안내',
    type: 'KAKAO',
    status: 'SENDING',
    sent: 500,
    delivered: 423,
    rate: '85%',
    date: '2024-11-22',
  },
  {
    id: '3',
    name: '이벤트 당첨자 안내',
    type: 'LMS',
    status: 'SCHEDULED',
    sent: 0,
    delivered: 0,
    rate: '-',
    date: '2024-11-25',
  },
]

const quickActions = [
  {
    name: '새 메시지 발송',
    description: 'SMS, 카카오톡 등 메시지 발송',
    href: '/dashboard/campaigns/new',
    icon: Send,
    color: 'bg-pingly-500',
  },
  {
    name: '연락처 가져오기',
    description: 'Excel, CSV 파일로 일괄 등록',
    href: '/dashboard/contacts/import',
    icon: Users,
    color: 'bg-violet-500',
  },
  {
    name: '크레딧 충전',
    description: '메시지 발송을 위한 크레딧 구매',
    href: '/dashboard/billing',
    icon: Zap,
    color: 'bg-mint-500',
  },
]

const statusConfig = {
  COMPLETED: { label: '완료', color: 'success' as const, icon: CheckCircle },
  SENDING: { label: '발송중', color: 'warning' as const, icon: Activity },
  SCHEDULED: { label: '예약됨', color: 'info' as const, icon: Clock },
}

const typeColors = {
  SMS: 'bg-pingly-100 text-pingly-700',
  KAKAO: 'bg-amber-100 text-amber-700',
  LMS: 'bg-violet-100 text-violet-700',
  MMS: 'bg-rose-100 text-rose-700',
}

export default function DashboardPage() {
  const { data: session } = useSession()
  const currentHour = new Date().getHours()
  const greeting = currentHour < 12 ? '좋은 아침이에요' : currentHour < 18 ? '안녕하세요' : '좋은 저녁이에요'

  return (
    <motion.div
      className="space-y-6"
      initial="initial"
      animate="animate"
      variants={stagger}
    >
      {/* Welcome Header */}
      <motion.div
        variants={fadeInUp}
        className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold">
            {greeting}, <span className="bg-gradient-to-r from-pingly-600 to-violet-600 bg-clip-text text-transparent">{session?.user?.name || '사용자'}</span>님!
          </h1>
          <p className="text-muted-foreground mt-1">오늘의 메시지 마케팅 현황입니다</p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/campaigns/new">
            <Button leftIcon={<Plus className="h-4 w-4" />}>
              새 캠페인
            </Button>
          </Link>
        </div>
      </motion.div>

      {/* AI Insights Banner */}
      <motion.div variants={fadeInUp}>
        <Card variant="gradient" className="p-4 sm:p-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-pingly-500/90 to-violet-500/90" />
          <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-white">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold">AI 인사이트</h3>
                <p className="text-sm text-white/80 mt-0.5">
                  오늘 오후 2시에 발송하면 평균 32% 더 높은 오픈율을 기대할 수 있어요.
                </p>
              </div>
            </div>
            <Button variant="secondary" size="sm" className="bg-white text-pingly-600 hover:bg-white/90 shrink-0">
              자세히 보기
            </Button>
          </div>
        </Card>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        variants={fadeInUp}
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        {stats.map((stat, i) => (
          <motion.div
            key={stat.name}
            variants={fadeInUp}
            custom={i}
          >
            <MetricCard
              title={stat.name}
              value={stat.value}
              change={stat.change}
              icon={<stat.icon className="h-5 w-5" />}
              trend={
                stat.change.type === 'positive' ? (
                  <ArrowUpRight className="h-3 w-3" />
                ) : (
                  <ArrowDownRight className="h-3 w-3" />
                )
              }
            />
          </motion.div>
        ))}
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Campaigns */}
        <motion.div variants={fadeInUp} className="lg:col-span-2">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold">최근 캠페인</h2>
                <p className="text-sm text-muted-foreground">최근 실행된 캠페인 목록</p>
              </div>
              <Link href="/dashboard/campaigns">
                <Button variant="ghost" size="sm" rightIcon={<ArrowRight className="h-4 w-4" />}>
                  전체 보기
                </Button>
              </Link>
            </div>

            <div className="space-y-3">
              {recentCampaigns.map((campaign, i) => {
                const status = statusConfig[campaign.status as keyof typeof statusConfig]
                const StatusIcon = status.icon

                return (
                  <motion.div
                    key={campaign.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="group flex items-center justify-between rounded-xl border p-4 hover:bg-muted/50 hover:border-primary/20 transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        'h-10 w-10 rounded-lg flex items-center justify-center',
                        typeColors[campaign.type as keyof typeof typeColors]
                      )}>
                        <Send className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium group-hover:text-primary transition-colors">
                          {campaign.name}
                        </p>
                        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                          <Badge variant="secondary" size="sm">
                            {campaign.type}
                          </Badge>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {campaign.date}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right hidden sm:block">
                        <p className="text-sm font-medium">
                          {campaign.delivered.toLocaleString()} / {campaign.sent.toLocaleString()}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          성공률 {campaign.rate}
                        </p>
                      </div>
                      <Badge
                        variant={status.color}
                        icon={<StatusIcon className="h-3 w-3" />}
                      >
                        {status.label}
                      </Badge>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </Card>
        </motion.div>

        {/* Quick Actions */}
        <motion.div variants={fadeInUp}>
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-2">빠른 실행</h2>
            <p className="text-sm text-muted-foreground mb-6">자주 사용하는 기능</p>

            <div className="space-y-3">
              {quickActions.map((action, i) => (
                <Link key={action.name} href={action.href} className="block">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + i * 0.1 }}
                    className="group flex items-center gap-4 rounded-xl border p-4 hover:bg-muted/50 hover:border-primary/20 transition-all"
                  >
                    <div className={cn(
                      'h-10 w-10 rounded-lg flex items-center justify-center text-white',
                      action.color
                    )}>
                      <action.icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium group-hover:text-primary transition-colors">
                        {action.name}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {action.description}
                      </p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                  </motion.div>
                </Link>
              ))}
            </div>

            {/* Activity chart placeholder */}
            <div className="mt-6 pt-6 border-t">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium">이번 주 활동</h3>
                <Badge variant="secondary" size="sm">
                  +23%
                </Badge>
              </div>
              <div className="flex items-end justify-between h-20 gap-1">
                {[40, 65, 45, 80, 55, 70, 50].map((height, i) => (
                  <motion.div
                    key={i}
                    className="flex-1 bg-gradient-to-t from-pingly-500 to-violet-500 rounded-t"
                    initial={{ height: 0 }}
                    animate={{ height: `${height}%` }}
                    transition={{ delay: 0.5 + i * 0.1, duration: 0.5 }}
                  />
                ))}
              </div>
              <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                <span>월</span>
                <span>화</span>
                <span>수</span>
                <span>목</span>
                <span>금</span>
                <span>토</span>
                <span>일</span>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Bottom Section */}
      <motion.div variants={fadeInUp} className="grid gap-6 lg:grid-cols-2">
        {/* Performance Overview */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-6">채널별 성과</h2>
          <div className="space-y-4">
            {[
              { channel: 'SMS', sent: 3420, rate: 98.5, color: 'pingly' },
              { channel: '카카오 알림톡', sent: 1890, rate: 99.2, color: 'amber' },
              { channel: 'LMS', sent: 368, rate: 97.8, color: 'violet' },
            ].map((item, i) => (
              <div key={item.channel}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">{item.channel}</span>
                  <span className="text-sm text-muted-foreground">
                    {item.sent.toLocaleString()}건 • {item.rate}%
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                  <motion.div
                    className={cn(
                      'h-full rounded-full',
                      item.color === 'pingly' && 'bg-pingly-500',
                      item.color === 'amber' && 'bg-amber-500',
                      item.color === 'violet' && 'bg-violet-500'
                    )}
                    initial={{ width: 0 }}
                    animate={{ width: `${item.rate}%` }}
                    transition={{ delay: 0.3 + i * 0.2, duration: 0.8 }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Upcoming */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-6">예정된 캠페인</h2>
          <div className="space-y-4">
            {[
              { name: '블랙프라이데이 안내', time: '오늘 오후 2:00', recipients: 2500 },
              { name: '신제품 출시 알림', time: '내일 오전 10:00', recipients: 1800 },
              { name: '월간 뉴스레터', time: '11/28 오전 9:00', recipients: 3200 },
            ].map((item) => (
              <div
                key={item.name}
                className="flex items-center gap-4 p-3 rounded-lg bg-muted/50"
              >
                <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-pingly-100 to-violet-100 flex items-center justify-center text-pingly-600">
                  <Target className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{item.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.time} • {item.recipients.toLocaleString()}명
                  </p>
                </div>
                <Button variant="ghost" size="icon-sm">
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </Card>
      </motion.div>
    </motion.div>
  )
}
