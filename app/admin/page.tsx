// 1. On importe la géolocalisation depuis les actions
import { getTeamsLastLocation } from '@/app/actions/admin'
// 2. LA CORRECTION EST ICI : on importe les données depuis la base de données (db.ts)
import { getAllChallenges, getPendingSubmissions, getAllTeams } from '@/lib/db'

import { AdminDashboard } from '@/components/admin/admin-dashboard'

export default async function AdminPage() {
  let teams = []
  let locations = []
  let challenges = []
  let pending = []

  try {
    const results = await Promise.all([
      getAllTeams(),          // index 0
      getTeamsLastLocation(), // index 1
      getAllChallenges(),     // index 2
      getPendingSubmissions() // index 3
    ])
    
    teams = results[0] || []
    locations = results[1] || []
    challenges = results[2] || []
    pending = results[3] || []
    
  } catch (error) {
    console.error("Erreur lors de la récupération des données admin:", error)
  }

  return (
    <AdminDashboard 
      pending={pending} 
      challenges={challenges} 
      teams={teams} 
      locations={locations}
    />
  )
}
