'use server'

import { revalidatePath } from 'next/cache'
import { sql, type Submission } from '@/lib/db'
import { getCurrentTeam } from '@/lib/session'

export async function submitProof(input: {
  challengeId: number
  proofUrl: string
  mediaType: 'image' | 'video'
}) {
  const team = await getCurrentTeam()
  if (!team) return { error: 'You must be logged in as a team.' }

  const { challengeId, proofUrl, mediaType } = input
  if (!proofUrl) return { error: 'Missing proof file.' }

  // Verify the challenge exists and is active
  const challenge = (await sql`
    SELECT id FROM challenges WHERE id = ${challengeId} AND active = true LIMIT 1
  `) as { id: number }[]
  if (!challenge[0]) return { error: 'This challenge is no longer available.' }

  // Enforce: resubmit only allowed if the latest submission was refused
  const latest = (await sql`
    SELECT status FROM submissions
    WHERE team_id = ${team.id} AND challenge_id = ${challengeId}
    ORDER BY created_at DESC LIMIT 1
  `) as Pick<Submission, 'status'>[]

  if (latest[0]) {
    if (latest[0].status === 'approved') {
      return { error: 'You already completed this challenge.' }
    }
    if (latest[0].status === 'pending') {
      return { error: 'You already have a submission pending review for this challenge.' }
    }
  }

  await sql`
    INSERT INTO submissions (team_id, challenge_id, proof_url, media_type, status)
    VALUES (${team.id}, ${challengeId}, ${proofUrl}, ${mediaType}, 'pending')
  `

  revalidatePath('/')
  revalidatePath('/admin')
  return { success: true }
}
