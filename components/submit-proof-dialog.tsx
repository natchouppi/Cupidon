'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { submitProof } from '@/app/actions/submissions'
import { Button } from '@/components/ui/button'
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
  
  // State pour stocker la localisation GPS
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null)

  // Demander la localisation dès que la boîte de dialogue s'ouvre
  useEffect(() => {
    if (open) {
      requestLocation()
    }
  }, [open])

  function reset() {
    setNote('')
    setLocation(null)
    setBusy(false)
  }

  // Fonction pour demander la position GPS de l'appareil
  function requestLocation() {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          })
          toast.success('Position GPS récupérée ! 📍')
        },
        (error) => {
          console.error('Erreur GPS:', error)
          toast.error(
            'Veuillez activer votre GPS/localisation pour pouvoir valider ce défi.'
          )
        },
        { enableHighAccuracy: true, timeout: 10000 }
      )
    } else {
      toast.error("La géolocalisation n'est pas supportée par votre téléphone.")
    }
  }

  async function handleSubmit() {
    // Optionnel : Bloquer la soumission si on n'a pas pu obtenir la localisation GPS
    if (!location) {
      toast.error('Localisation GPS requise ! Veuillez autoriser le GPS et patienter une seconde.')
      requestLocation() // On retente d'obtenir la position
      return
    }

    setBusy(true)
    try {
      // On envoie à la fois le commentaire, la latitude et la longitude !
      const res = await submitProof({
        challengeId,
        proofUrl: '', // Pas de photo
        mediaType: 'image',
        comment: note.trim(), // On passe la note en commentaire
        latitude: location.latitude,
        longitude: location.longitude,
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
          <DialogTitle className="font-display text-xl text-balance">
            {challengeTitle}
          </DialogTitle>
          <DialogDescription>
            Demander la validation de ce défi. Il vous rapportera{' '}
            <span className="font-semibold text-accent">{points} pts</span> une
            fois qu'un admin aura approuvé votre demande.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          {/* Indicateur visuel du GPS pour rassurer l'équipe */}
          <div className="flex items-center justify-between rounded-lg border border-border bg-muted/20 p-2.5 text-xs">
            <span className="text-muted-foreground flex items-center gap-1.5">
              📍 Localisation GPS :
            </span>
            {location ? (
              <span className="font-semibold text-green-600 dark:text-green-400 animate-pulse">
                Prête (Précision OK)
              </span>
            ) : (
              <button
                type="button"
                onClick={requestLocation}
                className="font-semibold text-blue-500 hover:underline"
              >
                Recherche de signal... (Cliquer pour forcer)
              </button>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label
              htmlFor="note"
              className="text-sm font-medium text-muted-foreground"
            >
              Votre réponse ou commentaire :
            </label>
            <textarea
              id="note"
              placeholder="Écrivez votre réponse ou expliquez comment vous avez fait..."
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
