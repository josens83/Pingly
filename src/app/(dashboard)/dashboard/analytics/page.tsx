'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Card,
  MetricCard,
  Button,
  Badge,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/primitives'
import {
  Send,
  CheckCircle,
  XCircle,
  MousePointer,
  Download,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
} from 'lucide-react'
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { cn } from '@/lib/utils'

// Animation variants
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
}

const stagger = {
  animate: { transition: { staggerChildren: 0.05 } },
}

// Sample data for charts
const dailyData = [
  { date: '11/10', sent: 3200, delivered: 3150, clicked: 890 },
  { date: '11/11', sent: 4100, delivered: 4050, clicked: 1120 },
  { date: '11/12', sent: 3800, delivered: 3750, clicked: 980 },
  { date: '11/13', sent: 4500, delivered: 4420, clicked: 1350 },
  { date: '11/14', sent: 3900, delivered: 3850, clicked: 1050 },
  { date: '11/15', sent: 2800, delivered: 2760, clicked: 720 },
  { date: '11/16', sent: 2400, delivered: 2380, clicked: 650 },
  { date: '11/17', sent: 4200, delivered: 4150, clicked: 1180 },
  { date: '11/18', sent: 4800, delivered: 4720, clicked: 1420 },
  { date: '11/19', sent: 5100, delivered: 5020, clicked: 1580 },
  { date: '11/20', sent: 4600, delivered: 4530, clicked: 1290 },
  { date: '11/21', sent: 4300, delivered: 4250, clicked: 1150 },
  { date: '11/22', sent: 3100, delivered: 3050, clicked: 820 },
  { date: '11/23', sent: 2900, delivered: 2860, clicked: 760 },
]

const channelData = [
  { name: 'SMS', value: 25000, color: '#3B82F6' },
  { name: 'LMS', value: 8500, color: '#8B5CF6' },
  { name: 'MMS', value: 3200, color: '#EC4899' },
  { name: '알림톡', value: 5800, color: '#F59E0B' },
  { name: '친구톡', value: 2731, color: '#FBBF24' },
]

const hourlyData = [
  { hour: '00', value: 120 },
  { hour: '01', value: 80 },
  { hour: '02', value: 45 },
  { hour: '03', value: 30 },
  { hour: '04', value: 25 },
  { hour: '05', value: 40 },
  { hour: '06', value: 180 },
  { hour: '07', value: 420 },
  { hour: '08', value: 680 },
  { hour: '09', value: 850 },
  { hour: '10', value: 920 },
  { hour: '11', value: 780 },
  { hour: '12', value: 650 },
  { hour: '13', value: 720 },
  { hour: '14', value: 890 },
  { hour: '15', value: 780 },
  { hour: '16', value: 650 },
  { hour: '17', value: 580 },
  { hour: '18', value: 720 },
  { hour: '19', value: 850 },
  { hour: '20', value: 680 },
  { hour: '21', value: 450 },
  { hour: '22', value: 280 },
  { hour: '23', value: 180 },
]

const channelStats = [
  { channel: 'SMS', sent: 25000, delivered: 24850, clicked: 6200, rate: 99.4 },
  { channel: 'LMS', sent: 8500, delivered: 8420, clicked: 2100, rate: 99.1 },
  { channel: 'MMS', sent: 3200, delivered: 3150, clicked: 945, rate: 98.4 },
  { channel: '카카오 알림톡', sent: 5800, delivered: 5750, clicked: 2300, rate: 99.1 },
  { channel: '카카오 친구톡', sent: 2731, delivered: 2722, clicked: 998, rate: 99.7 },
]

const topCampaigns = [
  { name: '11월 프로모션', type: 'SMS', sent: 5200, clickRate: 28.5 },
  { name: '신규 가입 안내', type: 'KAKAO', sent: 3800, clickRate: 35.2 },
  { name: '장바구니 리마인드', type: 'LMS', sent: 2100, clickRate: 42.1 },
  { name: '배송 완료 알림', type: 'KAKAO', sent: 4500, clickRate: 15.8 },
  { name: '회원 등급 안내', type: 'SMS', sent: 1800, clickRate: 22.3 },
]

const typeColors: Record<string, string> = {
  SMS: 'bg-pingly-100 text-pingly-700',
  LMS: 'bg-violet-100 text-violet-700',
  KAKAO: 'bg-amber-100 text-amber-700',
  MMS: 'bg-rose-100 text-rose-700',
}

// Custom tooltip for charts
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border bg-card p-3 shadow-lg">
        <p className="font-medium text-sm mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <div
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-muted-foreground">{entry.name}:</span>
            <span className="font-medium">{entry.value.toLocaleString()}</span>
          </div>
        ))}
      </div>
    )
  }
  return null
}

