import { getTeamsLastLocation } from '@/app/actions/admin'
import { AdminDashboard } from '@/components/admin/admin-dashboard'

export default async function AdminPage() {
  let teams = []
  // On crée des tableaux vides pour éviter que le tableau de bord ne plante
  const challenges: any[] = [] 
  const pending: any[] = [] 

  try {
    // On ne lance QUE la requête qui existe vraiment dans admin.ts
    const results = await Promise.all([
      getTeamsLastLocation()
    ])
    
    teams = results[0] || []
    
  } catch (error) {
    console.error("Erreur lors de la récupération des données admin:", error)
  }

  return (
    <AdminDashboard 
      pending={pending} 
      challenges={challenges} 
      teams={teams} 
    />
  )
}
