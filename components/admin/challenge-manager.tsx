'use client'

import { useState, useTransition, useRef } from 'react'
import { Plus, Pencil, Trash2, EyeOff, Upload, RotateCcw } from 'lucide-react'
import { toast } from 'sonner'
import { 
  createChallenge, 
  deleteChallenge, 
  updateChallenge, 
  importChallengesAction,
  resetDatabaseAction 
} from '@/app/actions/admin'
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
      "⚠️ ATTENTION : Vous allez supprimer TOUTES les validations des équipes et remettre TOUS les scores à zéro. Cette action est irréversible. Voulez-vous continuer ?"
    )
    if (!confirmReset) return

    startReset(async () => {
      const res = await resetDatabaseAction()
      if (res?.error) {
        toast.error(res.error)
      } else {
        toast.success("Le jeu a été réinitialisé avec succès ! Prêt pour le départ. 🏁")
      }
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
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
          <RotateCcw className="size-4 mr-2" /> Réinitialiser
        </Button>
      </div>

      <div className="grid gap-2">
        {challenges.map((c) => (
          <div key={c.id} className="p-4 border rounded-lg flex justify-between items-center">
            <div>
              <h3 className="font-semibold">{c.title}</h3>
              <p className="text-sm text-muted-foreground">{c.description}</p>
            </div>
            <DeleteButton id={c.id} title={c.title} />
          </div>
        ))}
      </div>
    </div>
  )
}

function DeleteButton({ id, title }: { id: number; title: string }) {
  const [isPending, startTransition] = useTransition()
  
  function handleDelete() {
    if (!confirm(`Supprimer "${title}" ?`)) return
    startTransition(async () => {
      await deleteChallenge(id)
      toast.success('Défi supprimé.')
    })
  }

  return (
    <Button size="sm" variant="ghost" onClick={handleDelete} disabled={isPending}>
      <Trash2 className="size-4 text-destructive" />
    </Button>
  )
}
