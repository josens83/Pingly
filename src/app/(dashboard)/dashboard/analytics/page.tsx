'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Send,
  CheckCircle,
  XCircle,
  MousePointer,
  Users,
  Calendar,
  Download,
} from 'lucide-react'

const periodOptions = [
  { value: '7d', label: '지난 7일' },
  { value: '30d', label: '지난 30일' },
  { value: '90d', label: '지난 90일' },
  { value: 'year', label: '올해' },
]

const stats = [
  {
    name: '총 발송',
    value: '45,231',
    change: '+12.5%',
    changeType: 'positive',
    icon: Send,
  },
  {
    name: '전송 성공',
    value: '44,892',
    change: '+13.2%',
    changeType: 'positive',
    icon: CheckCircle,
  },
  {
    name: '전송 실패',
    value: '339',
    change: '-5.4%',
    changeType: 'positive',
    icon: XCircle,
  },
  {
    name: '클릭 수',
    value: '12,543',
    change: '+8.7%',
    changeType: 'positive',
    icon: MousePointer,
  },
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
  { name: '신규 가입 안내', type: 'KAKAO_ALIMTALK', sent: 3800, clickRate: 35.2 },
  { name: '장바구니 리마인드', type: 'LMS', sent: 2100, clickRate: 42.1 },
  { name: '배송 완료 알림', type: 'KAKAO_ALIMTALK', sent: 4500, clickRate: 15.8 },
  { name: '회원 등급 안내', type: 'SMS', sent: 1800, clickRate: 22.3 },
]

export default function AnalyticsPage() {
  const [period, setPeriod] = useState('30d')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">분석 대시보드</h1>
          <p className="text-muted-foreground">메시지 발송 현황과 성과를 분석하세요</p>
        </div>
        <div className="flex gap-2">
          <Select
            options={periodOptions}
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="w-40"
          />
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            리포트 다운로드
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.name}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.name}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="flex items-center text-xs">
                {stat.changeType === 'positive' ? (
                  <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
                ) : (
                  <TrendingDown className="mr-1 h-3 w-3 text-red-500" />
                )}
                <span
                  className={stat.changeType === 'positive' ? 'text-green-500' : 'text-red-500'}
                >
                  {stat.change}
                </span>
                <span className="ml-1 text-muted-foreground">전월 대비</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Delivery Trend Chart */}
        <Card>
          <CardHeader>
            <CardTitle>발송 추이</CardTitle>
            <CardDescription>일별 메시지 발송 현황</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex h-64 items-end justify-between gap-2">
              {Array.from({ length: 14 }).map((_, i) => (
                <div key={i} className="flex flex-1 flex-col items-center gap-1">
                  <div
                    className="w-full rounded-t bg-primary"
                    style={{ height: `${Math.random() * 150 + 50}px` }}
                  />
                  <span className="text-xs text-muted-foreground">{i + 1}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 flex items-center justify-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded bg-primary" />
                <span>발송</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded bg-green-500" />
                <span>성공</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Channel Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>채널별 분포</CardTitle>
            <CardDescription>메시지 유형별 발송 비율</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {channelStats.map((channel) => (
                <div key={channel.channel} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{channel.channel}</span>
                    <span className="text-muted-foreground">
                      {channel.sent.toLocaleString()}건 ({channel.rate}%)
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${(channel.sent / 25000) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Stats */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Channel Performance */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>채널별 성과</CardTitle>
            <CardDescription>각 채널의 상세 성과 지표</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-left text-sm text-muted-foreground">
                    <th className="pb-3 font-medium">채널</th>
                    <th className="pb-3 font-medium">발송</th>
                    <th className="pb-3 font-medium">전송 성공</th>
                    <th className="pb-3 font-medium">클릭</th>
                    <th className="pb-3 font-medium">성공률</th>
                    <th className="pb-3 font-medium">클릭률</th>
                  </tr>
                </thead>
                <tbody>
                  {channelStats.map((channel) => (
                    <tr key={channel.channel} className="border-b">
                      <td className="py-3 font-medium">{channel.channel}</td>
                      <td className="py-3">{channel.sent.toLocaleString()}</td>
                      <td className="py-3">{channel.delivered.toLocaleString()}</td>
                      <td className="py-3">{channel.clicked.toLocaleString()}</td>
                      <td className="py-3">
                        <Badge variant="success">{channel.rate}%</Badge>
                      </td>
                      <td className="py-3">
                        <Badge variant="info">
                          {((channel.clicked / channel.delivered) * 100).toFixed(1)}%
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Top Campaigns */}
        <Card>
          <CardHeader>
            <CardTitle>인기 캠페인</CardTitle>
            <CardDescription>클릭률 기준 상위 캠페인</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topCampaigns.map((campaign, index) => (
                <div key={campaign.name} className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-sm font-medium">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{campaign.name}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Badge variant="outline" className="text-xs">
                        {campaign.type}
                      </Badge>
                      <span>{campaign.sent.toLocaleString()}건</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-green-600">{campaign.clickRate}%</p>
                    <p className="text-xs text-muted-foreground">클릭률</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Engagement Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>주요 지표 요약</CardTitle>
          <CardDescription>기간 내 핵심 성과 지표</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg bg-muted p-4 text-center">
              <p className="text-sm text-muted-foreground">평균 전송 성공률</p>
              <p className="mt-1 text-3xl font-bold text-green-600">99.2%</p>
              <p className="text-xs text-muted-foreground">업계 평균 97.5%</p>
            </div>
            <div className="rounded-lg bg-muted p-4 text-center">
              <p className="text-sm text-muted-foreground">평균 클릭률</p>
              <p className="mt-1 text-3xl font-bold text-blue-600">27.8%</p>
              <p className="text-xs text-muted-foreground">업계 평균 19.2%</p>
            </div>
            <div className="rounded-lg bg-muted p-4 text-center">
              <p className="text-sm text-muted-foreground">수신거부율</p>
              <p className="mt-1 text-3xl font-bold text-yellow-600">0.3%</p>
              <p className="text-xs text-muted-foreground">업계 평균 0.8%</p>
            </div>
            <div className="rounded-lg bg-muted p-4 text-center">
              <p className="text-sm text-muted-foreground">크레딧당 ROI</p>
              <p className="mt-1 text-3xl font-bold text-purple-600">₩2,450</p>
              <p className="text-xs text-muted-foreground">전월 대비 +15%</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
