'use client'

import Link from 'next/link'
import { useState, useTransition } from 'react'
import { Shield, ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import { loginAdmin } from '@/app/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function AdminLogin() {
  const [code, setCode] = useState('')
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    startTransition(async () => {
      const res = await loginAdmin(code)
      if (res.error) {
        toast.error(res.error)
        return
      }
      toast.success('Welcome, admin.')
    })
  }

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-xl border border-border bg-card p-6">
        <div className="flex size-11 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Shield className="size-6" />
        </div>
        <h1 className="mt-4 font-display text-2xl font-bold">Admin access</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Enter the admin code to review submissions and manage the game.
        </p>

        <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="admin-code">Admin code</Label>
            <Input
              id="admin-code"
              type="password"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Enter admin code"
              autoComplete="off"
              autoFocus
            />
          </div>
          <Button type="submit" disabled={isPending || !code.trim()}>
            {isPending ? 'Checking...' : 'Unlock dashboard'}
          </Button>
        </form>

        <Link
          href="/"
          className="mt-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Back to the game
        </Link>
      </div>
    </div>
  )
}
