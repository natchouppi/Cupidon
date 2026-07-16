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

// RETOUR À LA SIGNATURE D'ORIGINE (Un seul objet "input")
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

// ---- Importation JSON ----

export async function importChallengesAction(
  challenges: { title: string; description: string; points: number }[]
) {
  try {
    await requireAdmin()
    
    for (const c of challenges) {
      await sql`
        INSERT INTO challenges (title, description, points, active)
        VALUES (${c.title}, ${c.description || null}, ${c.points}, true);
      `
    }
    
    revalidatePath('/admin')
    revalidatePath('/')
    return { success: true, count: challenges.length }
  } catch (error: any) {
    return { error: error.message || "Erreur lors de l'importation." }
  }
}

// ---- Reset Général du Jeu ----

export async function resetDatabaseAction() {
  try {
    await requireAdmin()

    // 1. Supprime toutes les validations et preuves envoyées par les équipes
    await sql`TRUNCATE TABLE submissions CASCADE;`
    
    // 2. Remet tous les scores des équipes à 0
    await sql`UPDATE teams SET points = 0;`
    
    revalidatePath('/admin')
    revalidatePath('/')
    return { success: true }
  } catch (error: any) {
    return { error: error.message || "Erreur lors de la réinitialisation." }
  }
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

export async function getTeamsLastLocation() {
  try {
    await requireAdmin()
    
    // Cette requête récupère chaque équipe avec sa soumission GPS la plus récente
    const locations = await sql`
      SELECT DISTINCT ON (t.id) 
        t.id as team_id,
        t.name as team_name,
        t.code as team_code,
        s.latitude,
        s.longitude,
        s.created_at as last_seen,
        c.title as challenge_title
      FROM teams t
      JOIN submissions s ON s.team_id = t.id
      JOIN challenges c ON s.challenge_id = c.id
      WHERE s.latitude IS NOT NULL AND s.longitude IS NOT NULL
      ORDER BY t.id, s.created_at DESC;
    `
    return { success: true, data: locations }
  } catch (error: any) {
    return { error: error.message || "Erreur de récupération des positions." }
  }
}
