import { getAllChallenges, getAllTeams, getPendingSubmissions } from '@/lib/db'
import { isAdmin } from '@/lib/session'
import { AdminLogin } from '@/components/admin/admin-login'
import { AdminDashboard } from '@/components/admin/admin-dashboard'

import { Suspense } from 'react'
import TeamsMap from '@/components/admin/teams-map'
import { getTeamsLastLocation } from '@/app/actions/admin'

export default async function AdminPage() {
  const teams = await getTeamsLastLocation()

  return (
    <div>
      <h1>Tableau de bord Admin</h1>
      
      {/* Le Suspense permet de dire à React : "Si la carte prend du temps, affiche ça" */}
      <Suspense fallback={<div>Chargement de la carte en cours...</div>}>
        <TeamsMap teams={teams || []} />
      </Suspense>
    </div>
  )
}

export const dynamic = 'force-dynamic'

export default async function AdminPage() {
  if (!(await isAdmin())) {
    return <AdminLogin />
  }

  const [pending, challenges, teams] = await Promise.all([
    getPendingSubmissions(),
    getAllChallenges(),
    getAllTeams(),
  ])

  return <AdminDashboard pending={pending} challenges={challenges} teams={teams} />
}
