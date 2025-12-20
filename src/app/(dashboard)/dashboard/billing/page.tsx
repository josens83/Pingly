'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Badge,
  toast,
} from '@/components/primitives'
import {
  CreditCard,
  Check,
  Zap,
  History,
  Download,
  Plus,
  Crown,
  Sparkles,
  TrendingUp,
  ArrowRight,
  Calendar,
  Gift,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// Mock data
const currentPlan = {
  name: 'Professional',
  price: 99000,
  credits: 5000,
  usedCredits: 3250,
  periodEnd: '2024-12-15',
}

const plans = [
  {
    id: 'starter',
    name: 'Starter',
    price: 29000,
    credits: 1000,
    features: [
      '월 1,000 크레딧',
      '연락처 1,000명',
      '기본 분석',
      '이메일 지원',
    ],
    popular: false,
  },
  {
    id: 'professional',
    name: 'Professional',
    price: 99000,
    credits: 5000,
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
    id: 'enterprise',
    name: 'Enterprise',
    price: 299000,
    credits: 20000,
    features: [
      '월 20,000 크레딧',
      '무제한 연락처',
      '전용 계정 관리자',
      'SLA 보장',
      '커스텀 연동',
    ],
    popular: false,
  },
]

const creditPackages = [
  { id: '1', credits: 1000, bonus: 0, price: 15000, pricePerCredit: 15 },
  { id: '2', credits: 5000, bonus: 500, price: 70000, pricePerCredit: 14, popular: true },
  { id: '3', credits: 10000, bonus: 1500, price: 130000, pricePerCredit: 13 },
  { id: '4', credits: 50000, bonus: 10000, price: 600000, pricePerCredit: 12 },
]

const transactions = [
  { id: '1', type: '구독 결제', amount: 99000, credits: 5000, date: '2024-11-15', status: 'COMPLETED' },
  { id: '2', type: '크레딧 충전', amount: 70000, credits: 5500, date: '2024-11-10', status: 'COMPLETED' },
  { id: '3', type: '크레딧 사용', amount: 0, credits: -1250, date: '2024-11-08', status: 'COMPLETED' },
  { id: '4', type: '구독 결제', amount: 99000, credits: 5000, date: '2024-10-15', status: 'COMPLETED' },
]

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: 'KRW',
    maximumFractionDigits: 0,
  }).format(value)
}

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

type TabId = 'plan' | 'credits' | 'history'

const tabs = [
  { id: 'plan' as TabId, label: '요금제', icon: Crown },
  { id: 'credits' as TabId, label: '크레딧 충전', icon: Zap },
  { id: 'history' as TabId, label: '결제 내역', icon: History },
]

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, delay: i * 0.1 },
  }),
}

