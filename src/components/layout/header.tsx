'use client'

import { useSession } from 'next-auth/react'
import { Bell, Search, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Link from 'next/link'

export function Header() {
  const { data: session } = useSession()

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 sm:px-6">
      <div className="hidden flex-1 md:block">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="검색..."
            className="pl-9"
          />
        </div>
      </div>

      <div className="ml-auto flex items-center gap-4">
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
            3
          </span>
        </Button>

        <Link href="/dashboard/settings">
          <Button variant="ghost" className="gap-2">
            {session?.user?.image ? (
              <img
                src={session.user.image}
                alt={session.user.name || ''}
                className="h-8 w-8 rounded-full"
              />
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <User className="h-4 w-4" />
              </div>
            )}
            <span className="hidden text-sm font-medium sm:inline-block">
              {session?.user?.name || '사용자'}
            </span>
          </Button>
        </Link>
      </div>
    </header>
  )
}
