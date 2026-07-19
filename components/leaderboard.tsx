import { Trophy, Crown, Medal } from 'lucide-react'
import type { LeaderboardRow } from '@/lib/db'
import { cn } from '@/lib/utils'

const RANK_STYLES = [
  'bg-primary text-primary-foreground',
  'bg-accent text-accent-foreground',
  'bg-pending text-pending-foreground',
]

const RANK_ICONS = [Crown, Medal, Medal]

export function Leaderboard({
  rows,
  currentTeamId,
}: {
  rows: LeaderboardRow[]
  currentTeamId: number | null
}) {
  const maxEarned = Math.max(...rows.map((row) => row.earned), 1)

  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="flex items-center gap-2 border-b border-border px-5 py-4">
        <Trophy className="size-5 text-primary" />
        <h2 className="font-display text-lg font-bold">Leaderboard</h2>
      </div>

      <ol className="flex flex-col">
        {rows.map((row, index) => {
          const isMe = row.id === currentTeamId
          const RankIcon = RANK_ICONS[index]
          const progress = Math.round((row.earned / maxEarned) * 100)
          return (
            <li
              key={row.id}
              className={cn(
                'flex items-center gap-3 border-b border-border px-5 py-3 last:border-b-0',
                isMe && 'bg-primary/10',
                index === 0 && 'bg-gradient-to-r from-primary/10 to-transparent',
              )}
            >
              <span
                className={cn(
                  'flex size-8 shrink-0 items-center justify-center rounded-full font-display text-sm font-bold',
                  RANK_STYLES[index] ?? 'bg-secondary text-secondary-foreground',
                )}
              >
                {RankIcon ? <RankIcon className="size-4" /> : index + 1}
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
                <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className={cn(
                      'h-full rounded-full transition-all',
                      RANK_STYLES[index]?.split(' ')[0] ?? 'bg-secondary',
                    )}
                    style={{ width: `${progress}%` }}
                  />
                </div>
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
