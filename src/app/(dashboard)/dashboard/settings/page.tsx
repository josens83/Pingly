'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Input,
  Badge,
  Switch,
  Textarea,
  Avatar,
  AvatarFallback,
  AvatarImage,
  toast,
} from '@/components/primitives'
import {
  User,
  Building,
  Key,
  Bell,
  Smartphone,
  Copy,
  Eye,
  EyeOff,
  RefreshCw,
  Trash2,
  Plus,
  Check,
  Upload,
  Shield,
  Globe,
  Mail,
  Phone,
  Clock,
  AlertTriangle,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// Mock data
const apiKeys = [
  {
    id: '1',
    name: 'Production API Key',
    key: 'pk_live_xxxxxxxxxxxxxxxxxxxxx',
    lastUsed: '2024-11-20',
    createdAt: '2024-10-01',
    status: 'active' as const,
  },
  {
    id: '2',
    name: 'Test API Key',
    key: 'pk_test_xxxxxxxxxxxxxxxxxxxxx',
    lastUsed: '2024-11-22',
    createdAt: '2024-10-15',
    status: 'active' as const,
  },
]

const senderIds = [
  { id: '1', name: '대표번호', senderId: '0212345678', status: 'VERIFIED' as const, isDefault: true },
  { id: '2', name: '마케팅', senderId: 'PINGLY', status: 'PENDING' as const, isDefault: false },
]

type TabId = 'profile' | 'organization' | 'senderids' | 'api' | 'notifications' | 'security'

const tabs = [
  { id: 'profile' as TabId, label: '내 프로필', icon: User, description: '개인 정보 관리' },
  { id: 'organization' as TabId, label: '조직 설정', icon: Building, description: '조직 정보 관리' },
  { id: 'senderids' as TabId, label: '발신번호', icon: Smartphone, description: '발신번호 관리' },
  { id: 'api' as TabId, label: 'API 키', icon: Key, description: 'API 연동 설정' },
  { id: 'notifications' as TabId, label: '알림 설정', icon: Bell, description: '알림 수신 설정' },
  { id: 'security' as TabId, label: '보안', icon: Shield, description: '계정 보안 설정' },
]

const notificationSettings = [
  { id: 'campaign_complete', title: '캠페인 완료', description: '캠페인 발송이 완료되면 알림을 받습니다', defaultChecked: true },
  { id: 'credit_low', title: '크레딧 부족', description: '크레딧이 일정 수준 이하로 떨어지면 알림을 받습니다', defaultChecked: true },
  { id: 'payment', title: '결제 알림', description: '결제 관련 중요 알림을 받습니다', defaultChecked: true },
  { id: 'weekly_report', title: '주간 리포트', description: '매주 발송 현황 요약 리포트를 받습니다', defaultChecked: false },
  { id: 'new_features', title: '신규 기능 안내', description: '새로운 기능 출시 소식을 받습니다', defaultChecked: true },
]

const contentVariants = {
  hidden: { opacity: 0, x: 20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.3, ease: 'easeOut' as const } },
  exit: { opacity: 0, x: -20, transition: { duration: 0.2 } },
}

