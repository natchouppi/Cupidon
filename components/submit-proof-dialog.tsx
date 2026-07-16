'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { submitProof } from '@/app/actions/submissions'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea' // Si vous n'avez pas ce composant, utilisez une balise <textarea> classique
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

export function SubmitProofDialog({
  open,
  onOpenChange,
  challengeId,
  challengeTitle,
  points,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  challengeId: number
  challengeTitle: string
  points: number
}) {
  const [note, setNote] = useState('')
  const [busy, setBusy] = useState(false)

  function reset() {
    setNote('')
    setBusy(false)
  }

  async function handleSubmit() {
    setBusy(true)
    try {
      // Nous appelons l'action d'enregistrement en base de données 
      // sans envoyer d'image (proofUrl est vide, et mediaType est à null ou 'image')
      const res = await submitProof({
        challengeId,
        proofUrl: '', // Pas d'image
        mediaType: 'image',
        // Si votre action accepte une note ou un texte d'explication, vous pouvez l'envoyer ici
      })

      if (res.error) {
        toast.error(res.error)
        setBusy(false)
        return
      }

      toast.success('Demande envoyée ! En attente de validation par un admin.')
      reset()
      onOpenChange(false)
    } catch (err) {
      console.error('[App] Submit error', err)
      toast.error((err as Error).message || 'Échec de la demande. Réessayez.')
      setBusy(false)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!busy) {
          onOpenChange(o)
          if (!o) reset()
        }
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-display text-xl text-balance">{challengeTitle}</DialogTitle>
          <DialogDescription>
            Demander la validation de ce défi. Il vous rapportera{' '}
            <span className="font-semibold text-accent">{points} pts</span> une fois qu'un admin aura approuvé votre demande.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="note" className="text-sm font-medium text-muted-foreground">
              Note pour les admins (optionnel) :
            </label>
            <textarea
              id="note"
              placeholder="Expliquez brièvement comment vous avez réalisé le défi..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="min-h-[80px] w-full rounded-lg border border-border bg-card p-3 text-sm outline-none focus:border-primary"
              disabled={busy}
            />
          </div>

          <Button onClick={handleSubmit} disabled={busy}>
            {busy ? 'Envoi en cours...' : 'Demander la validation'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
