import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Badge,
} from '@/components/primitives'
import Link from 'next/link'
import {
  Users,
  Building,
  MessageSquare,
  BarChart3,
  Settings,
  AlertTriangle,
  TrendingUp,
  DollarSign,
  ArrowUpRight,
  Bell,
  Info,
  AlertCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'

export default async function AdminPage() {
  const session = await getServerSession(authOptions)

  // 관리자 권한 체크
  if (!session || session.user.role !== 'ADMIN') {
    redirect('/dashboard')
  }

  const stats = [
    { name: '총 사용자', value: '1,234', change: '+12%', trend: 'up', icon: Users, color: 'pingly' },
    { name: '총 조직', value: '456', change: '+8%', trend: 'up', icon: Building, color: 'violet' },
    { name: '오늘 발송량', value: '125,432', change: '+23%', trend: 'up', icon: MessageSquare, color: 'mint' },
    { name: '이번 달 매출', value: '₩45,230,000', change: '+15%', trend: 'up', icon: DollarSign, color: 'amber' },
  ]

  const recentOrganizations = [
    { id: '1', name: '테크컴퍼니', plan: 'Professional', users: 5, messages: 12500 },
    { id: '2', name: '디자인스튜디오', plan: 'Starter', users: 2, messages: 3200 },
    { id: '3', name: '쇼핑몰A', plan: 'Enterprise', users: 15, messages: 45000 },
  ]

  const systemAlerts = [
    { type: 'warning' as const, message: 'SMS 게이트웨이 지연 발생 중', time: '5분 전' },
    { type: 'info' as const, message: '새로운 버전 배포 예정 (v2.1.0)', time: '1시간 전' },
    { type: 'error' as const, message: '결제 처리 오류 3건 발생', time: '2시간 전' },
  ]

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; text: string; icon: string }> = {
      pingly: { bg: 'bg-pingly-100', text: 'text-pingly-600', icon: 'text-pingly-500' },
      violet: { bg: 'bg-violet-100', text: 'text-violet-600', icon: 'text-violet-500' },
      mint: { bg: 'bg-mint-100', text: 'text-mint-600', icon: 'text-mint-500' },
      amber: { bg: 'bg-amber-100', text: 'text-amber-600', icon: 'text-amber-500' },
    }
    return colors[color] || colors.pingly
  }

  const getAlertStyles = (type: 'warning' | 'info' | 'error') => {
    const styles = {
      error: { icon: AlertCircle, color: 'text-rose-500', bg: 'bg-rose-50' },
      warning: { icon: AlertTriangle, color: 'text-amber-500', bg: 'bg-amber-50' },
      info: { icon: Info, color: 'text-blue-500', bg: 'bg-blue-50' },
    }
    return styles[type]
  }

  const getPlanBadgeVariant = (plan: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'gradient'> = {
      Starter: 'secondary',
      Professional: 'default',
      Enterprise: 'gradient',
    }
    return variants[plan] || 'secondary'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Admin Header */}
      <header className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-pingly-500 to-violet-500">
                <MessageSquare className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold">Pingly Admin</span>
            </Link>
          </div>
          <nav className="flex items-center gap-6">
            <Link href="/admin/users" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              사용자
            </Link>
            <Link href="/admin/organizations" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              조직
            </Link>
            <Link href="/admin/messages" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              메시지
            </Link>
            <Link href="/admin/billing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              결제
            </Link>
            <Link href="/admin/settings" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
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
            <h1 className="text-2xl font-bold tracking-tight">관리자 대시보드</h1>
            <p className="text-muted-foreground">시스템 현황을 한눈에 확인하세요</p>
          </div>

          {/* Stats */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => {
              const colors = getColorClasses(stat.color) ?? { bg: 'bg-pingly-100', text: 'text-pingly-600', icon: 'text-pingly-500' }
              return (
                <Card key={stat.name} className="relative overflow-hidden">
                  <div className={cn('absolute top-0 right-0 w-24 h-24 rounded-bl-full opacity-50', colors.bg)} />
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      {stat.name}
                    </CardTitle>
                    <div className={cn('p-2 rounded-lg', colors.bg)}>
                      <stat.icon className={cn('h-4 w-4', colors.icon)} />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <div className="flex items-center gap-1 mt-1">
                      <TrendingUp className="h-3 w-3 text-mint-500" />
                      <span className="text-xs text-mint-600 font-medium">{stat.change}</span>
                      <span className="text-xs text-muted-foreground">전월 대비</span>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Recent Organizations */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>최근 등록 조직</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">최근 가입한 조직 목록</p>
                  </div>
                  <Button variant="ghost" size="sm" rightIcon={<ArrowUpRight className="h-4 w-4" />}>
                    전체 보기
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentOrganizations.map((org) => (
                    <div
                      key={org.id}
                      className="flex items-center justify-between rounded-xl border bg-card p-4 hover:shadow-sm transition-shadow"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-pingly-100 to-violet-100">
                          <Building className="h-5 w-5 text-pingly-600" />
                        </div>
                        <div>
                          <p className="font-semibold">{org.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {org.users}명 • {org.messages.toLocaleString()} 메시지
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant={getPlanBadgeVariant(org.plan)}>
                          {org.plan}
                        </Badge>
                        <Button variant="outline" size="sm">
                          상세
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* System Alerts */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>시스템 알림</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">중요 알림 사항</p>
                  </div>
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-rose-100">
                    <Bell className="h-4 w-4 text-rose-600" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {systemAlerts.map((alert, index) => {
                    const alertStyle = getAlertStyles(alert.type)
                    const AlertIcon = alertStyle.icon
                    return (
                      <div
                        key={index}
                        className={cn('flex items-start gap-3 rounded-lg p-3', alertStyle.bg)}
                      >
                        <AlertIcon className={cn('h-5 w-5 shrink-0', alertStyle.color)} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">{alert.message}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{alert.time}</p>
                        </div>
                      </div>
                    )
                  })}
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
                {[
                  { icon: Users, label: '사용자 관리', color: 'pingly' },
                  { icon: Building, label: '조직 관리', color: 'violet' },
                  { icon: BarChart3, label: '통계 보기', color: 'mint' },
                  { icon: Settings, label: '시스템 설정', color: 'slate' },
                ].map((action) => (
                  <button
                    key={action.label}
                    className="flex flex-col items-center gap-3 rounded-xl border bg-card p-6 hover:shadow-md hover:border-primary/50 transition-all"
                  >
                    <div className={cn(
                      'flex h-12 w-12 items-center justify-center rounded-xl',
                      action.color === 'pingly' && 'bg-pingly-100 text-pingly-600',
                      action.color === 'violet' && 'bg-violet-100 text-violet-600',
                      action.color === 'mint' && 'bg-mint-100 text-mint-600',
                      action.color === 'slate' && 'bg-slate-100 text-slate-600',
                    )}>
                      <action.icon className="h-6 w-6" />
                    </div>
                    <span className="font-medium">{action.label}</span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
