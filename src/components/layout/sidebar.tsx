'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
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
} from 'lucide-react'
import { signOut } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { useState } from 'react'

const navigation = [
  { name: '대시보드', href: '/dashboard', icon: LayoutDashboard },
  { name: '연락처', href: '/dashboard/contacts', icon: Users },
  { name: '캠페인', href: '/dashboard/campaigns', icon: Send },
  { name: '분석', href: '/dashboard/analytics', icon: BarChart3 },
  { name: '요금/결제', href: '/dashboard/billing', icon: CreditCard },
  { name: '설정', href: '/dashboard/settings', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <>
      {/* Mobile overlay */}
      <div
        className={cn(
          'fixed inset-0 z-40 bg-black/50 lg:hidden',
          collapsed ? 'hidden' : 'block lg:hidden'
        )}
        onClick={() => setCollapsed(true)}
      />

      {/* Mobile toggle button */}
      <button
        className="fixed left-4 top-4 z-50 rounded-md bg-background p-2 shadow-md lg:hidden"
        onClick={() => setCollapsed(!collapsed)}
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r bg-card transition-transform lg:static lg:translate-x-0',
          collapsed ? '-translate-x-full' : 'translate-x-0'
        )}
      >
        <div className="flex h-16 items-center justify-between border-b px-4">
          <Link href="/dashboard" className="flex items-center gap-2">
            <MessageSquare className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold">Pingly</span>
          </Link>
          <button
            className="rounded-md p-1 hover:bg-accent lg:hidden"
            onClick={() => setCollapsed(true)}
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-4">
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                )}
                onClick={() => setCollapsed(true)}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </Link>
            )
          })}
        </nav>

        <div className="border-t p-4">
          <Link
            href="/help"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground"
          >
            <HelpCircle className="h-5 w-5" />
            도움말
          </Link>
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 px-3 text-muted-foreground hover:text-destructive"
            onClick={() => signOut({ callbackUrl: '/' })}
          >
            <LogOut className="h-5 w-5" />
            로그아웃
          </Button>
        </div>
      </aside>
    </>
  )
}