export default function SettingsPage() {
  const { data: session } = useSession()
  const [activeTab, setActiveTab] = useState<TabId>('profile')
  const [showApiKey, setShowApiKey] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleCopyApiKey = (key: string) => {
    navigator.clipboard.writeText(key)
    toast.success('API 키가 복사되었습니다')
  }

  const handleSaveProfile = async () => {
    setIsSubmitting(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsSubmitting(false)
    toast.success('프로필이 저장되었습니다')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight">설정</h1>
        <p className="text-muted-foreground">계정 및 서비스 설정을 관리하세요</p>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row">
        {/* Sidebar Navigation */}
        <Card className="w-full lg:w-72 h-fit">
          <CardContent className="p-2">
            <nav className="space-y-1">
              {tabs.map((tab) => {
                const isActive = activeTab === tab.id
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-all',
                      isActive
                        ? 'bg-gradient-to-r from-pingly-500 to-pingly-600 text-white shadow-sm'
                        : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                    )}
                  >
                    <tab.icon className={cn('h-4 w-4', isActive && 'text-white')} />
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{tab.label}</span>
                      {!isActive && (
                        <span className="text-xs text-muted-foreground">{tab.description}</span>
                      )}
                    </div>
                  </button>
                )
              })}
            </nav>
          </CardContent>
        </Card>

        {/* Content Area */}
        <div className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              variants={contentVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="space-y-6"
            >
              {/* Profile Settings */}
              {activeTab === 'profile' && (
                <Card>
                  <CardHeader>
                    <CardTitle>내 프로필</CardTitle>
                    <p className="text-sm text-muted-foreground">개인 정보를 관리하세요</p>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Avatar Section */}
                    <div className="flex items-center gap-6">
                      <Avatar className="h-20 w-20">
                        <AvatarImage src={session?.user?.image || undefined} />
                        <AvatarFallback className="text-2xl bg-gradient-to-br from-pingly-500 to-violet-500 text-white">
                          {session?.user?.name?.[0] || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="space-y-2">
                        <Button variant="outline" size="sm" leftIcon={<Upload className="h-4 w-4" />}>
                          이미지 변경
                        </Button>
                        <p className="text-xs text-muted-foreground">
                          JPG, PNG 또는 GIF. 최대 2MB.
                        </p>
                      </div>
                    </div>

                    {/* Form Fields */}
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">이름</label>
                        <Input
                          leftIcon={<User className="h-4 w-4" />}
                          defaultValue={session?.user?.name || ''}
                          placeholder="홍길동"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">이메일</label>
                        <Input
                          leftIcon={<Mail className="h-4 w-4" />}
                          type="email"
                          defaultValue={session?.user?.email || ''}
                          disabled
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">전화번호</label>
                        <Input
                          leftIcon={<Phone className="h-4 w-4" />}
                          placeholder="010-0000-0000"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">시간대</label>
                        <Input
                          leftIcon={<Clock className="h-4 w-4" />}
                          defaultValue="Asia/Seoul (UTC+9)"
                          disabled
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-4 border-t">
                      <Button variant="outline">취소</Button>
                      <Button onClick={handleSaveProfile} isLoading={isSubmitting}>
                        저장
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Organization Settings */}
              {activeTab === 'organization' && (
                <Card>
                  <CardHeader>
                    <CardTitle>조직 설정</CardTitle>
                    <p className="text-sm text-muted-foreground">조직 정보를 관리하세요</p>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">조직명</label>
                        <Input
                          leftIcon={<Building className="h-4 w-4" />}
                          placeholder="회사명"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">업종</label>
                        <Input placeholder="예: 이커머스" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">웹사이트</label>
                        <Input
                          leftIcon={<Globe className="h-4 w-4" />}
                          placeholder="https://example.com"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">슬러그</label>
                        <Input placeholder="my-company" disabled />
                        <p className="text-xs text-muted-foreground">URL에 사용되는 고유 식별자</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">조직 설명</label>
                      <Textarea placeholder="조직에 대한 간단한 설명을 입력하세요" rows={3} />
                    </div>

                    <div className="flex justify-end gap-2 pt-4 border-t">
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
                        <p className="text-sm text-muted-foreground mt-1">
                          메시지 발송에 사용할 발신번호를 관리하세요
                        </p>
                      </div>
                      <Button leftIcon={<Plus className="h-4 w-4" />}>
                        발신번호 등록
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {senderIds.map((sender) => (
                      <motion.div
                        key={sender.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center justify-between rounded-xl border bg-card p-4 hover:shadow-sm transition-shadow"
                      >
                        <div className="flex items-center gap-4">
                          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-pingly-100 to-violet-100">
                            <Smartphone className="h-5 w-5 text-pingly-600" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-semibold">{sender.name}</p>
                              {sender.isDefault && (
                                <Badge variant="secondary" size="sm">기본</Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground font-mono">{sender.senderId}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge
                            variant={sender.status === 'VERIFIED' ? 'success' : 'warning'}
                          >
                            {sender.status === 'VERIFIED' ? (
                              <>
                                <Check className="h-3 w-3 mr-1" />
                                인증됨
                              </>
                            ) : (
                              <>
                                <Clock className="h-3 w-3 mr-1" />
                                대기중
                              </>
                            )}
                          </Badge>
                          <Button variant="ghost" size="icon-sm">
                            <Trash2 className="h-4 w-4 text-muted-foreground" />
                          </Button>
                        </div>
                      </motion.div>
                    ))}

                    <div className="rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 p-4 mt-4">
                      <div className="flex gap-3">
                        <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0" />
                        <div>
                          <h4 className="font-medium text-amber-900">발신번호 등록 안내</h4>
                          <p className="mt-1 text-sm text-amber-700">
                            발신번호 등록을 위해서는 통신사 서류 인증이 필요합니다.
                            사업자등록증과 통신서비스 이용증명원을 준비해주세요.
                          </p>
                        </div>
                      </div>
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
                        <p className="text-sm text-muted-foreground mt-1">
                          외부 시스템 연동을 위한 API 키를 관리하세요
                        </p>
                      </div>
                      <Button leftIcon={<Plus className="h-4 w-4" />}>
                        새 API 키
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {apiKeys.map((apiKey) => (
                      <motion.div
                        key={apiKey.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="rounded-xl border bg-card p-4 hover:shadow-sm transition-shadow"
                      >
                        <div className="flex items-start justify-between">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <p className="font-semibold">{apiKey.name}</p>
                              <Badge variant="success" size="sm">활성</Badge>
                            </div>
                            <div className="flex items-center gap-2">
                              <code className="rounded-lg bg-muted px-3 py-1.5 text-sm font-mono">
                                {showApiKey === apiKey.id ? apiKey.key : '••••••••••••••••••••••••••'}
                              </code>
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                onClick={() => setShowApiKey(showApiKey === apiKey.id ? null : apiKey.id)}
                              >
                                {showApiKey === apiKey.id ? (
                                  <EyeOff className="h-4 w-4" />
                                ) : (
                                  <Eye className="h-4 w-4" />
                                )}
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                onClick={() => handleCopyApiKey(apiKey.key)}
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              마지막 사용: {apiKey.lastUsed} • 생성: {apiKey.createdAt}
                            </p>
                          </div>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="icon-sm">
                              <RefreshCw className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon-sm">
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    ))}

                    <div className="rounded-xl bg-gradient-to-r from-pingly-50 to-violet-50 border border-pingly-200 p-4">
                      <h4 className="font-medium text-pingly-900">API 문서</h4>
                      <p className="mt-1 text-sm text-pingly-700">
                        API 연동 방법은{' '}
                        <a href="#" className="text-pingly-600 font-medium hover:underline">
                          개발자 문서
                        </a>
                        를 참고하세요. REST API 및 웹훅을 지원합니다.
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
                    <p className="text-sm text-muted-foreground">알림 수신 방법을 설정하세요</p>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {notificationSettings.map((item) => (
                      <div key={item.id} className="flex items-center justify-between py-2">
                        <div className="space-y-0.5">
                          <p className="font-medium">{item.title}</p>
                          <p className="text-sm text-muted-foreground">{item.description}</p>
                        </div>
                        <Switch defaultChecked={item.defaultChecked} />
                      </div>
                    ))}

                    <div className="flex justify-end pt-4 border-t">
                      <Button>저장</Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Security Settings */}
              {activeTab === 'security' && (
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>비밀번호 변경</CardTitle>
                      <p className="text-sm text-muted-foreground">계정 비밀번호를 변경하세요</p>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">현재 비밀번호</label>
                        <Input type="password" placeholder="••••••••" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">새 비밀번호</label>
                        <Input type="password" placeholder="••••••••" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">새 비밀번호 확인</label>
                        <Input type="password" placeholder="••••••••" />
                      </div>
                      <div className="flex justify-end pt-4">
                        <Button>비밀번호 변경</Button>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>2단계 인증</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        계정 보안을 강화하기 위해 2단계 인증을 설정하세요
                      </p>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-mint-100 to-mint-200">
                            <Shield className="h-5 w-5 text-mint-600" />
                          </div>
                          <div>
                            <p className="font-medium">인증 앱 사용</p>
                            <p className="text-sm text-muted-foreground">
                              Google Authenticator 또는 유사한 앱을 사용합니다
                            </p>
                          </div>
                        </div>
                        <Button variant="outline">설정</Button>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-destructive/50">
                    <CardHeader>
                      <CardTitle className="text-destructive">위험 구역</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        이 작업은 되돌릴 수 없습니다
                      </p>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">계정 삭제</p>
                          <p className="text-sm text-muted-foreground">
                            모든 데이터가 영구적으로 삭제됩니다
                          </p>
                        </div>
                        <Button variant="destructive">계정 삭제</Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