export default function AnalyticsPage() {
  const [period, setPeriod] = useState('30d')

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
          <h1 className="text-2xl font-bold">분석 대시보드</h1>
          <p className="text-muted-foreground mt-1">메시지 발송 현황과 성과를 분석하세요</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-36">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">지난 7일</SelectItem>
              <SelectItem value="30d">지난 30일</SelectItem>
              <SelectItem value="90d">지난 90일</SelectItem>
              <SelectItem value="year">올해</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" leftIcon={<Download className="h-4 w-4" />}>
            리포트 다운로드
          </Button>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div variants={fadeInUp} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="총 발송"
          value="45,231"
          icon={<Send className="h-5 w-5" />}
          change={{ value: '+12.5%', type: 'positive' }}
          trend={<ArrowUpRight className="h-3 w-3" />}
        />
        <MetricCard
          title="전송 성공"
          value="44,892"
          icon={<CheckCircle className="h-5 w-5" />}
          change={{ value: '+13.2%', type: 'positive' }}
          trend={<ArrowUpRight className="h-3 w-3" />}
        />
        <MetricCard
          title="전송 실패"
          value="339"
          icon={<XCircle className="h-5 w-5" />}
          change={{ value: '-5.4%', type: 'positive' }}
          trend={<ArrowDownRight className="h-3 w-3" />}
        />
        <MetricCard
          title="클릭 수"
          value="12,543"
          icon={<MousePointer className="h-5 w-5" />}
          change={{ value: '+8.7%', type: 'positive' }}
          trend={<ArrowUpRight className="h-3 w-3" />}
        />
      </motion.div>

      {/* AI Insight */}
      <motion.div variants={fadeInUp}>
        <Card className="p-4 bg-gradient-to-r from-pingly-50 to-violet-50 dark:from-pingly-950/50 dark:to-violet-950/50 border-pingly-200">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-pingly-500 to-violet-500 flex items-center justify-center shrink-0">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-pingly-700 dark:text-pingly-300">AI 인사이트</p>
              <p className="mt-1 text-sm text-muted-foreground">
                이번 주 클릭률이 전주 대비 8.7% 상승했습니다. 특히 <strong>오후 2시~3시</strong> 발송 메시지의 클릭률이 가장 높았어요.
                이 시간대에 발송을 집중하면 더 좋은 성과를 기대할 수 있습니다.
              </p>
            </div>
            <Button variant="outline" size="sm" className="shrink-0">
              자세히 보기
            </Button>
          </div>
        </Card>
      </motion.div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Delivery Trend Chart */}
        <motion.div variants={fadeInUp}>
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold">발송 추이</h2>
                <p className="text-sm text-muted-foreground">일별 메시지 발송 현황</p>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-pingly-500" />
                  <span className="text-muted-foreground">발송</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-violet-500" />
                  <span className="text-muted-foreground">클릭</span>
                </div>
              </div>
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dailyData}>
                  <defs>
                    <linearGradient id="colorSent" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorClicked" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="date" className="text-xs" tick={{ fill: 'currentColor' }} />
                  <YAxis className="text-xs" tick={{ fill: 'currentColor' }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="sent"
                    name="발송"
                    stroke="#3B82F6"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorSent)"
                  />
                  <Area
                    type="monotone"
                    dataKey="clicked"
                    name="클릭"
                    stroke="#8B5CF6"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorClicked)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </motion.div>

        {/* Channel Distribution */}
        <motion.div variants={fadeInUp}>
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold">채널별 분포</h2>
                <p className="text-sm text-muted-foreground">메시지 유형별 발송 비율</p>
              </div>
            </div>
            <div className="flex items-center gap-8">
              <div className="h-64 w-64 shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={channelData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {channelData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-1 space-y-3">
                {channelData.map((item) => (
                  <div key={item.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-sm font-medium">{item.name}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {item.value.toLocaleString()}건
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Hourly Distribution */}
      <motion.div variants={fadeInUp}>
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold">시간대별 발송량</h2>
              <p className="text-sm text-muted-foreground">24시간 기준 메시지 발송 패턴</p>
            </div>
            <Badge variant="pingly">최적 시간: 오후 2시</Badge>
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hourlyData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" vertical={false} />
                <XAxis dataKey="hour" className="text-xs" tick={{ fill: 'currentColor' }} />
                <YAxis className="text-xs" tick={{ fill: 'currentColor' }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" name="발송량" radius={[4, 4, 0, 0]}>
                  {hourlyData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.hour === '14' ? '#3B82F6' : '#E5E7EB'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </motion.div>

      {/* Detailed Stats */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Channel Performance Table */}
        <motion.div variants={fadeInUp} className="lg:col-span-2">
          <Card className="p-6">
            <div className="mb-6">
              <h2 className="text-lg font-semibold">채널별 성과</h2>
              <p className="text-sm text-muted-foreground">각 채널의 상세 성과 지표</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-left text-sm text-muted-foreground">
                    <th className="pb-3 font-medium">채널</th>
                    <th className="pb-3 font-medium text-right">발송</th>
                    <th className="pb-3 font-medium text-right">전송 성공</th>
                    <th className="pb-3 font-medium text-right">클릭</th>
                    <th className="pb-3 font-medium text-right">성공률</th>
                    <th className="pb-3 font-medium text-right">클릭률</th>
                  </tr>
                </thead>
                <tbody>
                  {channelStats.map((channel) => (
                    <tr key={channel.channel} className="border-b last:border-0">
                      <td className="py-4 font-medium">{channel.channel}</td>
                      <td className="py-4 text-right tabular-nums">{channel.sent.toLocaleString()}</td>
                      <td className="py-4 text-right tabular-nums">{channel.delivered.toLocaleString()}</td>
                      <td className="py-4 text-right tabular-nums">{channel.clicked.toLocaleString()}</td>
                      <td className="py-4 text-right">
                        <Badge variant="success" size="sm">{channel.rate}%</Badge>
                      </td>
                      <td className="py-4 text-right">
                        <Badge variant="info" size="sm">
                          {((channel.clicked / channel.delivered) * 100).toFixed(1)}%
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </motion.div>

        {/* Top Campaigns */}
        <motion.div variants={fadeInUp}>
          <Card className="p-6">
            <div className="mb-6">
              <h2 className="text-lg font-semibold">인기 캠페인</h2>
              <p className="text-sm text-muted-foreground">클릭률 기준 상위 캠페인</p>
            </div>
            <div className="space-y-4">
              {topCampaigns.map((campaign, index) => (
                <motion.div
                  key={campaign.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors cursor-pointer"
                >
                  <div className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold',
                    index === 0 ? 'bg-gradient-to-br from-amber-400 to-amber-600 text-white' :
                    index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-500 text-white' :
                    index === 2 ? 'bg-gradient-to-br from-amber-600 to-amber-800 text-white' :
                    'bg-muted text-muted-foreground'
                  )}>
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{campaign.name}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Badge variant="secondary" size="sm" className={typeColors[campaign.type]}>
                        {campaign.type}
                      </Badge>
                      <span>{campaign.sent.toLocaleString()}건</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-mint-600">{campaign.clickRate}%</p>
                    <p className="text-xs text-muted-foreground">클릭률</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Key Metrics Summary */}
      <motion.div variants={fadeInUp}>
        <Card className="p-6">
          <div className="mb-6">
            <h2 className="text-lg font-semibold">주요 지표 요약</h2>
            <p className="text-sm text-muted-foreground">기간 내 핵심 성과 지표</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="p-6 rounded-xl bg-gradient-to-br from-mint-50 to-mint-100 dark:from-mint-950/50 dark:to-mint-900/50 border border-mint-200 text-center"
            >
              <p className="text-sm text-mint-700 dark:text-mint-300">평균 전송 성공률</p>
              <p className="mt-2 text-4xl font-bold text-mint-600">99.2%</p>
              <div className="mt-2 flex items-center justify-center gap-1 text-xs text-mint-600">
                <ArrowUpRight className="h-3 w-3" />
                <span>업계 평균 97.5%</span>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              className="p-6 rounded-xl bg-gradient-to-br from-pingly-50 to-pingly-100 dark:from-pingly-950/50 dark:to-pingly-900/50 border border-pingly-200 text-center"
            >
              <p className="text-sm text-pingly-700 dark:text-pingly-300">평균 클릭률</p>
              <p className="mt-2 text-4xl font-bold text-pingly-600">27.8%</p>
              <div className="mt-2 flex items-center justify-center gap-1 text-xs text-pingly-600">
                <ArrowUpRight className="h-3 w-3" />
                <span>업계 평균 19.2%</span>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              className="p-6 rounded-xl bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950/50 dark:to-amber-900/50 border border-amber-200 text-center"
            >
              <p className="text-sm text-amber-700 dark:text-amber-300">수신거부율</p>
              <p className="mt-2 text-4xl font-bold text-amber-600">0.3%</p>
              <div className="mt-2 flex items-center justify-center gap-1 text-xs text-amber-600">
                <ArrowDownRight className="h-3 w-3" />
                <span>업계 평균 0.8%</span>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              className="p-6 rounded-xl bg-gradient-to-br from-violet-50 to-violet-100 dark:from-violet-950/50 dark:to-violet-900/50 border border-violet-200 text-center"
            >
              <p className="text-sm text-violet-700 dark:text-violet-300">크레딧당 ROI</p>
              <p className="mt-2 text-4xl font-bold text-violet-600">₩2,450</p>
              <div className="mt-2 flex items-center justify-center gap-1 text-xs text-violet-600">
                <ArrowUpRight className="h-3 w-3" />
                <span>전월 대비 +15%</span>
              </div>
            </motion.div>
          </div>
        </Card>
      </motion.div>
    </motion.div>
  )
}
