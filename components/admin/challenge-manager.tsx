'use client'

import { useState, useTransition, useRef } from 'react'
import { Plus, Pencil, Trash2, EyeOff, Upload, RotateCcw } from 'lucide-react'
import { toast } from 'sonner'
import {
  createChallenge,
  deleteChallenge,
  updateChallenge,
  importChallengesAction,
  resetChallengesAction
} from '@/app/actions/admin'
import type { Challenge } from '@/lib/db'
import { categoryColor } from '@/lib/category-colors'
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
  const [isResetting, startReset] = useTransition()
  const fileInputRef = useRef<HTMLInputElement>(null)

  function handleJSONImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const text = event.target?.result as string
      if (!text) return

      startImport(async () => {
        try {
          const parsed = JSON.parse(text)
          if (!Array.isArray(parsed)) {
            toast.error("Le fichier JSON doit être une liste de défis (un tableau []).")
            return
          }
          await importChallengesAction(parsed)
          toast.success("Défis importés avec succès !")
        } catch (e) {
          toast.error("Erreur lors de l'import du fichier JSON.")
        }
      })
    }
    reader.readAsText(file)
  }

  async function handleReset() {
    const confirmReset = confirm(
      "⚠️ ATTENTION : Vous allez supprimer TOUS LES DÉFIS ainsi que toutes les validations des équipes. Cette action est irréversible. Voulez-vous continuer ?"
    )
    if (!confirmReset) return

    startReset(async () => {
      const res = await resetChallengesAction()
      if (res?.error) {
        toast.error(res.error)
      } else {
        toast.success("Tous les défis ont été supprimés. Prêt pour en importer de nouveaux ! 🏁")
      }
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <NewChallengeDialog />

        <Button size="sm" onClick={() => fileInputRef.current?.click()} disabled={isImporting}>
          <Upload className="size-4 mr-2" /> Importer JSON
        </Button>
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept=".json"
          onChange={handleJSONImport}
        />

        <Button
          size="sm"
          variant="destructive"
          onClick={handleReset}
          disabled={isResetting}
        >
          <RotateCcw className="size-4 mr-2" /> Supprimer tous les défis
        </Button>
      </div>

      <div className="grid gap-2">
        {challenges.map((c) => (
          <div key={c.id} className="p-4 border rounded-lg flex justify-between items-center">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold">{c.title}</h3>
                {c.category && (
                  <span
                    className="rounded-full px-2 py-0.5 text-xs font-semibold"
                    style={{
                      backgroundColor: categoryColor(c.category).bg,
                      color: categoryColor(c.category).text,
                    }}
                  >
                    {c.category}
                  </span>
                )}
                {c.exclusive && (
                  <span className="rounded-full bg-pending/15 px-2 py-0.5 text-xs font-semibold text-pending">
                    1 équipe max
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground">{c.description}</p>
            </div>
            <DeleteButton id={c.id} title={c.title} />
          </div>
        ))}
      </div>
    </div>
  )
}

function NewChallengeDialog() {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [points, setPoints] = useState('10')
  const [category, setCategory] = useState('')
  const [exclusive, setExclusive] = useState(false)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    startTransition(async () => {
      const res = await createChallenge({
        title,
        description,
        points: Number(points) || 0,
        category: category.trim() || undefined,
        exclusive,
      })
      if (res?.error) {
        toast.error(res.error)
        return
      }
      toast.success('Défi créé !')
      setOpen(false)
      setTitle('')
      setDescription('')
      setPoints('10')
      setCategory('')
      setExclusive(false)
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="size-4 mr-2" /> Nouveau défi
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-display text-xl">Nouveau défi</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="c-title">Titre</Label>
            <Input id="c-title" value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="c-desc">Description</Label>
            <Textarea
              id="c-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="c-points">Points</Label>
              <Input
                id="c-points"
                type="number"
                min={0}
                value={points}
                onChange={(e) => setPoints(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="c-category">Catégorie</Label>
              <Input
                id="c-category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Ex: Physique"
              />
            </div>
          </div>
          <label className="flex items-start gap-2 text-sm">
            <input
              type="checkbox"
              checked={exclusive}
              onChange={(e) => setExclusive(e.target.checked)}
              className="mt-0.5 size-4 shrink-0 rounded border-border"
            />
            <span>
              Validable par une seule équipe
              <span className="block text-xs text-muted-foreground">
                Dès qu'une équipe le valide, le défi disparaît pour tout le monde.
              </span>
            </span>
          </label>
          <Button type="submit" disabled={isPending}>
            {isPending ? 'Création...' : 'Créer le défi'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function DeleteButton({ id, title }: { id: number; title: string }) {
  const [isPending, startTransition] = useTransition()
  
  function handleDelete() {
    if (!confirm(`Supprimer "${title}" ?`)) return
    
    startTransition(async () => {
      try {
        const res = await deleteChallenge(id)
        if (res?.error) {
          toast.error(`Impossible de supprimer : ${res.error}`)
        } else {
          toast.success('Défi supprimé avec succès !')
        }
      } catch (e) {
        toast.error("Erreur de connexion avec le serveur.")
      }
    })
  }

  return (
    <Button size="sm" variant="ghost" onClick={handleDelete} disabled={isPending}>
      <Trash2 className="size-4 text-destructive" />
    </Button>
  )
}
