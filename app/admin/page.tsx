import { 
  getTeamsLastLocation, 
  getChallenges, 
  getPendingSubmissions 
} from '@/app/actions/admin'
import { AdminDashboard } from '@/components/admin/admin-dashboard'

export default async function AdminPage() {
  // On initialise des tableaux vides par défaut pour éviter tout crash
  let teams = []
  let challenges = []
  let pending = []

  try {
    // On lance toutes les requêtes en même temps
    const results = await Promise.all([
      getTeamsLastLocation(),
      getChallenges(),
      getPendingSubmissions()
    ])
    
    // On assigne les résultats (si une requête échoue silencieusement, on garde un tableau vide)
    teams = results[0] || []
    challenges = results[1] || []
    pending = results[2] || []
    
  } catch (error) {
    // En cas de problème grave avec la base de données, l'erreur est logguée mais la page charge quand même
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
