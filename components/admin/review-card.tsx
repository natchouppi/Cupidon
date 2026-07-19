'use client'

import { useState, useTransition } from 'react'
import { Check, X } from 'lucide-react'
import { toast } from 'sonner'
import { reviewSubmission } from '@/app/actions/admin'
import type { PendingSubmission } from '@/lib/db'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { ProofMedia } from '@/components/admin/proof-media'

export function ReviewCard({ submission }: { submission: PendingSubmission }) {
  const [showRefuse, setShowRefuse] = useState(false)
  const [note, setNote] = useState('')
  const [isPending, startTransition] = useTransition()

  function decide(decision: 'approved' | 'refused') {
    startTransition(async () => {
      const res = await reviewSubmission({
        submissionId: submission.id,
        decision,
        note: decision === 'refused' ? note.trim() || undefined : undefined,
      })
      if (res?.error) {
        toast.error(res.error)
        return
      }
      toast.success(
        decision === 'approved'
          ? `Approved — ${submission.team_name} earns ${submission.challenge_points} pts.`
          : `Submission refused.`,
      )
    })
  }

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-base font-bold leading-tight text-balance">
            {submission.challenge_title}
          </h3>
          <p className="mt-0.5 text-sm text-muted-foreground">
            by <span className="font-medium text-foreground">{submission.team_name}</span>
          </p>
        </div>
        <span className="shrink-0 rounded-full bg-primary px-2.5 py-1 font-display text-xs font-bold text-primary-foreground">
          {submission.challenge_points} pts
        </span>
      </div>

      <ProofMedia
        pathname={submission.proof_url}
        mediaType={submission.media_type}
        title={submission.challenge_title}
        comment={submission.comment}
      />

      {showRefuse && (
        <Textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Optional: reason for refusing (the team will see this)"
          rows={2}
        />
      )}

      <div className="flex gap-2">
        <Button
          className="flex-1 bg-accent text-accent-foreground hover:bg-accent/90"
          onClick={() => decide('approved')}
          disabled={isPending}
        >
          <Check className="size-4" />
          Approve
        </Button>
        {showRefuse ? (
          <Button
            variant="destructive"
            className="flex-1"
            onClick={() => decide('refused')}
            disabled={isPending}
          >
            <X className="size-4" />
            Confirm refuse
          </Button>
        ) : (
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => setShowRefuse(true)}
            disabled={isPending}
          >
            <X className="size-4" />
            Refuse
          </Button>
        )}
      </div>
    </div>
  )
}
