import { Trophy } from 'lucide-react'
import type { LeaderboardRow } from '@/lib/db'
import { cn } from '@/lib/utils'

const RANK_STYLES = [
  'bg-primary text-primary-foreground',
  'bg-accent text-accent-foreground',
  'bg-pending text-pending-foreground',
]

export function Leaderboard({
  rows,
  currentTeamId,
}: {
  rows: LeaderboardRow[]
  currentTeamId: number | null
}) {
  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="flex items-center gap-2 border-b border-border px-5 py-4">
        <Trophy className="size-5 text-primary" />
        <h2 className="font-display text-lg font-bold">Leaderboard</h2>
      </div>

      <ol className="flex flex-col">
        {rows.map((row, index) => {
          const isMe = row.id === currentTeamId
          return (
            <li
              key={row.id}
              className={cn(
                'flex items-center gap-3 border-b border-border px-5 py-3 last:border-b-0',
                isMe && 'bg-primary/10',
              )}
            >
              <span
                className={cn(
                  'flex size-8 shrink-0 items-center justify-center rounded-full font-display text-sm font-bold',
                  RANK_STYLES[index] ?? 'bg-secondary text-secondary-foreground',
                )}
              >
                {index + 1}
              </span>

              <div className="flex min-w-0 flex-1 flex-col">
                <span className="truncate font-medium">
                  {row.name}
                  {isMe && <span className="ml-1.5 text-xs text-primary">(you)</span>}
                </span>
                <span className="text-xs text-muted-foreground">
                  {row.approved_count} approved
                  {row.pending > 0 && ` · ${row.pending_count} pending`}
                </span>
              </div>

              <div className="flex shrink-0 flex-col items-end">
                <span className="font-display text-lg font-bold leading-none">{row.earned}</span>
                {row.pending > 0 ? (
                  <span className="text-xs font-medium text-pending">+{row.pending} pending</span>
                ) : (
                  <span className="text-xs text-muted-foreground">pts</span>
                )}
              </div>
            </li>
          )
        })}
        {rows.length === 0 && (
          <li className="px-5 py-6 text-center text-sm text-muted-foreground">No teams yet.</li>
        )}
      </ol>
    </div>
  )
}
