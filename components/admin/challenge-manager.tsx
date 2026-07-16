'use client'

import { useState, useTransition, useRef } from 'react'
import { Plus, Pencil, Trash2, EyeOff, Upload } from 'lucide-react'
import { toast } from 'sonner'
import { createChallenge, deleteChallenge, updateChallenge } from '@/app/actions/admin'
// Importez l'action que nous venons de créer à l'étape 1 (ajustez le chemin si nécessaire)
import { importChallengesAction } from '@/app/actions/admin' 
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
  const [isImporting, startImport] = useTransition()
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Fonction pour lire et parser le fichier CSV sélectionné par l'admin
  function handleCSVImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const text = event.target?.result as string
      if (!text) return

      startImport(async () => {
        try {
          const lines = text.split('\n')
          const header = lines.shift() // Retirer l'en-tête (title,description,points)
          const parsedChallenges: { title: string; description: string; points: number }[] = []

          for (const line of lines) {
            if (!line.trim()) continue

            // Regex robuste pour séparer par virgule tout en ignorant les virgules dans les guillemets ""
            const matches = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g)
            if (!matches || matches.length < 3) continue

            const title = matches[0].replace(/^"|"$/g, '').trim()
            const description = matches[1].replace(/^"|"$/g, '').trim()
            const points = parseInt(matches[2].replace(/^"|"$/g, '').trim(), 10)

            if (title && !isNaN(points)) {
              parsedChallenges.push({ title, description, points })
            }
          }

          if (parsedChallenges.length === 0) {
            toast.error("Aucun défi valide trouvé dans le CSV. Vérifiez le format.")
            return
          }

          // Appel de l'action pour insérer en Base de Données
          const res = await importChallengesAction(parsedChallenges)
          if (res?.error) {
            toast.error(res.error)
          } else {
            toast.success(`${res.count} défis importés avec succès !`)
          }
        } catch (err) {
          toast.error("Erreur lors de la lecture du fichier CSV.")
        }
      })
    }
    reader.readAsText(file, 'utf-8')
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <p className="text-sm text-muted-foreground">
          {challenges.length} défi{challenges.length === 1 ? '' : 's'}
        </p>
        
        <div className="flex items-center gap-2">
          {/* Input masqué pour charger le CSV */}
          <input
            type="file"
            accept=".csv"
            ref={fileInputRef}
            onChange={handleCSVImport}
            className="hidden"
          />
          <Button 
            size="sm" 
            variant="outline" 
            disabled={isImporting}
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="mr-1.5 size-4" />
            {isImporting ? 'Importation...' : 'Importer un CSV'}
          </Button>

          <ChallengeDialog
            trigger={
              <Button size="sm">
                <Plus className="size-4" />
                Nouveau défi
              </Button>
            }
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {challenges.map((c) => (
          <div key={c.id} className="flex flex-col gap-2 rounded-xl border border-border bg-card p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="font-display text-base font-bold flex items-center gap-1.5">
                  {!c.active && <EyeOff className="size-4 text-muted-foreground shrink-0" />}
                  <span className="truncate">{c.title}</span>
                </h3>
                <p className="text-sm text-muted-foreground line-clamp-2 mt-0.5">{c.description}</p>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-bold">
                  {c.points} pts
                </span>
                <ChallengeDialog
                  challenge={c}
                  trigger={
                    <Button size="sm" variant="ghost">
                      <Pencil className="size-4" />
                    </Button>
                  }
                />
                <DeleteChallengeButton id={c.id} title={c.title} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// --- Les sous-composants ChallengeDialog et DeleteChallengeButton restent identiques ---
function ChallengeDialog({
  challenge,
  trigger,
}: {
  challenge?: Challenge
  trigger: React.ReactNode
}) {
  const editing = !!challenge
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState(challenge?.title || '')
  const [description, setDescription] = useState(challenge?.description || '')
  const [points, setPoints] = useState(challenge?.points?.toString() || '10')
  const [active, setActive] = useState(editing ? challenge.active : true)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    startTransition(async () => {
      const pts = parseInt(points, 10)
      if (isNaN(pts)) {
        toast.error('Points must be a number.')
        return
      }

      let res
      if (editing && challenge) {
        res = await updateChallenge(challenge.id, {
          title: title.trim(),
          description: description.trim(),
          points: pts,
          active,
        })
      } else {
        res = await createChallenge({
          title: title.trim(),
          description: description.trim(),
          points: pts,
        })
      }

      if (res?.error) {
        toast.error(res.error)
        return
      }

      toast.success(editing ? 'Challenge updated.' : 'Challenge created.')
      setOpen(false)
      if (!editing) {
        setTitle('')
        setDescription('')
        setPoints('10')
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{editing ? 'Edit challenge' : 'New challenge'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="c-title">Title</Label>
            <Input
              id="c-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="c-desc">Description</Label>
            <Textarea
              id="c-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
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
