'use client'

import { useMemo, useState } from 'react'
import type { Challenge, SubmissionStatus } from '@/lib/db'
import { categoryColor } from '@/lib/category-colors'
import { cn } from '@/lib/utils'
import { ChallengeCard } from '@/components/challenge-card'

export type ChallengeListItem = {
  challenge: Challenge
  status: SubmissionStatus | null
  note: string | null
}

export function ChallengeList({
  items,
  loggedIn,
}: {
  items: ChallengeListItem[]
  loggedIn: boolean
}) {
  const categories = useMemo(() => {
    const set = new Set<string>()
    for (const { challenge } of items) {
      if (challenge.category) set.add(challenge.category)
    }
    return Array.from(set).sort()
  }, [items])

  const [selected, setSelected] = useState<string | null>(null)

  const filtered = selected ? items.filter((i) => i.challenge.category === selected) : items

  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-card px-6 py-12 text-center text-muted-foreground">
        No challenges have been added yet. Check back soon.
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {categories.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <FilterPill label="Tous" active={selected === null} onClick={() => setSelected(null)} />
          {categories.map((cat) => (
            <FilterPill
              key={cat}
              label={cat}
              color={categoryColor(cat)}
              active={selected === cat}
              onClick={() => setSelected(cat)}
            />
          ))}
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card px-6 py-12 text-center text-muted-foreground">
          Aucun défi dans cette catégorie.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {filtered.map(({ challenge, status, note }) => (
            <ChallengeCard
              key={challenge.id}
              challenge={challenge}
              loggedIn={loggedIn}
              status={status}
              note={note}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function FilterPill({
  label,
  active,
  onClick,
  color,
}: {
  label: string
  active: boolean
  onClick: () => void
  color?: { bg: string; text: string }
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={active && color ? { backgroundColor: color.bg, color: color.text } : undefined}
      className={cn(
        'rounded-full border px-3 py-1.5 text-sm font-medium transition-colors',
        active
          ? color
            ? 'border-transparent'
            : 'border-primary bg-primary text-primary-foreground'
          : 'border-border bg-card text-muted-foreground hover:text-foreground',
      )}
    >
      {label}
    </button>
  )
}
