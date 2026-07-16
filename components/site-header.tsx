'use client'

import Link from 'next/link'
import { useTransition } from 'react'
import { LogOut, Shield, Trophy } from 'lucide-react'
import { toast } from 'sonner'
import { logoutTeam } from '@/app/actions/auth'
import { Button } from '@/components/ui/button'
import { TeamLoginDialog } from '@/components/team-login-dialog'

export function SiteHeader({ teamName }: { teamName: string | null }) {
  const [isPending, startTransition] = useTransition()

  function handleLogout() {
    startTransition(async () => {
      await logoutTeam()
      toast.success('Logged out.')
    })
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Trophy className="size-5" />
          </span>
          <span className="font-display text-lg font-bold tracking-tight">The Lads League</span>
        </Link>

        <div className="flex items-center gap-2">
          {teamName ? (
            <>
              <span className="hidden items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-sm font-medium sm:flex">
                <span className="size-2 rounded-full bg-accent" />
                {teamName}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                disabled={isPending}
              >
                <LogOut className="size-4" />
                <span className="hidden sm:inline">Log out</span>
              </Button>
            </>
          ) : (
            <TeamLoginDialog />
          )}
          <Button asChild variant="ghost" size="sm">
            <Link href="/admin">
              <Shield className="size-4" />
              <span className="hidden sm:inline">Admin</span>
            </Link>
          </Button>
        </div>
      </div>
    </header>
  )
}
