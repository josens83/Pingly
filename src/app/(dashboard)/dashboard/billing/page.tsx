'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  CreditCard,
  Check,
  Zap,
  Users,
  BarChart3,
  Shield,
  ArrowRight,
  History,
  Download,
  Plus,
  Crown,
} from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'

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

export default function BillingPage() {
  const [activeTab, setActiveTab] = useState<'plan' | 'credits' | 'history'>('plan')

  const creditUsagePercent = (currentPlan.usedCredits / currentPlan.credits) * 100

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">요금제 및 결제</h1>
        <p className="text-muted-foreground">구독 및 크레딧을 관리하세요</p>
      </div>

      {/* Current Status */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">현재 요금제</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-yellow-500" />
              <span className="text-2xl font-bold">{currentPlan.name}</span>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              다음 결제일: {formatDate(currentPlan.periodEnd)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">크레딧 잔액</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(currentPlan.credits - currentPlan.usedCredits).toLocaleString()}
              <span className="text-sm font-normal text-muted-foreground"> / {currentPlan.credits.toLocaleString()}</span>
            </div>
            <div className="mt-2 h-2 rounded-full bg-muted">
              <div
                className={`h-full rounded-full ${creditUsagePercent > 80 ? 'bg-red-500' : 'bg-primary'}`}
                style={{ width: `${creditUsagePercent}%` }}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">이번 달 지출</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(169000)}</div>
            <p className="mt-1 text-sm text-muted-foreground">구독 + 추가 크레딧</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b">
        {[
          { id: 'plan', label: '요금제', icon: Crown },
          { id: 'credits', label: '크레딧 충전', icon: Zap },
          { id: 'history', label: '결제 내역', icon: History },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`flex items-center gap-2 border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Plan Selection */}
      {activeTab === 'plan' && (
        <div className="grid gap-6 lg:grid-cols-3">
          {plans.map((plan) => (
            <Card
              key={plan.id}
              className={`relative ${plan.popular ? 'border-primary shadow-lg' : ''}`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
                  인기
                </div>
              )}
              <CardHeader>
                <CardTitle>{plan.name}</CardTitle>
                <div className="mt-2">
                  <span className="text-3xl font-bold">{formatCurrency(plan.price)}</span>
                  <span className="text-muted-foreground">/월</span>
                </div>
                <CardDescription>월 {plan.credits.toLocaleString()} 크레딧 포함</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-primary" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button
                  className="mt-6 w-full"
                  variant={currentPlan.name === plan.name ? 'outline' : plan.popular ? 'default' : 'outline'}
                  disabled={currentPlan.name === plan.name}
                >
                  {currentPlan.name === plan.name ? '현재 플랜' : '변경하기'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Credit Packages */}
      {activeTab === 'credits' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>크레딧 패키지</CardTitle>
              <CardDescription>필요에 맞는 크레딧 패키지를 선택하세요</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {creditPackages.map((pkg) => (
                  <div
                    key={pkg.id}
                    className={`relative rounded-lg border p-4 transition-shadow hover:shadow-md ${
                      pkg.popular ? 'border-primary' : ''
                    }`}
                  >
                    {pkg.popular && (
                      <Badge className="absolute -top-2 right-2 bg-primary">인기</Badge>
                    )}
                    <div className="text-center">
                      <p className="text-2xl font-bold">{pkg.credits.toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground">크레딧</p>
                      {pkg.bonus > 0 && (
                        <Badge variant="success" className="mt-1">
                          +{pkg.bonus.toLocaleString()} 보너스
                        </Badge>
                      )}
                      <p className="mt-4 text-xl font-bold">{formatCurrency(pkg.price)}</p>
                      <p className="text-xs text-muted-foreground">
                        크레딧당 {formatCurrency(pkg.pricePerCredit)}
                      </p>
                      <Button className="mt-4 w-full" variant={pkg.popular ? 'default' : 'outline'}>
                        구매하기
                      </Button>
                    </div>
                  </div>
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
                    <tr className="border-b text-left text-muted-foreground">
                      <th className="pb-2 font-medium">메시지 유형</th>
                      <th className="pb-2 font-medium">크레딧</th>
                      <th className="pb-2 font-medium">실제 비용 (Professional 기준)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="py-2">SMS (단문)</td>
                      <td className="py-2">1</td>
                      <td className="py-2">약 14원</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2">LMS (장문)</td>
                      <td className="py-2">3</td>
                      <td className="py-2">약 42원</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2">MMS (멀티미디어)</td>
                      <td className="py-2">5</td>
                      <td className="py-2">약 70원</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2">카카오 알림톡</td>
                      <td className="py-2">1</td>
                      <td className="py-2">약 14원</td>
                    </tr>
                    <tr>
                      <td className="py-2">카카오 친구톡</td>
                      <td className="py-2">2</td>
                      <td className="py-2">약 28원</td>
                    </tr>
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
                <CardDescription>최근 결제 및 크레딧 사용 내역</CardDescription>
              </div>
              <Button variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                내보내기
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {transactions.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-full ${
                        tx.credits > 0 ? 'bg-green-100' : 'bg-gray-100'
                      }`}
                    >
                      {tx.credits > 0 ? (
                        <Plus className="h-5 w-5 text-green-600" />
                      ) : (
                        <CreditCard className="h-5 w-5 text-gray-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{tx.type}</p>
                      <p className="text-sm text-muted-foreground">{formatDate(tx.date)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    {tx.amount > 0 && (
                      <p className="font-medium">{formatCurrency(tx.amount)}</p>
                    )}
                    <p
                      className={`text-sm ${
                        tx.credits > 0 ? 'text-green-600' : 'text-muted-foreground'
                      }`}
                    >
                      {tx.credits > 0 ? '+' : ''}{tx.credits.toLocaleString()} 크레딧
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
