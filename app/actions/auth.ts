'use server'

import { revalidatePath } from 'next/cache'
import { getTeamByCode } from '@/lib/db'
import {
  clearAdminSession,
  clearTeamSession,
  getAdminCode,
  setAdminSession,
  setTeamSession,
} from '@/lib/session'

export async function loginTeam(code: string) {
  const clean = code.trim().toUpperCase()
  if (!clean) return { error: 'Please enter your team code.' }

  const team = await getTeamByCode(clean)
  if (!team) return { error: 'That code does not match any team.' }

  await setTeamSession(team.id)
  revalidatePath('/')
  return { success: true, teamName: team.name }
}

export async function logoutTeam() {
  await clearTeamSession()
  revalidatePath('/')
  return { success: true }
}

export async function loginAdmin(code: string) {
  const clean = code.trim()
  if (clean !== getAdminCode()) {
    return { error: 'Incorrect admin code.' }
  }
  await setAdminSession()
  revalidatePath('/admin')
  return { success: true }
}

export async function logoutAdmin() {
  await clearAdminSession()
  revalidatePath('/admin')
  return { success: true }
}
