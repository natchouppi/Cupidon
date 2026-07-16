import { getTeamsLastLocation } from '@/app/actions/admin'
import { AdminDashboard } from '@/components/admin/admin-dashboard' // Assurez-vous du bon import
// Importez aussi vos autres fonctions (challenges, pending, etc.)

export default async function AdminPage() {
  // On récupère toutes les données nécessaires proprement
  const [teams, challenges, pending] = await Promise.all([
    getTeamsLastLocation(),
    getChallenges(), // Assurez-vous que ces fonctions existent
    getPendingSubmissions()
  ])

  // On vérifie que les données sont bien des tableaux pour éviter le crash
  return (
    <AdminDashboard 
      pending={pending || []} 
      challenges={challenges || []} 
      teams={teams || []} 
    />
  )
}
