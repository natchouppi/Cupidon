import { neon } from '@neondatabase/serverless'

export const sql = neon(process.env.DATABASE_URL!)

export type Team = {
  id: number
  name: string
  code: string
  created_at: string
}

export type Challenge = {
  id: number
  title: string
  description: string | null
  points: number
  active: boolean
  created_at: string
}

export type SubmissionStatus = 'pending' | 'approved' | 'refused'

export type Submission = {
  id: number
  team_id: number
  challenge_id: number
  proof_url: string
  media_type: 'image' | 'video'
  status: SubmissionStatus
  note: string | null
  latitude: number | null
  longitude: number | null
  created_at: string
  reviewed_at: string | null
}

export type LeaderboardRow = {
  id: number
  name: string
  earned: number
  pending: number
  approved_count: number
  pending_count: number
}

export type PendingSubmission = Submission & {
  team_name: string
  challenge_title: string
  challenge_points: number
}

// ---- Challenges ----

export async function getActiveChallenges(): Promise<Challenge[]> {
  return (await sql`
    SELECT * FROM challenges WHERE active = true ORDER BY points DESC, id ASC
  `) as Challenge[]
}

export async function getAllChallenges(): Promise<Challenge[]> {
  return (await sql`
    SELECT * FROM challenges ORDER BY active DESC, points DESC, id ASC
  `) as Challenge[]
}

// ---- Teams ----

export async function getTeamByCode(code: string): Promise<Team | null> {
  const rows = (await sql`
    SELECT * FROM teams WHERE code = ${code} LIMIT 1
  `) as Team[]
  return rows[0] ?? null
}

export async function getTeamById(id: number): Promise<Team | null> {
  const rows = (await sql`SELECT * FROM teams WHERE id = ${id} LIMIT 1`) as Team[]
  return rows[0] ?? null
}

export async function getAllTeams(): Promise<Team[]> {
  return (await sql`SELECT * FROM teams ORDER BY id ASC`) as Team[]
}

// ---- Leaderboard ----

export async function getLeaderboard(): Promise<LeaderboardRow[]> {
  return (await sql`
    SELECT
      t.id,
      t.name,
      COALESCE(SUM(CASE WHEN s.status = 'approved' THEN c.points ELSE 0 END), 0)::int AS earned,
      COALESCE(SUM(CASE WHEN s.status = 'pending' THEN c.points ELSE 0 END), 0)::int AS pending,
      COALESCE(SUM(CASE WHEN s.status = 'approved' THEN 1 ELSE 0 END), 0)::int AS approved_count,
      COALESCE(SUM(CASE WHEN s.status = 'pending' THEN 1 ELSE 0 END), 0)::int AS pending_count
    FROM teams t
    LEFT JOIN submissions s ON s.team_id = t.id
    LEFT JOIN challenges c ON c.id = s.challenge_id
    GROUP BY t.id, t.name
    ORDER BY earned DESC, pending DESC, t.name ASC
  `) as LeaderboardRow[]
}

// ---- Submissions ----

// Latest submission per challenge for a given team
export async function getTeamSubmissions(teamId: number): Promise<Submission[]> {
  return (await sql`
    SELECT DISTINCT ON (challenge_id) *
    FROM submissions
    WHERE team_id = ${teamId}
    ORDER BY challenge_id, created_at DESC
  `) as Submission[]
}

export async function getPendingSubmissions(): Promise<PendingSubmission[]> {
  return (await sql`
    SELECT s.*, t.name AS team_name, c.title AS challenge_title, c.points AS challenge_points
    FROM submissions s
    JOIN teams t ON t.id = s.team_id
    JOIN challenges c ON c.id = s.challenge_id
    WHERE s.status = 'pending'
    ORDER BY s.created_at ASC
  `) as PendingSubmission[]
}

export async function getReviewedSubmissions(): Promise<PendingSubmission[]> {
  return (await sql`
    SELECT s.*, t.name AS team_name, c.title AS challenge_title, c.points AS challenge_points
    FROM submissions s
    JOIN teams t ON t.id = s.team_id
    JOIN challenges c ON c.id = s.challenge_id
    WHERE s.status != 'pending'
    ORDER BY s.reviewed_at DESC NULLS LAST
    LIMIT 50
  `) as PendingSubmission[]
}