export default function BillingPage() {
  const [activeTab, setActiveTab] = useState<TabId>('plan')

  const creditUsagePercent = (currentPlan.usedCredits / currentPlan.credits) * 100
  const remainingCredits = currentPlan.credits - currentPlan.usedCredits

  const handlePurchaseCredits = (pkg: typeof creditPackages[0]) => {
    toast.success(`${pkg.credits.toLocaleString()} 크레딧 구매를 진행합니다`)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight">요금제 및 결제</h1>
        <p className="text-muted-foreground">구독 및 크레딧을 관리하세요</p>
      </div>

      {/* Current Status Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Card className="relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-pingly-100 to-transparent rounded-bl-full" />
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
                <Crown className="h-4 w-4" />
                현재 요금제
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold">{currentPlan.name}</span>
                <Badge variant="gradient" className="ml-2">활성</Badge>
              </div>
              <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                다음 결제일: {formatDate(currentPlan.periodEnd)}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <Card className="relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-mint-100 to-transparent rounded-bl-full" />
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
                <Zap className="h-4 w-4" />
                크레딧 잔액
              </div>
              <div className="text-2xl font-bold">
                {remainingCredits.toLocaleString()}
                <span className="text-sm font-normal text-muted-foreground ml-1">
                  / {currentPlan.credits.toLocaleString()}
                </span>
              </div>
              <div className="mt-3 h-2 rounded-full bg-muted overflow-hidden">
                <motion.div
                  className={cn(
                    'h-full rounded-full',
                    creditUsagePercent > 80
                      ? 'bg-gradient-to-r from-rose-500 to-rose-600'
                      : 'bg-gradient-to-r from-pingly-500 to-violet-500'
                  )}
                  initial={{ width: 0 }}
                  animate={{ width: `${creditUsagePercent}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                />
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {creditUsagePercent.toFixed(0)}% 사용됨
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <Card className="relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-violet-100 to-transparent rounded-bl-full" />
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
                <CreditCard className="h-4 w-4" />
                이번 달 지출
              </div>
              <div className="text-2xl font-bold">{formatCurrency(169000)}</div>
              <div className="flex items-center gap-1 mt-2 text-sm text-mint-600">
                <TrendingUp className="h-4 w-4" />
                <span>지난달 대비 12% 절감</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-all border-b-2 -mb-px',
                isActive
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              )}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Plan Selection */}
      {activeTab === 'plan' && (
        <div className="grid gap-6 lg:grid-cols-3">
          {plans.map((plan, i) => {
            const isCurrentPlan = currentPlan.name === plan.name
            return (
              <motion.div
                key={plan.id}
                custom={i}
                variants={cardVariants}
                initial="hidden"
                animate="visible"
              >
                <Card
                  className={cn(
                    'relative h-full transition-all hover:shadow-lg',
                    plan.popular && 'border-primary shadow-primary/20 shadow-lg',
                    isCurrentPlan && 'ring-2 ring-primary'
                  )}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge variant="gradient" className="shadow-lg">
                        <Sparkles className="h-3 w-3 mr-1" />
                        인기
                      </Badge>
                    </div>
                  )}
                  <CardHeader className="pb-4">
                    <CardTitle className="text-xl">{plan.name}</CardTitle>
                    <div className="mt-3">
                      <span className="text-4xl font-bold">{formatCurrency(plan.price)}</span>
                      <span className="text-muted-foreground">/월</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      월 {plan.credits.toLocaleString()} 크레딧 포함
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <ul className="space-y-3">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-center gap-3 text-sm">
                          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-mint-100">
                            <Check className="h-3 w-3 text-mint-600" />
                          </div>
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <Button
                      className="w-full"
                      variant={isCurrentPlan ? 'outline' : plan.popular ? 'default' : 'outline'}
                      disabled={isCurrentPlan}
                      rightIcon={!isCurrentPlan && <ArrowRight className="h-4 w-4" />}
                    >
                      {isCurrentPlan ? '현재 플랜' : '변경하기'}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* Credit Packages */}
      {activeTab === 'credits' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>크레딧 패키지</CardTitle>
              <p className="text-sm text-muted-foreground">
                필요에 맞는 크레딧 패키지를 선택하세요
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {creditPackages.map((pkg, i) => (
                  <motion.div
                    key={pkg.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: i * 0.1 }}
                    className={cn(
                      'relative rounded-xl border p-5 transition-all hover:shadow-md cursor-pointer',
                      pkg.popular && 'border-primary bg-gradient-to-b from-pingly-50/50 to-transparent'
                    )}
                    onClick={() => handlePurchaseCredits(pkg)}
                  >
                    {pkg.popular && (
                      <Badge className="absolute -top-2 right-3" variant="gradient">
                        인기
                      </Badge>
                    )}
                    <div className="text-center space-y-3">
                      <div className="flex items-center justify-center gap-1">
                        <Zap className="h-5 w-5 text-pingly-500" />
                        <span className="text-3xl font-bold">{pkg.credits.toLocaleString()}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">크레딧</p>
                      {pkg.bonus > 0 && (
                        <Badge variant="success">
                          <Gift className="h-3 w-3 mr-1" />
                          +{pkg.bonus.toLocaleString()} 보너스
                        </Badge>
                      )}
                      <div className="pt-3">
                        <p className="text-2xl font-bold">{formatCurrency(pkg.price)}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          크레딧당 {formatCurrency(pkg.pricePerCredit)}
                        </p>
                      </div>
                      <Button
                        className="w-full mt-3"
                        variant={pkg.popular ? 'default' : 'outline'}
                      >
                        구매하기
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>크레딧 단가 안내</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="pb-3 text-left font-semibold">메시지 유형</th>
                      <th className="pb-3 text-left font-semibold">크레딧</th>
                      <th className="pb-3 text-left font-semibold">실제 비용 (Professional 기준)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {[
                      { type: 'SMS (단문)', credits: 1, cost: '약 14원' },
                      { type: 'LMS (장문)', credits: 3, cost: '약 42원' },
                      { type: 'MMS (멀티미디어)', credits: 5, cost: '약 70원' },
                      { type: '카카오 알림톡', credits: 1, cost: '약 14원' },
                      { type: '카카오 친구톡', credits: 2, cost: '약 28원' },
                    ].map((row) => (
                      <tr key={row.type}>
                        <td className="py-3 font-medium">{row.type}</td>
                        <td className="py-3">
                          <Badge variant="secondary">{row.credits}</Badge>
                        </td>
                        <td className="py-3 text-muted-foreground">{row.cost}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Transaction History */}
      {activeTab === 'history' && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>결제 내역</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  최근 결제 및 크레딧 사용 내역
                </p>
              </div>
              <Button variant="outline" size="sm" leftIcon={<Download className="h-4 w-4" />}>
                내보내기
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {transactions.map((tx, i) => (
                <motion.div
                  key={tx.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                  className="flex items-center justify-between rounded-xl border bg-card p-4 hover:shadow-sm transition-shadow"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={cn(
                        'flex h-10 w-10 items-center justify-center rounded-full',
                        tx.credits > 0
                          ? 'bg-gradient-to-br from-mint-100 to-mint-200'
                          : 'bg-muted'
                      )}
                    >
                      {tx.credits > 0 ? (
                        <Plus className="h-5 w-5 text-mint-600" />
                      ) : (
                        <CreditCard className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{tx.type}</p>
                      <p className="text-sm text-muted-foreground">{formatDate(tx.date)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    {tx.amount > 0 && (
                      <p className="font-semibold">{formatCurrency(tx.amount)}</p>
                    )}
                    <p
                      className={cn(
                        'text-sm font-medium',
                        tx.credits > 0 ? 'text-mint-600' : 'text-muted-foreground'
                      )}
                    >
                      {tx.credits > 0 ? '+' : ''}{tx.credits.toLocaleString()} 크레딧
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="mt-6 flex justify-center">
              <Button variant="ghost">더 보기</Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
