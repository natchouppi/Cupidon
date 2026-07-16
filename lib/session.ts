import { cookies } from 'next/headers'
import { getTeamById, type Team } from './db'

const TEAM_COOKIE = 'lads_team'
const ADMIN_COOKIE = 'lads_admin'

export function getAdminCode() {
  return process.env.ADMIN_CODE || 'ADMIN-2026'
}

const cookieOptions = {
  httpOnly: true,
  sameSite: 'none' as const,
  secure: true,
  path: '/',
  maxAge: 60 * 60 * 24 * 30, // 30 days
}

export async function setTeamSession(teamId: number) {
  const store = await cookies()
  store.set(TEAM_COOKIE, String(teamId), cookieOptions)
}

export async function clearTeamSession() {
  const store = await cookies()
  store.delete(TEAM_COOKIE)
}

export async function getCurrentTeam(): Promise<Team | null> {
  const store = await cookies()
  const value = store.get(TEAM_COOKIE)?.value
  if (!value) return null
  const id = Number(value)
  if (!Number.isFinite(id)) return null
  return getTeamById(id)
}

export async function setAdminSession() {
  const store = await cookies()
  store.set(ADMIN_COOKIE, '1', cookieOptions)
}

export async function clearAdminSession() {
  const store = await cookies()
  store.delete(ADMIN_COOKIE)
}

export async function isAdmin(): Promise<boolean> {
  const store = await cookies()
  return store.get(ADMIN_COOKIE)?.value === '1'
}
