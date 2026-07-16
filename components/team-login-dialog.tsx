'use client'

import { useState, useTransition } from 'react'
import { KeyRound } from 'lucide-react'
import { toast } from 'sonner'
import { loginTeam } from '@/app/actions/auth'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function TeamLoginDialog({
  triggerLabel = 'Team login',
  variant = 'default',
  className,
}: {
  triggerLabel?: string
  variant?: 'default' | 'outline' | 'secondary'
  className?: string
}) {
  const [open, setOpen] = useState(false)
  const [code, setCode] = useState('')
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    startTransition(async () => {
      const res = await loginTeam(code)
      if (res.error) {
        toast.error(res.error)
        return
      }
      toast.success(`Welcome, ${res.teamName}! Time to rack up points.`)
      setOpen(false)
      setCode('')
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant={variant} className={className} />}>
        <KeyRound className="size-4" />
        {triggerLabel}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">Enter your team code</DialogTitle>
          <DialogDescription>
            Each team has a unique code. Enter it to log in and start submitting proof for
            challenges.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="team-code">Team code</Label>
            <Input
              id="team-code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="e.g. LADS-01"
              autoComplete="off"
              autoFocus
              className="font-mono uppercase tracking-widest"
            />
          </div>
          <Button type="submit" disabled={isPending || !code.trim()}>
            {isPending ? 'Checking...' : 'Log in'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
