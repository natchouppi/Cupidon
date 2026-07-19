'use client'

import { useState, useTransition } from 'react'
import { Plus, Pencil, Trash2, Copy, Check, RotateCcw } from 'lucide-react'
import { toast } from 'sonner'
import { createTeam, deleteTeam, updateTeam, resetScoresAction } from '@/app/actions/admin'
import type { Team } from '@/lib/db'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

export function TeamManager({ teams }: { teams: Team[] }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {teams.length} team{teams.length === 1 ? '' : 's'} · share each code with its two players
        </p>
        <div className="flex gap-2">
          <ResetScoresButton />
          <TeamDialog
            trigger={
              <Button size="sm">
                <Plus className="size-4" />
                New team
              </Button>
            }
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {teams.map((t) => (
          <div key={t.id} className="flex items-center gap-3 rounded-xl border border-border bg-card p-4">
            <div className="flex min-w-0 flex-1 flex-col">
              <span className="truncate font-display font-bold">{t.name}</span>
              <CodePill code={t.code} />
            </div>
            <div className="flex gap-1">
              <TeamDialog
                team={t}
                trigger={
                  <Button size="sm" variant="outline">
                    <Pencil className="size-4" />
                  </Button>
                }
              />
              <DeleteTeamButton id={t.id} name={t.name} />
            </div>
          </div>
        ))}
        {teams.length === 0 && (
          <div className="col-span-full rounded-xl border border-dashed border-border bg-card px-6 py-10 text-center text-sm text-muted-foreground">
            No teams yet. Create your first team.
          </div>
        )}
      </div>
    </div>
  )
}

function CodePill({ code }: { code: string }) {
  const [copied, setCopied] = useState(false)
  function copy() {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true)
      toast.success('Code copied.')
      setTimeout(() => setCopied(false), 1500)
    })
  }
  return (
    <button
      type="button"
      onClick={copy}
      className="mt-1 inline-flex w-fit items-center gap-1.5 rounded-md bg-secondary px-2 py-1 font-mono text-xs font-medium tracking-widest text-secondary-foreground hover:bg-secondary/70"
    >
      {code}
      {copied ? <Check className="size-3.5 text-accent" /> : <Copy className="size-3.5" />}
    </button>
  )
}

function TeamDialog({ team, trigger }: { team?: Team; trigger: React.ReactNode }) {
  const editing = !!team
  const [open, setOpen] = useState(false)
  const [name, setName] = useState(team?.name ?? '')
  const [code, setCode] = useState(team?.code ?? '')
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    startTransition(async () => {
      const res = editing
        ? await updateTeam({ id: team.id, name, code })
        : await createTeam({ name, code: code || undefined })
      if (res?.error) {
        toast.error(res.error)
        return
      }
      toast.success(editing ? 'Team updated.' : 'Team created.')
      setOpen(false)
      if (!editing) {
        setName('')
        setCode('')
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-display text-xl">
            {editing ? 'Edit team' : 'New team'}
          </DialogTitle>
          <DialogDescription>
            {editing
              ? 'Update the team name or code.'
              : 'Leave the code blank to auto-generate one.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="t-name">Team name</Label>
            <Input id="t-name" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="t-code">Team code {!editing && '(optional)'}</Label>
            <Input
              id="t-code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Auto-generated if empty"
              className="font-mono uppercase tracking-widest"
            />
          </div>
          <Button type="submit" disabled={isPending}>
            {isPending ? 'Saving...' : editing ? 'Save changes' : 'Create team'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function ResetScoresButton() {
  const [isPending, startTransition] = useTransition()

  function handleReset() {
    const confirmed = confirm(
      '⚠️ Cela va supprimer toutes les validations et remettre tous les scores à zéro, sans toucher aux équipes ni aux défis. Continuer ?'
    )
    if (!confirmed) return

    startTransition(async () => {
      const res = await resetScoresAction()
      if (res?.error) {
        toast.error(res.error)
      } else {
        toast.success('Scores remis à zéro.')
      }
    })
  }

  return (
    <Button size="sm" variant="destructive" onClick={handleReset} disabled={isPending}>
      <RotateCcw className="size-4" />
      Reset scores
    </Button>
  )
}

function DeleteTeamButton({ id, name }: { id: number; name: string }) {
  const [isPending, startTransition] = useTransition()
  function handleDelete() {
    if (!confirm(`Delete "${name}"? This also removes their submissions.`)) return
    startTransition(async () => {
      await deleteTeam(id)
      toast.success('Team deleted.')
    })
  }
  return (
    <Button size="sm" variant="ghost" onClick={handleDelete} disabled={isPending}>
      <Trash2 className="size-4 text-destructive" />
    </Button>
  )
}
