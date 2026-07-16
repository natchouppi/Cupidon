import { 
  getTeamsLastLocation, 
  getChallenges, 
  getPendingSubmissions 
} from '@/app/actions/admin' // <-- ASSUREZ-VOUS QUE CES 3 FONCTIONS SONT DANS CE FICHIER
import { AdminDashboard } from '@/components/admin/admin-dashboard'

export default async function AdminPage() {
  // On récupère toutes les données nécessaires proprement
  // Si l'une de ces fonctions manque dans le fichier importé, le build échoue.
  const [teams, challenges, pending] = await Promise.all([
    getTeamsLastLocation(),
    getChallenges(), 
    getPendingSubmissions()
  ])

  return (
    <AdminDashboard 
      pending={pending || []} 
      challenges={challenges || []} 
      teams={teams || []} 
    />
  )
}
