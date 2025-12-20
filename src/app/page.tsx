'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button, Card, Badge } from '@/components/primitives'
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
  Sparkles,
  Send,
  TrendingUp,
  Clock,
  ChevronRight,
  Play,
  Star,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// Animation variants
const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
}

const stagger = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const scaleIn = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1 },
}

// Floating animation for hero elements
const floatAnimation = {
  animate: {
    y: [0, -10, 0],
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: 'easeInOut' as const,
    },
  },
}

// Animated gradient orb
const GradientOrb = ({ className }: { className?: string }) => (
  <motion.div
    className={cn(
      'absolute rounded-full bg-gradient-to-r from-pingly-400/30 via-violet-400/30 to-pink-400/30 blur-3xl',
      className
    )}
    animate={{
      scale: [1, 1.1, 1],
      rotate: [0, 90, 0],
    }}
    transition={{
      duration: 20,
      repeat: Infinity,
      ease: 'linear',
    }}
  />
)

// Stats counter animation
const CountUp = ({ value, suffix = '' }: { value: string; suffix?: string }) => {
  return (
    <span className="tabular-nums">{value}{suffix}</span>
  )
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Navigation */}
      <motion.nav
        className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-xl"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-pingly-500 to-violet-500 rounded-lg blur-sm opacity-50 group-hover:opacity-75 transition-opacity" />
              <div className="relative bg-gradient-to-r from-pingly-500 to-violet-500 rounded-lg p-1.5">
                <MessageSquare className="h-5 w-5 text-white" />
              </div>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-pingly-600 to-violet-600 bg-clip-text text-transparent">
              Pingly
            </span>
          </Link>

          <div className="hidden items-center gap-8 md:flex">
            {['기능', '요금제', '고객사례', '문의'].map((item, i) => (
              <Link
                key={item}
                href={`#${['features', 'pricing', 'testimonials', 'contact'][i]}`}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors relative group"
              >
                {item}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-pingly-500 to-violet-500 group-hover:w-full transition-all duration-300" />
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm">로그인</Button>
            </Link>
            <Link href="/register">
              <Button size="sm" rightIcon={<ArrowRight className="h-4 w-4" />}>
                무료 시작하기
              </Button>
            </Link>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="relative py-20 sm:py-32 overflow-hidden">
        {/* Background effects */}
        <GradientOrb className="w-[600px] h-[600px] -top-40 -left-40" />
        <GradientOrb className="w-[400px] h-[400px] top-1/2 -right-20" />
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.02]" />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative">
          <motion.div
            className="text-center"
            initial="initial"
            animate="animate"
            variants={stagger}
          >
            {/* Badge */}
            <motion.div variants={fadeInUp} className="mb-6">
              <Badge variant="pingly" size="lg" className="gap-2">
                <Sparkles className="h-3.5 w-3.5" />
                새로운 기능: AI 메시지 최적화 출시
                <ChevronRight className="h-3.5 w-3.5" />
              </Badge>
            </motion.div>

            {/* Main headline */}
            <motion.h1
              variants={fadeInUp}
              className="text-4xl font-bold tracking-tight sm:text-6xl lg:text-7xl"
            >
              고객과의 소통을
              <br />
              <span className="bg-gradient-to-r from-pingly-500 via-violet-500 to-pink-500 bg-clip-text text-transparent">
                더 스마트하게
              </span>
            </motion.h1>

            <motion.p
              variants={fadeInUp}
              className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl"
            >
              SMS, 카카오톡, 이메일까지. 모든 메시지 채널을 하나의 플랫폼에서.
              <br className="hidden sm:block" />
              AI가 최적의 발송 시간과 메시지를 추천해드립니다.
            </motion.p>

            {/* CTA buttons */}
            <motion.div
              variants={fadeInUp}
              className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
            >
              <Link href="/register">
                <Button size="xl" variant="premium" rightIcon={<ArrowRight className="h-5 w-5" />}>
                  14일 무료 체험 시작
                </Button>
              </Link>
              <Button variant="outline" size="xl" leftIcon={<Play className="h-4 w-4" />}>
                데모 영상 보기
              </Button>
            </motion.div>

            <motion.p
              variants={fadeInUp}
              className="mt-4 text-sm text-muted-foreground"
            >
              신용카드 없이 시작 • 3분이면 설정 완료 • 언제든 취소 가능
            </motion.p>
          </motion.div>

          {/* Hero illustration */}
          <motion.div
            className="mt-16 relative"
            variants={scaleIn}
            initial="initial"
            animate="animate"
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <div className="relative mx-auto max-w-4xl">
              {/* Glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-pingly-500/20 via-violet-500/20 to-pink-500/20 rounded-2xl blur-2xl" />

              {/* Main card */}
              <Card variant="glass" className="relative p-8 backdrop-blur-xl border border-white/10">
                {/* Dashboard mockup */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-r from-pingly-500 to-violet-500 flex items-center justify-center">
                        <Send className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <div className="font-semibold">오늘의 캠페인 현황</div>
                        <div className="text-sm text-muted-foreground">실시간 업데이트</div>
                      </div>
                    </div>
                    <Badge variant="active" dot dotStatus="online" dotPulse>
                      실시간
                    </Badge>
                  </div>

                  {/* Stats row */}
                  <div className="grid grid-cols-3 gap-4 mt-6">
                    {[
                      { label: '발송 완료', value: '12,847', change: '+24%', icon: Send },
                      { label: '수신 확인', value: '10,234', change: '+18%', icon: Check },
                      { label: '클릭률', value: '32.4%', change: '+5%', icon: TrendingUp },
                    ].map((stat, i) => (
                      <motion.div
                        key={stat.label}
                        className="rounded-xl bg-muted/50 p-4"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 + i * 0.1 }}
                      >
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <stat.icon className="h-4 w-4" />
                          <span className="text-xs">{stat.label}</span>
                        </div>
                        <div className="mt-2 flex items-baseline gap-2">
                          <span className="text-2xl font-bold">{stat.value}</span>
                          <span className="text-xs text-mint-600">{stat.change}</span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </Card>

              {/* Floating elements */}
              <motion.div
                className="absolute -left-12 top-1/4 hidden lg:block"
                variants={floatAnimation}
                animate="animate"
              >
                <Card variant="elevated" className="p-3 shadow-xl">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-mint-100 flex items-center justify-center">
                      <Check className="h-4 w-4 text-mint-600" />
                    </div>
                    <div className="text-sm">
                      <div className="font-medium">발송 성공</div>
                      <div className="text-xs text-muted-foreground">1,234명에게 전달됨</div>
                    </div>
                  </div>
                </Card>
              </motion.div>

              <motion.div
                className="absolute -right-8 bottom-1/4 hidden lg:block"
                variants={floatAnimation}
                animate="animate"
                transition={{ delay: 1 }}
              >
                <Card variant="elevated" className="p-3 shadow-xl">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-pingly-100 flex items-center justify-center">
                      <TrendingUp className="h-4 w-4 text-pingly-600" />
                    </div>
                    <div className="text-sm">
                      <div className="font-medium">전환율 상승</div>
                      <div className="text-xs text-muted-foreground">지난주 대비 +23%</div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Trusted by */}
      <section className="border-y bg-muted/30 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-muted-foreground mb-8">
            대한민국 10,000개 이상의 기업이 Pingly를 신뢰합니다
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6 opacity-50">
            {['삼성전자', '현대자동차', '네이버', 'SK텔레콤', 'LG전자', '카카오'].map((company) => (
              <div key={company} className="text-lg font-semibold text-muted-foreground">
                {company}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            className="grid grid-cols-2 gap-8 md:grid-cols-4"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={stagger}
          >
            {[
              { value: '10,000', suffix: '+', label: '활성 기업', icon: Users },
              { value: '1억', suffix: '+', label: '월간 발송량', icon: Send },
              { value: '99.9', suffix: '%', label: '전송 성공률', icon: Check },
              { value: '35', suffix: '%', label: '평균 클릭률', icon: TrendingUp },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                variants={fadeInUp}
                className="text-center"
              >
                <div className={cn(
                  'mx-auto mb-4 h-12 w-12 rounded-full flex items-center justify-center',
                  i % 2 === 0 ? 'bg-pingly-100 text-pingly-600' : 'bg-violet-100 text-violet-600'
                )}>
                  <stat.icon className="h-6 w-6" />
                </div>
                <div className="text-4xl font-bold bg-gradient-to-r from-pingly-600 to-violet-600 bg-clip-text text-transparent">
                  <CountUp value={stat.value} suffix={stat.suffix} />
                </div>
                <div className="mt-1 text-sm text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <Badge variant="gradient" className="mb-4">Features</Badge>
            <h2 className="text-3xl font-bold sm:text-4xl">
              메시지 마케팅의 모든 것
            </h2>
            <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
              Pingly 하나로 SMS, 카카오톡, 이메일까지.
              고객과의 모든 소통을 한 곳에서 관리하세요.
            </p>
          </motion.div>

          <motion.div
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={stagger}
          >
            {[
              {
                icon: MessageSquare,
                title: '멀티 채널 통합',
                description: 'SMS, LMS, MMS, 카카오 알림톡/친구톡을 하나의 대시보드에서 관리하세요.',
                color: 'pingly',
              },
              {
                icon: Users,
                title: '스마트 세그멘테이션',
                description: 'AI가 고객 행동 패턴을 분석하여 최적의 타겟 그룹을 자동으로 생성합니다.',
                color: 'violet',
              },
              {
                icon: BarChart3,
                title: '실시간 분석',
                description: '발송, 수신, 클릭, 전환까지 모든 지표를 실시간으로 추적하세요.',
                color: 'mint',
              },
              {
                icon: Zap,
                title: 'AI 최적화',
                description: 'AI가 최적의 발송 시간, 메시지 내용, 채널을 추천해드립니다.',
                color: 'amber',
              },
              {
                icon: Shield,
                title: '법률 자동 준수',
                description: '광고 표시, 수신거부, 야간 발송 제한 등 한국 법률을 자동으로 준수합니다.',
                color: 'rose',
              },
              {
                icon: Globe,
                title: 'REST API',
                description: '간편한 API로 기존 시스템과 쉽게 연동하세요. SDK도 제공됩니다.',
                color: 'sky',
              },
            ].map((feature) => (
              <motion.div key={feature.title} variants={fadeInUp}>
                <Card
                  variant="feature"
                  interactive
                  className="h-full p-6 group"
                >
                  <div className={cn(
                    'h-12 w-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110',
                    feature.color === 'pingly' && 'bg-pingly-100 text-pingly-600',
                    feature.color === 'violet' && 'bg-violet-100 text-violet-600',
                    feature.color === 'mint' && 'bg-mint-100 text-mint-600',
                    feature.color === 'amber' && 'bg-amber-100 text-amber-600',
                    feature.color === 'rose' && 'bg-rose-100 text-rose-600',
                    feature.color === 'sky' && 'bg-sky-100 text-sky-600',
                  )}>
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-4 font-semibold text-lg">{feature.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <Badge variant="gradient" className="mb-4">Pricing</Badge>
            <h2 className="text-3xl font-bold sm:text-4xl">
              합리적이고 투명한 요금제
            </h2>
            <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
              숨겨진 비용 없이 사용한 만큼만 지불하세요.
              모든 플랜에 14일 무료 체험이 포함됩니다.
            </p>
          </motion.div>

          <motion.div
            className="grid gap-8 lg:grid-cols-3"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={stagger}
          >
            {[
              {
                name: 'Starter',
                price: '29,000',
                description: '소규모 비즈니스의 첫 시작',
                credits: '1,000',
                features: [
                  '월 1,000 크레딧',
                  '연락처 1,000명',
                  '기본 분석 대시보드',
                  '이메일 지원',
                ],
                popular: false,
              },
              {
                name: 'Professional',
                price: '99,000',
                description: '성장하는 비즈니스를 위한 선택',
                credits: '5,000',
                features: [
                  '월 5,000 크레딧',
                  '연락처 10,000명',
                  '고급 분석 + AI 최적화',
                  'REST API 액세스',
                  '우선 채팅 지원',
                ],
                popular: true,
              },
              {
                name: 'Enterprise',
                price: '맞춤형',
                description: '대규모 비즈니스 맞춤 솔루션',
                credits: '무제한',
                features: [
                  '무제한 크레딧 (볼륨 할인)',
                  '무제한 연락처',
                  '전용 계정 관리자',
                  'SLA 99.99% 보장',
                  '커스텀 연동 지원',
                  '온프레미스 옵션',
                ],
                popular: false,
              },
            ].map((plan) => (
              <motion.div key={plan.name} variants={fadeInUp}>
                <Card
                  variant={plan.popular ? 'gradient' : 'default'}
                  className={cn(
                    'relative p-8 h-full',
                    plan.popular && 'border-2 border-pingly-500/50 shadow-xl'
                  )}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge variant="gradient">
                        <Star className="h-3 w-3 mr-1" />
                        인기
                      </Badge>
                    </div>
                  )}

                  <h3 className="text-lg font-semibold">{plan.name}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{plan.description}</p>

                  <div className="mt-6">
                    {plan.price === '맞춤형' ? (
                      <span className="text-3xl font-bold">{plan.price}</span>
                    ) : (
                      <>
                        <span className="text-4xl font-bold">₩{plan.price}</span>
                        <span className="text-muted-foreground">/월</span>
                      </>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    월 {plan.credits} 크레딧 포함
                  </p>

                  <ul className="mt-6 space-y-3">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2 text-sm">
                        <Check className="h-4 w-4 text-mint-500 mt-0.5 shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <Link href="/register" className="mt-8 block">
                    <Button
                      className="w-full"
                      variant={plan.popular ? 'default' : 'outline'}
                      size="lg"
                    >
                      {plan.price === '맞춤형' ? '문의하기' : '시작하기'}
                    </Button>
                  </Link>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          <p className="mt-8 text-center text-sm text-muted-foreground">
            추가 크레딧은 건당 15원부터 구매 가능합니다. 대량 구매 시 할인이 적용됩니다.
          </p>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <Badge variant="gradient" className="mb-4">Testimonials</Badge>
            <h2 className="text-3xl font-bold sm:text-4xl">
              고객들의 이야기
            </h2>
          </motion.div>

          <motion.div
            className="grid gap-6 md:grid-cols-3"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={stagger}
          >
            {[
              {
                quote: 'Pingly 도입 후 마케팅 효율이 40% 이상 개선되었습니다. AI 최적화 기능이 정말 유용해요.',
                name: '김민수',
                role: '마케팅 팀장',
                company: '(주)패션브랜드',
              },
              {
                quote: '여러 채널을 하나로 관리할 수 있어서 업무 시간이 절반으로 줄었어요. 강력 추천합니다!',
                name: '이지은',
                role: 'CRM 담당자',
                company: '온라인 쇼핑몰',
              },
              {
                quote: 'API 연동이 정말 쉬웠어요. 개발팀 없이도 2시간 만에 연동 완료했습니다.',
                name: '박준혁',
                role: '1인 창업가',
                company: 'SaaS 스타트업',
              },
            ].map((testimonial) => (
              <motion.div key={testimonial.name} variants={fadeInUp}>
                <Card variant="elevated" className="p-6 h-full">
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, starIdx) => (
                      <Star key={starIdx} className="h-4 w-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-muted-foreground leading-relaxed">
                    &ldquo;{testimonial.quote}&rdquo;
                  </p>
                  <div className="mt-6 flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-pingly-400 to-violet-400 flex items-center justify-center text-white font-semibold">
                      {testimonial.name[0]}
                    </div>
                    <div>
                      <div className="font-medium">{testimonial.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {testimonial.role}, {testimonial.company}
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={scaleIn}
          >
            <Card variant="gradient" className="relative overflow-hidden p-8 sm:p-16">
              {/* Background decoration */}
              <div className="absolute inset-0 bg-gradient-to-br from-pingly-500/90 via-violet-500/90 to-pink-500/90" />
              <div className="absolute inset-0 bg-grid-pattern opacity-10" />

              <div className="relative text-center text-white">
                <h2 className="text-3xl font-bold sm:text-4xl">
                  지금 바로 시작하세요
                </h2>
                <p className="mx-auto mt-4 max-w-xl text-white/90">
                  14일 무료 체험으로 Pingly의 모든 기능을 경험해보세요.
                  <br />
                  신용카드 없이, 3분이면 시작할 수 있습니다.
                </p>
                <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Link href="/register">
                    <Button
                      size="xl"
                      variant="secondary"
                      className="bg-white text-pingly-600 hover:bg-white/90"
                      rightIcon={<ArrowRight className="h-5 w-5" />}
                    >
                      무료 체험 시작하기
                    </Button>
                  </Link>
                  <Link href="#contact">
                    <Button
                      size="xl"
                      variant="outline"
                      className="border-white/30 text-white hover:bg-white/10"
                    >
                      영업팀 문의
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="border-t py-16 bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-5">
            {/* Brand */}
            <div className="lg:col-span-2">
              <Link href="/" className="flex items-center gap-2">
                <div className="bg-gradient-to-r from-pingly-500 to-violet-500 rounded-lg p-1.5">
                  <MessageSquare className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold">Pingly</span>
              </Link>
              <p className="mt-4 text-sm text-muted-foreground max-w-xs">
                고객과의 소통을 더 스마트하게.
                대한민국 1위 메시지 마케팅 플랫폼.
              </p>
              <div className="mt-6 flex gap-4">
                <Button variant="ghost" size="icon-sm">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                  </svg>
                </Button>
                <Button variant="ghost" size="icon-sm">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.39 18.592.026 11.985.026L12.017 0z"/>
                  </svg>
                </Button>
                <Button variant="ghost" size="icon-sm">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </Button>
              </div>
            </div>

            {/* Links */}
            <div>
              <h4 className="font-semibold mb-4">서비스</h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li><Link href="#" className="hover:text-foreground transition-colors">SMS 발송</Link></li>
                <li><Link href="#" className="hover:text-foreground transition-colors">카카오톡 메시지</Link></li>
                <li><Link href="#" className="hover:text-foreground transition-colors">이메일 마케팅</Link></li>
                <li><Link href="#" className="hover:text-foreground transition-colors">API 연동</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">회사</h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li><Link href="#" className="hover:text-foreground transition-colors">회사 소개</Link></li>
                <li><Link href="#" className="hover:text-foreground transition-colors">블로그</Link></li>
                <li><Link href="#" className="hover:text-foreground transition-colors">채용</Link></li>
                <li><Link href="#" className="hover:text-foreground transition-colors">파트너</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">고객지원</h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  support@pingly.co.kr
                </li>
                <li className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  02-1234-5678
                </li>
                <li className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  평일 09:00 - 18:00
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t pt-8 sm:flex-row">
            <p className="text-sm text-muted-foreground">
              © 2024 Pingly Inc. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm text-muted-foreground">
              <Link href="#" className="hover:text-foreground transition-colors">이용약관</Link>
              <Link href="#" className="hover:text-foreground transition-colors">개인정보처리방침</Link>
              <Link href="#" className="hover:text-foreground transition-colors">쿠키 정책</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
