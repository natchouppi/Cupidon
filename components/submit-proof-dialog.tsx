'use client'

import { useRef, useState } from 'react'
import { upload } from '@vercel/blob/client'
import { Upload, FileVideo, ImageIcon } from 'lucide-react'
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
  const inputRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [progress, setProgress] = useState(0)
  const [busy, setBusy] = useState(false)

  function reset() {
    setFile(null)
    setProgress(0)
    setBusy(false)
    if (inputRef.current) inputRef.current.value = ''
  }

  async function handleSubmit() {
    if (!file) {
      toast.error('Choose a photo or video first.')
      return
    }
    setBusy(true)
    try {
      const mediaType: 'image' | 'video' = file.type.startsWith('video') ? 'video' : 'image'
      const blob = await upload(file.name, file, {
        access: 'private',
        handleUploadUrl: '/api/upload',
        multipart: true,
        onUploadProgress: (e) => setProgress(Math.round(e.percentage)),
      })

      const res = await submitProof({
        challengeId,
        proofUrl: blob.pathname,
        mediaType,
      })

      if (res.error) {
        toast.error(res.error)
        setBusy(false)
        return
      }

      toast.success('Proof submitted! It is now pending admin review.')
      reset()
      onOpenChange(false)
    } catch (err) {
      console.error('[v0] upload error', err)
      toast.error((err as Error).message || 'Upload failed. Try again.')
      setBusy(false)
    }
  }

  const isVideo = file?.type.startsWith('video')

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
            Upload a photo or video as proof. Worth{' '}
            <span className="font-semibold text-accent">{points} pts</span> once an admin approves
            it.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <label
            htmlFor="proof-file"
            className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-card px-4 py-8 text-center transition-colors hover:border-primary hover:bg-card/60"
          >
            {file ? (
              <>
                {isVideo ? (
                  <FileVideo className="size-8 text-primary" />
                ) : (
                  <ImageIcon className="size-8 text-primary" />
                )}
                <span className="max-w-full truncate text-sm font-medium">{file.name}</span>
                <span className="text-xs text-muted-foreground">Tap to choose a different file</span>
              </>
            ) : (
              <>
                <Upload className="size-8 text-muted-foreground" />
                <span className="text-sm font-medium">Choose a photo or video</span>
                <span className="text-xs text-muted-foreground">Images and videos, up to 500MB</span>
              </>
            )}
          </label>
          <input
            ref={inputRef}
            id="proof-file"
            type="file"
            accept="image/*,video/*"
            className="sr-only"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />

          {busy && (
            <div className="flex flex-col gap-1">
              <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-xs text-muted-foreground">
                {progress < 100 ? `Uploading... ${progress}%` : 'Finishing up...'}
              </span>
            </div>
          )}

          <Button onClick={handleSubmit} disabled={busy || !file}>
            {busy ? 'Submitting...' : 'Submit proof'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
