'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  User,
  Building,
  Key,
  Bell,
  Shield,
  Globe,
  Smartphone,
  Copy,
  Eye,
  EyeOff,
  RefreshCw,
  Trash2,
  Plus,
} from 'lucide-react'

const apiKeys = [
  {
    id: '1',
    name: 'Production API Key',
    key: 'pk_live_xxxxxxxxxxxxxxxxxxxxx',
    lastUsed: '2024-11-20',
    createdAt: '2024-10-01',
  },
  {
    id: '2',
    name: 'Test API Key',
    key: 'pk_test_xxxxxxxxxxxxxxxxxxxxx',
    lastUsed: '2024-11-22',
    createdAt: '2024-10-15',
  },
]

const senderIds = [
  { id: '1', name: '대표번호', senderId: '0212345678', status: 'VERIFIED', isDefault: true },
  { id: '2', name: '마케팅', senderId: 'PINGLY', status: 'PENDING', isDefault: false },
]

export default function SettingsPage() {
  const { data: session } = useSession()
  const [activeTab, setActiveTab] = useState<'profile' | 'organization' | 'api' | 'notifications' | 'senderids'>('profile')
  const [showApiKey, setShowApiKey] = useState<string | null>(null)

  const tabs = [
    { id: 'profile', label: '내 프로필', icon: User },
    { id: 'organization', label: '조직 설정', icon: Building },
    { id: 'senderids', label: '발신번호', icon: Smartphone },
    { id: 'api', label: 'API 키', icon: Key },
    { id: 'notifications', label: '알림 설정', icon: Bell },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">설정</h1>
        <p className="text-muted-foreground">계정 및 서비스 설정을 관리하세요</p>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row">
        {/* Sidebar */}
        <div className="w-full lg:w-64">
          <nav className="space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 space-y-6">
          {/* Profile Settings */}
          {activeTab === 'profile' && (
            <Card>
              <CardHeader>
                <CardTitle>내 프로필</CardTitle>
                <CardDescription>개인 정보를 관리하세요</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">
                    {session?.user?.name?.[0] || 'U'}
                  </div>
                  <div>
                    <Button variant="outline" size="sm">
                      이미지 변경
                    </Button>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">이름</Label>
                    <Input id="name" defaultValue={session?.user?.name || ''} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">이메일</Label>
                    <Input id="email" type="email" defaultValue={session?.user?.email || ''} disabled />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">전화번호</Label>
                    <Input id="phone" placeholder="010-0000-0000" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="timezone">시간대</Label>
                    <Input id="timezone" defaultValue="Asia/Seoul" disabled />
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline">취소</Button>
                  <Button>저장</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Organization Settings */}
          {activeTab === 'organization' && (
            <Card>
              <CardHeader>
                <CardTitle>조직 설정</CardTitle>
                <CardDescription>조직 정보를 관리하세요</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="orgName">조직명</Label>
                    <Input id="orgName" placeholder="회사명" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="industry">업종</Label>
                    <Input id="industry" placeholder="예: 이커머스" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="website">웹사이트</Label>
                    <Input id="website" placeholder="https://example.com" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="orgSlug">슬러그</Label>
                    <Input id="orgSlug" placeholder="my-company" disabled />
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline">취소</Button>
                  <Button>저장</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Sender IDs */}
          {activeTab === 'senderids' && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>발신번호 관리</CardTitle>
                    <CardDescription>메시지 발송에 사용할 발신번호를 관리하세요</CardDescription>
                  </div>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    발신번호 등록
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {senderIds.map((sender) => (
                    <div
                      key={sender.id}
                      className="flex items-center justify-between rounded-lg border p-4"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                          <Smartphone className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{sender.name}</p>
                            {sender.isDefault && (
                              <Badge variant="secondary">기본</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{sender.senderId}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={sender.status === 'VERIFIED' ? 'success' : 'warning'}
                        >
                          {sender.status === 'VERIFIED' ? '인증됨' : '대기중'}
                        </Badge>
                        <Button variant="ghost" size="icon">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 rounded-lg bg-muted p-4">
                  <h4 className="font-medium">발신번호 등록 안내</h4>
                  <p className="mt-1 text-sm text-muted-foreground">
                    발신번호 등록을 위해서는 통신사 서류 인증이 필요합니다.
                    사업자등록증과 통신서비스 이용증명원을 준비해주세요.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* API Keys */}
          {activeTab === 'api' && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>API 키 관리</CardTitle>
                    <CardDescription>외부 시스템 연동을 위한 API 키를 관리하세요</CardDescription>
                  </div>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    새 API 키
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {apiKeys.map((apiKey) => (
                    <div
                      key={apiKey.id}
                      className="flex items-center justify-between rounded-lg border p-4"
                    >
                      <div className="space-y-1">
                        <p className="font-medium">{apiKey.name}</p>
                        <div className="flex items-center gap-2">
                          <code className="rounded bg-muted px-2 py-1 text-sm">
                            {showApiKey === apiKey.id ? apiKey.key : '••••••••••••••••••••'}
                          </code>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              setShowApiKey(showApiKey === apiKey.id ? null : apiKey.id)
                            }
                          >
                            {showApiKey === apiKey.id ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                          <Button variant="ghost" size="icon">
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          마지막 사용: {apiKey.lastUsed} • 생성: {apiKey.createdAt}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon">
                          <RefreshCw className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 rounded-lg bg-muted p-4">
                  <h4 className="font-medium">API 문서</h4>
                  <p className="mt-1 text-sm text-muted-foreground">
                    API 연동 방법은{' '}
                    <a href="#" className="text-primary hover:underline">
                      개발자 문서
                    </a>
                    를 참고하세요.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Notification Settings */}
          {activeTab === 'notifications' && (
            <Card>
              <CardHeader>
                <CardTitle>알림 설정</CardTitle>
                <CardDescription>알림 수신 방법을 설정하세요</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {[
                  { title: '캠페인 완료', description: '캠페인 발송이 완료되면 알림을 받습니다' },
                  { title: '크레딧 부족', description: '크레딧이 일정 수준 이하로 떨어지면 알림을 받습니다' },
                  { title: '결제 알림', description: '결제 관련 중요 알림을 받습니다' },
                  { title: '주간 리포트', description: '매주 발송 현황 요약 리포트를 받습니다' },
                  { title: '신규 기능 안내', description: '새로운 기능 출시 소식을 받습니다' },
                ].map((item) => (
                  <div key={item.title} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{item.title}</p>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </div>
                    <label className="relative inline-flex cursor-pointer items-center">
                      <input type="checkbox" defaultChecked className="peer sr-only" />
                      <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-primary peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20" />
                    </label>
                  </div>
                ))}

                <div className="flex justify-end">
                  <Button>저장</Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
