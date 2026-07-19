// 1. On importe la géolocalisation depuis les actions
import { getTeamsLastLocation, getApprovedSubmissionLocations } from '@/app/actions/admin'
// 2. LA CORRECTION EST ICI : on importe les données depuis la base de données (db.ts)
import { getAllChallenges, getPendingSubmissions, getAllTeams } from '@/lib/db'
import { isAdmin } from '@/lib/session'
import { AdminDashboard } from '@/components/admin/admin-dashboard'
import { AdminLogin } from '@/components/admin/admin-login'

export const dynamic = 'force-dynamic'
export default async function AdminPage() {

  if (!(await isAdmin())) {
    return <AdminLogin />
  }
  let teams = []
  let locations = []
  let trail = []
  let challenges = []
  let pending = []

  try {
    const results = await Promise.all([
      getAllTeams(),                    // index 0
      getTeamsLastLocation(),           // index 1
      getAllChallenges(),               // index 2
      getPendingSubmissions(),          // index 3
      getApprovedSubmissionLocations(), // index 4
    ])

    teams = results[0] || []
    locations = results[1] || []
    challenges = results[2] || []
    pending = results[3] || []
    trail = results[4] || []

  } catch (error) {
    console.error("Erreur lors de la récupération des données admin:", error)
  }

  return (
    <AdminDashboard
      pending={pending}
      challenges={challenges}
      teams={teams}
      locations={locations}
      trail={trail}
    />
  )
}
