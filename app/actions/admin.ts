'use server'

import { revalidatePath } from 'next/cache'
import { sql } from '@/lib/db'
import { isAdmin } from '@/lib/session'

async function requireAdmin() {
  if (!(await isAdmin())) throw new Error('Unauthorized')
}

// ---- Review submissions ----

export async function reviewSubmission(input: {
  submissionId: number
  decision: 'approved' | 'refused'
  note?: string
}) {
  await requireAdmin()
  const { submissionId, decision, note } = input
  await sql`
    UPDATE submissions
    SET status = ${decision}, note = ${note ?? null}, reviewed_at = now()
    WHERE id = ${submissionId} AND status = 'pending'
  `
  revalidatePath('/admin')
  revalidatePath('/')
  return { success: true }
}

// ---- Challenges ----

export async function createChallenge(input: {
  title: string
  description: string
  points: number
}) {
  await requireAdmin()
  const title = input.title.trim()
  if (!title) return { error: 'Title is required.' }
  const points = Number.isFinite(input.points) ? Math.max(0, Math.round(input.points)) : 0
  await sql`
    INSERT INTO challenges (title, description, points)
    VALUES (${title}, ${input.description.trim() || null}, ${points})
  `
  revalidatePath('/admin')
  revalidatePath('/')
  return { success: true }
}

export async function updateChallenge(input: {
  id: number
  title: string
  description: string
  points: number
  active: boolean
}) {
  await requireAdmin()
  const title = input.title.trim()
  if (!title) return { error: 'Title is required.' }
  const points = Number.isFinite(input.points) ? Math.max(0, Math.round(input.points)) : 0
  await sql`
    UPDATE challenges
    SET title = ${title},
        description = ${input.description.trim() || null},
        points = ${points},
        active = ${input.active}
    WHERE id = ${input.id}
  `
  revalidatePath('/admin')
  revalidatePath('/')
  return { success: true }
}

export async function deleteChallenge(id: number) {
  await requireAdmin()
  await sql`DELETE FROM submissions WHERE challenge_id = ${id}`
  await sql`DELETE FROM challenges WHERE id = ${id}`
  revalidatePath('/admin')
  revalidatePath('/')
  return { success: true }
}

// ---- Teams ----

function randomCode(name: string) {
  const prefix = name.replace(/[^a-zA-Z]/g, '').slice(0, 4).toUpperCase() || 'TEAM'
  const suffix = Math.floor(1000 + Math.random() * 9000)
  return `${prefix}-${suffix}`
}

export async function createTeam(input: { name: string; code?: string }) {
  await requireAdmin()
  const name = input.name.trim()
  if (!name) return { error: 'Team name is required.' }
  let code = (input.code ?? '').trim().toUpperCase()
  if (!code) code = randomCode(name)

  const existing = (await sql`SELECT id FROM teams WHERE code = ${code} LIMIT 1`) as {
    id: number
  }[]
  if (existing[0]) return { error: 'That code is already in use.' }

  await sql`INSERT INTO teams (name, code) VALUES (${name}, ${code})`
  revalidatePath('/admin')
  revalidatePath('/')
  return { success: true }
}

export async function updateTeam(input: { id: number; name: string; code: string }) {
  await requireAdmin()
  const name = input.name.trim()
  const code = input.code.trim().toUpperCase()
  if (!name || !code) return { error: 'Name and code are required.' }

  const existing = (await sql`
    SELECT id FROM teams WHERE code = ${code} AND id != ${input.id} LIMIT 1
  `) as { id: number }[]
  if (existing[0]) return { error: 'That code is already in use by another team.' }

  await sql`UPDATE teams SET name = ${name}, code = ${code} WHERE id = ${input.id}`
  revalidatePath('/admin')
  revalidatePath('/')
  return { success: true }
}

export async function deleteTeam(id: number) {
  await requireAdmin()
  await sql`DELETE FROM submissions WHERE team_id = ${id}`
  await sql`DELETE FROM teams WHERE id = ${id}`
  revalidatePath('/admin')
  revalidatePath('/')
  return { success: true }
}

// À ajouter à la fin de votre fichier d'actions d'administration (ex: app/actions/admin.ts)
export async function importChallengesAction(challenges: { title: string; description: string; points: number }[]) {
  try {
    for (const c of challenges) {
      await sql`
        INSERT INTO challenges (title, description, points, active)
        VALUES (${c.title}, ${c.description}, ${c.points}, true);
      `
    }
    revalidatePath('/admin')
    return { success: true, count: challenges.length }
  } catch (error: any) {
    return { error: error.message || "Erreur lors de l'importation." }
  }
}
