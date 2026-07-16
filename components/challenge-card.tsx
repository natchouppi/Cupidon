'use client'

import { useState } from 'react'
import { CheckCircle2, Clock, XCircle, Send } from 'lucide-react'
import type { Challenge, SubmissionStatus } from '@/lib/db'
import { Button } from '@/components/ui/button'
import { SubmitProofDialog } from '@/components/submit-proof-dialog'
import { TeamLoginDialog } from '@/components/team-login-dialog'

export function ChallengeCard({
  challenge,
  loggedIn,
  status,
  note,
}: {
  challenge: Challenge
  loggedIn: boolean
  status: SubmissionStatus | null
  note: string | null
}) {
  const [open, setOpen] = useState(false)

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5">
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-display text-lg font-bold leading-tight text-balance">
          {challenge.title}
        </h3>
        <span className="shrink-0 rounded-full bg-primary px-3 py-1 font-display text-sm font-bold text-primary-foreground">
          {challenge.points} pts
        </span>
      </div>

      {challenge.description && (
        <p className="text-sm leading-relaxed text-muted-foreground">{challenge.description}</p>
      )}

      <div className="mt-auto flex items-center justify-between gap-3 pt-1">
        <StatusBadge status={status} />

        {!loggedIn ? (
          <TeamLoginDialog triggerLabel="Log in to play" variant="outline" />
        ) : status === 'approved' ? (
          <span className="text-sm font-medium text-accent">Completed</span>
        ) : status === 'pending' ? (
          <span className="text-sm font-medium text-pending">Awaiting review</span>
        ) : (
          <Button size="sm" onClick={() => setOpen(true)}>
            <Send className="size-4" />
            {status === 'refused' ? 'Renvoyer la demande' : 'Valider le défi'}
          </Button>
        )}
      </div>

      {status === 'refused' && note && (
        <p className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive-foreground">
          <span className="font-semibold">Refused:</span> {note}
        </p>
      )}

      <SubmitProofDialog
        open={open}
        onOpenChange={setOpen}
        challengeId={challenge.id}
        challengeTitle={challenge.title}
        points={challenge.points}
      />
    </div>
  )
}

function StatusBadge({ status }: { status: SubmissionStatus | null }) {
  if (status === 'approved') {
    return (
      <span className="inline-flex items-center gap-1.5 text-sm font-medium text-accent">
        <CheckCircle2 className="size-4" />
        Approved
      </span>
    )
  }
  if (status === 'pending') {
    return (
      <span className="inline-flex items-center gap-1.5 text-sm font-medium text-pending">
        <Clock className="size-4" />
        Pending
      </span>
    )
  }
  if (status === 'refused') {
    return (
      <span className="inline-flex items-center gap-1.5 text-sm font-medium text-destructive">
        <XCircle className="size-4" />
        Refused
      </span>
    )
  }
  return <span className="text-sm text-muted-foreground">Not attempted</span>
}
