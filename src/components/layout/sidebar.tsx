'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MessageSquare,
  LayoutDashboard,
  Users,
  Send,
  BarChart3,
  CreditCard,
  Settings,
  HelpCircle,
  LogOut,
  ChevronLeft,
  Menu,
  X,
  Sparkles,
  Zap,
} from 'lucide-react'
import { signOut } from 'next-auth/react'
import { Button } from '@/components/primitives'
import { Badge } from '@/components/primitives'
import { useState } from 'react'

const navigation = [
  { name: '대시보드', href: '/dashboard', icon: LayoutDashboard },
  { name: '연락처', href: '/dashboard/contacts', icon: Users },
  { name: '캠페인', href: '/dashboard/campaigns', icon: Send, badge: 'New' },
  { name: '분석', href: '/dashboard/analytics', icon: BarChart3 },
  { name: '요금/결제', href: '/dashboard/billing', icon: CreditCard },
  { name: '설정', href: '/dashboard/settings', icon: Settings },
]

const sidebarVariants = {
  open: { x: 0, transition: { type: 'spring', stiffness: 300, damping: 30 } },
  closed: { x: '-100%', transition: { type: 'spring', stiffness: 300, damping: 30 } },
}

const overlayVariants = {
  open: { opacity: 1, transition: { duration: 0.2 } },
  closed: { opacity: 0, transition: { duration: 0.2 } },
}

export function Sidebar() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      {/* Mobile toggle button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed left-4 top-4 z-50 shadow-md bg-background lg:hidden"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? '메뉴 닫기' : '메뉴 열기'}
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Mobile overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
            variants={overlayVariants}
            initial="closed"
            animate="open"
            exit="closed"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-card lg:static lg:!transform-none',
          'border-r border-border/50'
        )}
        variants={sidebarVariants}
        initial="closed"
        animate={isOpen ? 'open' : 'closed'}
        style={{ transform: 'none' }}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between border-b border-border/50 px-4">
          <Link href="/dashboard" className="flex items-center gap-2 group">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-pingly-500 to-violet-500 rounded-lg blur-sm opacity-50 group-hover:opacity-75 transition-opacity" />
              <div className="relative bg-gradient-to-r from-pingly-500 to-violet-500 rounded-lg p-1.5">
                <MessageSquare className="h-5 w-5 text-white" />
              </div>
            </div>
            <span className="text-lg font-bold bg-gradient-to-r from-pingly-600 to-violet-600 bg-clip-text text-transparent">
              Pingly
            </span>
          </Link>
          <button
            className="rounded-lg p-1.5 hover:bg-muted transition-colors lg:hidden"
            onClick={() => setIsOpen(false)}
            aria-label="메뉴 닫기"
          >
            <ChevronLeft className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>

        {/* Credit indicator */}
        <div className="mx-4 mt-4 p-3 rounded-xl bg-gradient-to-r from-pingly-500/10 to-violet-500/10 border border-pingly-500/20">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-muted-foreground">남은 크레딧</span>
            <Badge variant="pingly" size="sm">Pro</Badge>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold">8,500</span>
            <span className="text-xs text-muted-foreground">크레딧</span>
          </div>
          <div className="mt-2 h-1.5 w-full rounded-full bg-muted overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-pingly-500 to-violet-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: '68%' }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
          </div>
          <Link href="/dashboard/billing" className="block mt-3">
            <Button variant="outline" size="sm" className="w-full text-xs" leftIcon={<Zap className="h-3 w-3" />}>
              크레딧 충전
            </Button>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto p-4">
          <p className="px-3 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            메뉴
          </p>
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'text-white'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                )}
                onClick={() => setIsOpen(false)}
              >
                {/* Active background */}
                {isActive && (
                  <motion.div
                    layoutId="activeNav"
                    className="absolute inset-0 rounded-xl bg-gradient-to-r from-pingly-500 to-pingly-600 shadow-md"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}

                <span className="relative z-10">
                  <item.icon className="h-5 w-5" />
                </span>
                <span className="relative z-10 flex-1">{item.name}</span>

                {/* Badge */}
                {item.badge && (
                  <Badge
                    variant={isActive ? 'secondary' : 'gradient'}
                    size="sm"
                    className="relative z-10 text-[10px] px-1.5"
                  >
                    {item.badge}
                  </Badge>
                )}
              </Link>
            )
          })}
        </nav>

        {/* Bottom section */}
        <div className="border-t border-border/50 p-4 space-y-1">
          <Link
            href="/help"
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors"
          >
            <HelpCircle className="h-5 w-5" />
            도움말
          </Link>
          <button
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-500/10 transition-colors"
            onClick={() => signOut({ callbackUrl: '/' })}
          >
            <LogOut className="h-5 w-5" />
            로그아웃
          </button>
        </div>
      </motion.aside>

      {/* Desktop persistent sidebar */}
      <style jsx global>{`
        @media (min-width: 1024px) {
          aside {
            transform: none !important;
          }
        }
      `}</style>
    </>
  )
}
