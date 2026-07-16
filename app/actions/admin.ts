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
  try {
    await requireAdmin()
    
    // On supprime d'abord les soumissions liées pour éviter les erreurs de clés étrangères
    await sql`DELETE FROM submissions WHERE challenge_id = ${id}`
    await sql`DELETE FROM challenges WHERE id = ${id}`
    
    revalidatePath('/admin')
    revalidatePath('/')
    return { success: true }
  } catch (error: any) {
    console.error("Erreur fatale dans deleteChallenge:", error)
    // Au lieu de faire crasher le site, on renvoie l'erreur proprement
    return { error: error.message || "Erreur lors de la suppression." }
  }
}

// ---- Importation JSON ----

export async function importChallengesAction(
  challenges: {
