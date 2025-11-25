import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  MessageSquare,
  Users,
  BarChart3,
  Shield,
  Zap,
  Globe,
  Check,
  ArrowRight,
  Phone,
  Mail,
} from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold">Pingly</span>
          </div>
          <div className="hidden items-center gap-8 md:flex">
            <Link href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground">
              기능
            </Link>
            <Link href="#pricing" className="text-sm font-medium text-muted-foreground hover:text-foreground">
              요금제
            </Link>
            <Link href="#contact" className="text-sm font-medium text-muted-foreground hover:text-foreground">
              문의
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost">로그인</Button>
            </Link>
            <Link href="/register">
              <Button>무료 시작하기</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 sm:py-32">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(45%_40%_at_50%_60%,rgba(59,130,246,0.1),transparent)]" />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
              효과적인 메시지 마케팅의
              <br />
              <span className="text-primary">새로운 시작</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
              SMS, LMS, MMS, 카카오톡 알림톡/친구톡까지. 모든 메시지 채널을 하나의 플랫폼에서 관리하고,
              고객과의 소통을 더 효과적으로 만들어보세요.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/register">
                <Button size="lg" className="w-full sm:w-auto">
                  14일 무료 체험 <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="#features">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  기능 알아보기
                </Button>
              </Link>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              신용카드 없이 시작 가능 • 언제든지 취소 가능
            </p>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y bg-muted/30 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {[
              { value: '10,000+', label: '활성 사용자' },
              { value: '1억+', label: '발송된 메시지' },
              { value: '99.9%', label: '전송 성공률' },
              { value: '35%', label: '평균 클릭률' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl font-bold text-primary">{stat.value}</div>
                <div className="mt-1 text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold">강력한 기능</h2>
            <p className="mt-4 text-muted-foreground">
              메시지 마케팅에 필요한 모든 것을 제공합니다
            </p>
          </div>
          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: MessageSquare,
                title: '멀티 채널 발송',
                description: 'SMS, LMS, MMS, 카카오 알림톡, 친구톡을 하나의 플랫폼에서 관리하세요.',
              },
              {
                icon: Users,
                title: '고객 세그멘테이션',
                description: '고객을 그룹으로 나누고 타겟팅된 메시지를 발송하세요.',
              },
              {
                icon: BarChart3,
                title: '실시간 분석',
                description: '발송, 수신, 클릭 통계를 실시간으로 확인하세요.',
              },
              {
                icon: Zap,
                title: '자동화',
                description: '예약 발송, 트리거 기반 자동 메시지를 설정하세요.',
              },
              {
                icon: Shield,
                title: '법률 준수',
                description: '광고 표시, 수신거부 등 한국 법률을 자동으로 준수합니다.',
              },
              {
                icon: Globe,
                title: 'API 지원',
                description: 'REST API로 기존 시스템과 쉽게 연동하세요.',
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="rounded-xl border bg-card p-6 transition-shadow hover:shadow-lg"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mt-4 font-semibold">{feature.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="bg-muted/30 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold">합리적인 요금제</h2>
            <p className="mt-4 text-muted-foreground">
              비즈니스 규모에 맞는 요금제를 선택하세요
            </p>
          </div>
          <div className="mt-16 grid gap-8 lg:grid-cols-3">
            {[
              {
                name: 'Starter',
                price: '29,000',
                description: '소규모 비즈니스를 위한 시작 플랜',
                credits: '1,000',
                features: [
                  '월 1,000 크레딧',
                  '연락처 1,000명',
                  '기본 분석',
                  '이메일 지원',
                ],
                popular: false,
              },
              {
                name: 'Professional',
                price: '99,000',
                description: '성장하는 비즈니스를 위한 플랜',
                credits: '5,000',
                features: [
                  '월 5,000 크레딧',
                  '연락처 10,000명',
                  '고급 분석',
                  'API 액세스',
                  '우선 지원',
                ],
                popular: true,
              },
              {
                name: 'Enterprise',
                price: '299,000',
                description: '대규모 비즈니스를 위한 플랜',
                credits: '20,000',
                features: [
                  '월 20,000 크레딧',
                  '무제한 연락처',
                  '전용 계정 관리자',
                  'SLA 보장',
                  '커스텀 연동',
                ],
                popular: false,
              },
            ].map((plan) => (
              <div
                key={plan.name}
                className={`relative rounded-xl border bg-card p-8 ${
                  plan.popular ? 'border-primary shadow-lg' : ''
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
                    인기
                  </div>
                )}
                <h3 className="text-lg font-semibold">{plan.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{plan.description}</p>
                <div className="mt-4">
                  <span className="text-4xl font-bold">₩{plan.price}</span>
                  <span className="text-muted-foreground">/월</span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">월 {plan.credits} 크레딧 포함</p>
                <ul className="mt-6 space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-primary" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link href="/register" className="mt-8 block">
                  <Button className="w-full" variant={plan.popular ? 'default' : 'outline'}>
                    시작하기
                  </Button>
                </Link>
              </div>
            ))}
          </div>
          <p className="mt-8 text-center text-sm text-muted-foreground">
            추가 크레딧은 건당 15원부터 구매 가능합니다
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl bg-primary p-8 text-center text-primary-foreground sm:p-16">
            <h2 className="text-3xl font-bold">지금 바로 시작하세요</h2>
            <p className="mx-auto mt-4 max-w-xl opacity-90">
              14일 무료 체험으로 Pingly의 모든 기능을 경험해보세요. 신용카드 없이 시작할 수 있습니다.
            </p>
            <Link href="/register" className="mt-8 inline-block">
              <Button size="lg" variant="secondary">
                무료 체험 시작하기 <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="border-t py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <div className="flex items-center gap-2">
                <MessageSquare className="h-6 w-6 text-primary" />
                <span className="font-bold">Pingly</span>
              </div>
              <p className="mt-4 text-sm text-muted-foreground">
                효과적인 메시지 마케팅 플랫폼
              </p>
            </div>
            <div>
              <h4 className="font-semibold">서비스</h4>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                <li><Link href="#" className="hover:text-foreground">SMS 발송</Link></li>
                <li><Link href="#" className="hover:text-foreground">카카오톡 메시지</Link></li>
                <li><Link href="#" className="hover:text-foreground">API 연동</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold">회사</h4>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                <li><Link href="#" className="hover:text-foreground">소개</Link></li>
                <li><Link href="#" className="hover:text-foreground">블로그</Link></li>
                <li><Link href="#" className="hover:text-foreground">채용</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold">고객지원</h4>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  support@pingly.co.kr
                </li>
                <li className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  02-1234-5678
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t pt-8 sm:flex-row">
            <p className="text-sm text-muted-foreground">
              © 2024 Pingly. All rights reserved.
            </p>
            <div className="flex gap-4 text-sm text-muted-foreground">
              <Link href="#" className="hover:text-foreground">이용약관</Link>
              <Link href="#" className="hover:text-foreground">개인정보처리방침</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
