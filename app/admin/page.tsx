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
    // On lance les vraies fonctions qui existent dans vos fichiers
    const results = await Promise.all([
      getAllTeams(),
      getTeamsLastLocation(),
      getAllChallenges(),     // Vient de lib/db.ts
      getPendingSubmissions() // Vient de lib/db.ts
    ])
    
    teams = results[0] || []
    locations = results[1] || []
    challenges = results[1] || []
    pending = results[2] || []
    
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
