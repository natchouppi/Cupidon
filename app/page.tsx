import type { ComponentType } from 'react'
import { Zap, Target, Sparkles, Users } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  getActiveChallenges,
  getLeaderboard,
  getTeamSubmissions,
  type SubmissionStatus,
} from '@/lib/db'
import { getCurrentTeam } from '@/lib/session'
import { SiteHeader } from '@/components/site-header'
import { ChallengeCard } from '@/components/challenge-card'
import { Leaderboard } from '@/components/leaderboard'
import { TeamLoginDialog } from '@/components/team-login-dialog'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const team = await getCurrentTeam()
  const [challenges, leaderboard, teamSubs] = await Promise.all([
    getActiveChallenges(),
    getLeaderboard(),
    team ? getTeamSubmissions(team.id) : Promise.resolve([]),
  ])

  const statusByChallenge = new Map<number, { status: SubmissionStatus; note: string | null }>()
  for (const s of teamSubs) {
    statusByChallenge.set(s.challenge_id, { status: s.status, note: s.note })
  }

  const totalPoints = challenges.reduce((sum, c) => sum + c.points, 0)

  return (
    <div className="min-h-dvh">
      <SiteHeader teamName={team?.name ?? null} />

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border">
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -top-32 -left-20 size-80 rounded-full bg-primary/25 blur-3xl" />
          <div className="absolute -bottom-32 right-0 size-96 rounded-full bg-accent/15 blur-3xl" />
        </div>

        <div className="mx-auto w-full max-w-6xl px-4 py-14 sm:py-20">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
            <Zap className="size-4" />
            6 teams · 2 lads each · winner takes all
          </div>
          <h1 className="mt-4 font-display text-5xl font-bold leading-[0.95] tracking-tight text-balance sm:text-7xl">
            Complete the challenges.
            <br />
            <span className="text-primary">Climb the board.</span>
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted-foreground text-pretty">
            Pick a challenge, pull it off, and upload your photo or video proof. Every approved
            challenge earns your team points. Highest score wins.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            {!team && <TeamLoginDialog triggerLabel="Enter your team code" />}
            <div className="flex flex-wrap gap-3">
              <Stat value={challenges.length} label="Challenges" icon={Target} tone="primary" />
              <Stat value={totalPoints} label="Points up for grabs" icon={Sparkles} tone="pending" />
              <Stat value={leaderboard.length} label="Teams" icon={Users} tone="accent" />
            </div>
          </div>
        </div>
      </section>

      {/* Main */}
      <main className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-8 px-4 py-10 lg:grid-cols-3">
        <section className="lg:col-span-2">
          <div className="mb-5 flex items-baseline justify-between">
            <h2 className="flex items-center gap-2 font-display text-2xl font-bold">
              <Target className="size-5 text-primary" />
              Challenges
            </h2>
            <span className="text-sm text-muted-foreground">
              {challenges.length} available
            </span>
          </div>

          {challenges.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border bg-card px-6 py-12 text-center text-muted-foreground">
              No challenges have been added yet. Check back soon.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {challenges.map((challenge) => {
                const entry = statusByChallenge.get(challenge.id)
                return (
                  <ChallengeCard
                    key={challenge.id}
                    challenge={challenge}
                    loggedIn={!!team}
                    status={entry?.status ?? null}
                    note={entry?.note ?? null}
                  />
                )
              })}
            </div>
          )}
        </section>

        <aside className="lg:col-span-1">
          <div className="lg:sticky lg:top-20">
            <Leaderboard rows={leaderboard} currentTeamId={team?.id ?? null} />
          </div>
        </aside>
      </main>
    </div>
  )
}

const STAT_TONES = {
  primary: 'bg-primary/15 text-primary',
  accent: 'bg-accent/15 text-accent',
  pending: 'bg-pending/15 text-pending',
}

function Stat({
  value,
  label,
  icon: Icon,
  tone,
}: {
  value: number
  label: string
  icon: ComponentType<{ className?: string }>
  tone: keyof typeof STAT_TONES
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-2.5">
      <span className={cn('flex size-9 shrink-0 items-center justify-center rounded-lg', STAT_TONES[tone])}>
        <Icon className="size-4" />
      </span>
      <div>
        <div className="font-display text-xl font-bold leading-none">{value}</div>
        <div className="mt-1 text-xs text-muted-foreground">{label}</div>
      </div>
    </div>
  )
}
