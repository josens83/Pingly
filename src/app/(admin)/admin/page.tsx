import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import {
  Users,
  Building,
  MessageSquare,
  CreditCard,
  BarChart3,
  Settings,
  AlertTriangle,
  TrendingUp,
  DollarSign,
} from 'lucide-react'

export default async function AdminPage() {
  const session = await getServerSession(authOptions)

  // 관리자 권한 체크
  if (!session || session.user.role !== 'ADMIN') {
    redirect('/dashboard')
  }

  const stats = [
    { name: '총 사용자', value: '1,234', change: '+12%', icon: Users },
    { name: '총 조직', value: '456', change: '+8%', icon: Building },
    { name: '오늘 발송량', value: '125,432', change: '+23%', icon: MessageSquare },
    { name: '이번 달 매출', value: '₩45,230,000', change: '+15%', icon: DollarSign },
  ]

  const recentOrganizations = [
    { id: '1', name: '테크컴퍼니', plan: 'Professional', users: 5, messages: 12500 },
    { id: '2', name: '디자인스튜디오', plan: 'Starter', users: 2, messages: 3200 },
    { id: '3', name: '쇼핑몰A', plan: 'Enterprise', users: 15, messages: 45000 },
  ]

  const systemAlerts = [
    { type: 'warning', message: 'SMS 게이트웨이 지연 발생 중', time: '5분 전' },
    { type: 'info', message: '새로운 버전 배포 예정 (v2.1.0)', time: '1시간 전' },
    { type: 'error', message: '결제 처리 오류 3건 발생', time: '2시간 전' },
  ]

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Admin Header */}
      <header className="sticky top-0 z-50 border-b bg-background">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="flex items-center gap-2 font-bold">
              <MessageSquare className="h-6 w-6 text-primary" />
              Pingly Admin
            </Link>
          </div>
          <nav className="flex items-center gap-4">
            <Link href="/admin/users" className="text-sm text-muted-foreground hover:text-foreground">
              사용자
            </Link>
            <Link href="/admin/organizations" className="text-sm text-muted-foreground hover:text-foreground">
              조직
            </Link>
            <Link href="/admin/messages" className="text-sm text-muted-foreground hover:text-foreground">
              메시지
            </Link>
            <Link href="/admin/billing" className="text-sm text-muted-foreground hover:text-foreground">
              결제
            </Link>
            <Link href="/admin/settings" className="text-sm text-muted-foreground hover:text-foreground">
              설정
            </Link>
            <Link href="/dashboard">
              <Button variant="outline" size="sm">
                대시보드로
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-7xl p-6">
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold">관리자 대시보드</h1>
            <p className="text-muted-foreground">시스템 현황을 한눈에 확인하세요</p>
          </div>

          {/* Stats */}
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
                  <p className="text-xs text-green-500">{stat.change} 전월 대비</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Recent Organizations */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>최근 등록 조직</CardTitle>
                <CardDescription>최근 가입한 조직 목록</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentOrganizations.map((org) => (
                    <div
                      key={org.id}
                      className="flex items-center justify-between rounded-lg border p-4"
                    >
                      <div>
                        <p className="font-medium">{org.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {org.plan} • {org.users}명 • {org.messages.toLocaleString()} 메시지
                        </p>
                      </div>
                      <Button variant="outline" size="sm">
                        상세
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* System Alerts */}
            <Card>
              <CardHeader>
                <CardTitle>시스템 알림</CardTitle>
                <CardDescription>중요 알림 사항</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {systemAlerts.map((alert, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <AlertTriangle
                        className={`h-5 w-5 ${
                          alert.type === 'error'
                            ? 'text-red-500'
                            : alert.type === 'warning'
                            ? 'text-yellow-500'
                            : 'text-blue-500'
                        }`}
                      />
                      <div>
                        <p className="text-sm">{alert.message}</p>
                        <p className="text-xs text-muted-foreground">{alert.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>빠른 실행</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Button variant="outline" className="h-auto flex-col gap-2 p-4">
                  <Users className="h-6 w-6" />
                  <span>사용자 관리</span>
                </Button>
                <Button variant="outline" className="h-auto flex-col gap-2 p-4">
                  <Building className="h-6 w-6" />
                  <span>조직 관리</span>
                </Button>
                <Button variant="outline" className="h-auto flex-col gap-2 p-4">
                  <BarChart3 className="h-6 w-6" />
                  <span>통계 보기</span>
                </Button>
                <Button variant="outline" className="h-auto flex-col gap-2 p-4">
                  <Settings className="h-6 w-6" />
                  <span>시스템 설정</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
