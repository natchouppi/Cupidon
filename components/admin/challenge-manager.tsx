'use client'

import { useState, useTransition } from 'react'
import { Plus, Pencil, Trash2, EyeOff } from 'lucide-react'
import { toast } from 'sonner'
import { createChallenge, deleteChallenge, updateChallenge } from '@/app/actions/admin'
import type { Challenge } from '@/lib/db'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

export function ChallengeManager({ challenges }: { challenges: Challenge[] }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {challenges.length} challenge{challenges.length === 1 ? '' : 's'}
        </p>
        <ChallengeDialog
          trigger={
            <Button size="sm">
              <Plus className="size-4" />
              New challenge
            </Button>
          }
        />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {challenges.map((c) => (
          <div key={c.id} className="flex flex-col gap-2 rounded-xl border border-border bg-card p-4">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-display font-bold leading-tight text-balance">{c.title}</h3>
              <span className="shrink-0 rounded-full bg-primary px-2.5 py-1 font-display text-xs font-bold text-primary-foreground">
                {c.points} pts
              </span>
            </div>
            {c.description && (
              <p className="text-sm text-muted-foreground">{c.description}</p>
            )}
            <div className="mt-auto flex items-center justify-between pt-2">
              {!c.active && (
                <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                  <EyeOff className="size-3.5" />
                  Hidden
                </span>
              )}
              <div className="ml-auto flex gap-2">
                <ChallengeDialog
                  challenge={c}
                  trigger={
                    <Button size="sm" variant="outline">
                      <Pencil className="size-4" />
                      Edit
                    </Button>
                  }
                />
                <DeleteChallengeButton id={c.id} title={c.title} />
              </div>
            </div>
          </div>
        ))}
        {challenges.length === 0 && (
          <div className="col-span-full rounded-xl border border-dashed border-border bg-card px-6 py-10 text-center text-sm text-muted-foreground">
            No challenges yet. Create your first one.
          </div>
        )}
      </div>
    </div>
  )
}

function ChallengeDialog({
  challenge,
  trigger,
}: {
  challenge?: Challenge
  trigger: React.ReactNode
}) {
  const editing = !!challenge
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState(challenge?.title ?? '')
  const [description, setDescription] = useState(challenge?.description ?? '')
  const [points, setPoints] = useState(String(challenge?.points ?? 100))
  const [active, setActive] = useState(challenge?.active ?? true)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    startTransition(async () => {
      const res = editing
        ? await updateChallenge({
            id: challenge.id,
            title,
            description,
            points: Number(points),
            active,
          })
        : await createChallenge({ title, description, points: Number(points) })
      if (res?.error) {
        toast.error(res.error)
        return
      }
      toast.success(editing ? 'Challenge updated.' : 'Challenge created.')
      setOpen(false)
      if (!editing) {
        setTitle('')
        setDescription('')
        setPoints('100')
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-display text-xl">
            {editing ? 'Edit challenge' : 'New challenge'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="c-title">Title</Label>
            <Input id="c-title" value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="c-desc">Description</Label>
            <Textarea
              id="c-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="What do they have to do to complete it?"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="c-points">Points</Label>
            <Input
              id="c-points"
              type="number"
              min={0}
              value={points}
              onChange={(e) => setPoints(e.target.value)}
              required
            />
          </div>
          {editing && (
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={active}
                onChange={(e) => setActive(e.target.checked)}
                className="size-4 accent-[var(--primary)]"
              />
              Visible to teams
            </label>
          )}
          <Button type="submit" disabled={isPending}>
            {isPending ? 'Saving...' : editing ? 'Save changes' : 'Create challenge'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function DeleteChallengeButton({ id, title }: { id: number; title: string }) {
  const [isPending, startTransition] = useTransition()
  function handleDelete() {
    if (!confirm(`Delete "${title}"? This also removes its submissions.`)) return
    startTransition(async () => {
      await deleteChallenge(id)
      toast.success('Challenge deleted.')
    })
  }
  return (
    <Button size="sm" variant="ghost" onClick={handleDelete} disabled={isPending}>
      <Trash2 className="size-4 text-destructive" />
    </Button>
  )
}
