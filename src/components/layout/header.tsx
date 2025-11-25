'use client'

import { useSession } from 'next-auth/react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, Search, User, ChevronDown, Settings, LogOut, Moon, Sun, Command } from 'lucide-react'
import { Button, Input, Badge, Avatar, AvatarFallback, AvatarImage } from '@/components/primitives'
import Link from 'next/link'
import { useState } from 'react'
import { cn } from '@/lib/utils'

const notifications = [
  {
    id: 1,
    title: '캠페인 발송 완료',
    message: '11월 프로모션 캠페인이 성공적으로 발송되었습니다.',
    time: '5분 전',
    read: false,
    type: 'success',
  },
  {
    id: 2,
    title: '크레딧 부족 알림',
    message: '크레딧이 1,000 미만입니다. 충전을 권장합니다.',
    time: '1시간 전',
    read: false,
    type: 'warning',
  },
  {
    id: 3,
    title: '새로운 기능 출시',
    message: 'AI 메시지 최적화 기능이 출시되었습니다.',
    time: '어제',
    read: true,
    type: 'info',
  },
]

export function Header() {
  const { data: session } = useSession()
  const [showNotifications, setShowNotifications] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border/50 bg-background/80 backdrop-blur-xl px-4 sm:px-6">
      {/* Search - Desktop */}
      <div className="hidden flex-1 md:block">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="검색... (⌘K)"
            variant="filled"
            inputSize="sm"
            className="pl-10 pr-20"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 hidden sm:flex items-center gap-1">
            <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
              <Command className="h-3 w-3" />K
            </kbd>
          </div>
        </div>
      </div>

      {/* Right side actions */}
      <div className="ml-auto flex items-center gap-2">
        {/* Mobile search */}
        <Button variant="ghost" size="icon" className="md:hidden">
          <Search className="h-5 w-5" />
        </Button>

        {/* Notifications */}
        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            className="relative"
            onClick={() => setShowNotifications(!showNotifications)}
            aria-label="알림"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-gradient-to-r from-pingly-500 to-violet-500 text-[10px] font-medium text-white"
              >
                {unreadCount}
              </motion.span>
            )}
          </Button>

          {/* Notifications dropdown */}
          <AnimatePresence>
            {showNotifications && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowNotifications(false)}
                />
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-2 w-80 rounded-xl border bg-card shadow-xl z-50 overflow-hidden"
                >
                  <div className="flex items-center justify-between p-4 border-b">
                    <h3 className="font-semibold">알림</h3>
                    <Button variant="ghost" size="sm" className="text-xs">
                      모두 읽음
                    </Button>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={cn(
                          'p-4 border-b last:border-0 hover:bg-muted/50 transition-colors cursor-pointer',
                          !notification.read && 'bg-pingly-50/50 dark:bg-pingly-500/5'
                        )}
                      >
                        <div className="flex items-start gap-3">
                          <div className={cn(
                            'mt-0.5 h-2 w-2 rounded-full shrink-0',
                            notification.type === 'success' && 'bg-mint-500',
                            notification.type === 'warning' && 'bg-amber-500',
                            notification.type === 'info' && 'bg-pingly-500'
                          )} />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium">{notification.title}</p>
                            <p className="text-xs text-muted-foreground mt-0.5 truncate">
                              {notification.message}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">{notification.time}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="p-2 border-t">
                    <Link href="/dashboard/notifications" className="block">
                      <Button variant="ghost" size="sm" className="w-full text-xs">
                        모든 알림 보기
                      </Button>
                    </Link>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        {/* User menu */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className={cn(
              'flex items-center gap-2 rounded-xl px-2 py-1.5 transition-colors',
              'hover:bg-muted/50',
              showUserMenu && 'bg-muted/50'
            )}
          >
            <Avatar size="sm" status="online">
              {session?.user?.image ? (
                <AvatarImage src={session.user.image} alt={session.user.name || ''} />
              ) : (
                <AvatarFallback>
                  {session?.user?.name?.[0] || 'U'}
                </AvatarFallback>
              )}
            </Avatar>
            <span className="hidden text-sm font-medium sm:inline-block max-w-[100px] truncate">
              {session?.user?.name || '사용자'}
            </span>
            <ChevronDown className="h-4 w-4 text-muted-foreground hidden sm:block" />
          </button>

          {/* User dropdown */}
          <AnimatePresence>
            {showUserMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowUserMenu(false)}
                />
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-2 w-56 rounded-xl border bg-card shadow-xl z-50 overflow-hidden"
                >
                  {/* User info */}
                  <div className="p-4 border-b">
                    <div className="flex items-center gap-3">
                      <Avatar size="default">
                        {session?.user?.image ? (
                          <AvatarImage src={session.user.image} alt={session.user.name || ''} />
                        ) : (
                          <AvatarFallback>
                            {session?.user?.name?.[0] || 'U'}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{session?.user?.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{session?.user?.email}</p>
                      </div>
                    </div>
                    <Badge variant="pingly" size="sm" className="mt-3">
                      Professional 플랜
                    </Badge>
                  </div>

                  {/* Menu items */}
                  <div className="p-2">
                    <Link
                      href="/dashboard/settings"
                      className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-muted transition-colors"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <Settings className="h-4 w-4 text-muted-foreground" />
                      설정
                    </Link>
                    <button
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-muted transition-colors"
                    >
                      <Sun className="h-4 w-4 text-muted-foreground" />
                      테마 변경
                    </button>
                    <div className="my-2 border-t" />
                    <button
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
                      onClick={() => {
                        setShowUserMenu(false)
                        // signOut will be called here
                      }}
                    >
                      <LogOut className="h-4 w-4" />
                      로그아웃
                    </button>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  )
}
