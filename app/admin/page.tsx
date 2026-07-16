import { getAllChallenges, getAllTeams, getPendingSubmissions } from '@/lib/db'
import { isAdmin } from '@/lib/session'
import { AdminLogin } from '@/components/admin/admin-login'
import { AdminDashboard } from '@/components/admin/admin-dashboard'

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
