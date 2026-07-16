import { handleUpload, type HandleUploadBody } from '@vercel/blob/client'
import { type NextRequest, NextResponse } from 'next/server'
import { getCurrentTeam } from '@/lib/session'

export async function POST(request: NextRequest): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => {
        // Only logged-in teams may upload proof
        const team = await getCurrentTeam()
        if (!team) {
          throw new Error('You must be logged in as a team to upload proof.')
        }
        return {
          allowedContentTypes: ['image/*', 'video/*'],
          maximumSizeInBytes: 500 * 1024 * 1024, // 500MB
          addRandomSuffix: true,
          tokenPayload: JSON.stringify({ teamId: team.id }),
        }
      },
      onUploadCompleted: async () => {
        // No-op: the submission row is created via a server action after upload.
      },
    })

    return NextResponse.json(jsonResponse)
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 400 },
    )
  }
}
