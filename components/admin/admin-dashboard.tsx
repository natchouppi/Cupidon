'use client'

import Link from 'next/link'
import { useTransition } from 'react'
import { ArrowLeft, LogOut, Shield, MapPin } from 'lucide-react'
import { toast } from 'sonner'
import { logoutAdmin } from '@/app/actions/auth'
import type { Challenge, PendingSubmission, Team } from '@/lib/db'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ReviewCard } from '@/components/admin/review-card'
import { ChallengeManager } from '@/components/admin/challenge-manager'
import { TeamManager } from '@/components/admin/team-manager'
import { MapErrorBoundary } from '@/components/admin/map-error-boundary'
import dynamic from 'next/dynamic'

// Chargement dynamique de la carte sans SSR
const TeamsMap = dynamic(
  () => import('@/components/admin/teams-map').then((mod) => mod.default),
  {
    ssr: false,
    loading: () => (
      <div className="rounded-xl border border-border bg-card p-12 text-center text-muted-foreground animate-pulse">
        Chargement de la carte interactive...
      </div>
    ),
  }
)

export function AdminDashboard({
  pending,
  challenges,
  teams,
  locations,
  trail,
}: {
  pending: PendingSubmission[]
  challenges: Challenge[]
  teams: Team[]
  locations: any[]
  trail: any[]
}) {
  const [isPending, startTransition] = useTransition()

  function handleLogout() {
    startTransition(async () => {
      await logoutAdmin()
      toast.success('Logged out of admin.')
    })
  }

  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Shield className="size-5" />
            </span>
            <span className="font-display text-lg font-bold tracking-tight">Admin dashboard</span>
          </div>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm">
              <Link href="/">
                <ArrowLeft className="size-4" />
                <span className="hidden sm:inline">View game</span>
              </Link>
            </Button>
            <Button variant="outline" size="sm" onClick={handleLogout} disabled={isPending}>
              <LogOut className="size-4" />
              <span className="hidden sm:inline">Log out</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 py-8">
        <Tabs defaultValue="pending">
          <TabsList className="grid grid-cols-4 w-full max-w-[480px]">
            <TabsTrigger value="pending" className="flex items-center justify-center">
              Pending
              {pending.length > 0 && (
                <span className="ml-1.5 rounded-full bg-primary px-1.5 py-0.5 text-xs font-bold text-primary-foreground">
                  {pending.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="challenges">Challenges</TabsTrigger>
            <TabsTrigger value="teams">Teams</TabsTrigger>
            <TabsTrigger value="map" className="flex items-center gap-1">
              <MapPin className="size-3.5" />
              <span>Carte</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="mt-6">
            <h2 className="mb-4 font-display text-2xl font-bold">Pending validations</h2>
            {pending.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border bg-card px-6 py-12 text-center text-muted-foreground">
                All caught up. No submissions waiting for review.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {pending.map((s) => (
                  <ReviewCard key={s.id} submission={s} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="challenges" className="mt-6">
            <h2 className="mb-4 font-display text-2xl font-bold">Manage challenges</h2>
            <ChallengeManager challenges={challenges} />
          </TabsContent>

          <TabsContent value="teams" className="mt-6">
            <h2 className="mb-4 font-display text-2xl font-bold">Manage teams</h2>
            <TeamManager teams={teams} />
          </TabsContent>

          <TabsContent value="map" className="mt-6">
            <div className="flex flex-col gap-4">
              <h2 className="font-display text-2xl font-bold">Géolocalisation</h2>
              {/* Transmission des locations au composant TeamsMap */}
              <MapErrorBoundary>
                <TeamsMap teams={locations} trail={trail} />
              </MapErrorBoundary>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
