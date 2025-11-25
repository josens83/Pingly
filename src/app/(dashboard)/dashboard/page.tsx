import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  MessageSquare,
  Users,
  Send,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Calendar,
} from 'lucide-react'
import Link from 'next/link'

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  const stats = [
    {
      name: '총 연락처',
      value: '1,234',
      change: '+12%',
      changeType: 'positive',
      icon: Users,
    },
    {
      name: '이번 달 발송',
      value: '5,678',
      change: '+23%',
      changeType: 'positive',
      icon: Send,
    },
    {
      name: '전송 성공률',
      value: '99.2%',
      change: '+0.5%',
      changeType: 'positive',
      icon: TrendingUp,
    },
    {
      name: '남은 크레딧',
      value: '8,500',
      change: '-15%',
      changeType: 'negative',
      icon: MessageSquare,
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
      date: '2024-11-20',
    },
    {
      id: '2',
      name: '신규 가입 혜택 안내',
      type: 'KAKAO_ALIMTALK',
      status: 'SENDING',
      sent: 500,
      delivered: 423,
      date: '2024-11-22',
    },
    {
      id: '3',
      name: '이벤트 당첨자 안내',
      type: 'LMS',
      status: 'SCHEDULED',
      sent: 0,
      delivered: 0,
      date: '2024-11-25',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            안녕하세요, {session?.user?.name || '사용자'}님!
          </h1>
          <p className="text-muted-foreground">오늘의 메시지 마케팅 현황입니다</p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/campaigns/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              새 캠페인
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
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
                  <ArrowUpRight className="mr-1 h-3 w-3 text-green-500" />
                ) : (
                  <ArrowDownRight className="mr-1 h-3 w-3 text-red-500" />
                )}
                <span
                  className={
                    stat.changeType === 'positive' ? 'text-green-500' : 'text-red-500'
                  }
                >
                  {stat.change}
                </span>
                <span className="ml-1 text-muted-foreground">지난달 대비</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Campaigns & Quick Actions */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>최근 캠페인</CardTitle>
                <CardDescription>최근 실행된 캠페인 목록입니다</CardDescription>
              </div>
              <Link href="/dashboard/campaigns">
                <Button variant="outline" size="sm">
                  전체 보기
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentCampaigns.map((campaign) => (
                <div
                  key={campaign.id}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div className="space-y-1">
                    <p className="font-medium">{campaign.name}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span className="rounded bg-muted px-1.5 py-0.5 text-xs">
                        {campaign.type}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {campaign.date}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      {campaign.delivered.toLocaleString()} / {campaign.sent.toLocaleString()}
                    </p>
                    <p
                      className={`text-xs ${
                        campaign.status === 'COMPLETED'
                          ? 'text-green-500'
                          : campaign.status === 'SENDING'
                          ? 'text-yellow-500'
                          : 'text-blue-500'
                      }`}
                    >
                      {campaign.status === 'COMPLETED'
                        ? '완료'
                        : campaign.status === 'SENDING'
                        ? '발송중'
                        : '예약됨'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>빠른 실행</CardTitle>
            <CardDescription>자주 사용하는 기능에 빠르게 접근하세요</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/dashboard/campaigns/new" className="block">
              <Button variant="outline" className="w-full justify-start">
                <Send className="mr-2 h-4 w-4" />
                새 메시지 발송
              </Button>
            </Link>
            <Link href="/dashboard/contacts/import" className="block">
              <Button variant="outline" className="w-full justify-start">
                <Users className="mr-2 h-4 w-4" />
                연락처 가져오기
              </Button>
            </Link>
            <Link href="/dashboard/billing" className="block">
              <Button variant="outline" className="w-full justify-start">
                <MessageSquare className="mr-2 h-4 w-4" />
                크레딧 충전
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
