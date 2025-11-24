import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { determineFinalParticipants } from '@/lib/utils/tournament/advancement'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const tournamentId = (await params).id

    // Get tournament with knockout matches
    const tournament = await prisma.tournament.findUnique({
      where: { id: tournamentId },
      include: {
        knockoutMatches: {
          include: {
            player1: true,
            player2: true,
          },
          orderBy: [{ round: 'asc' }, { matchNumber: 'asc' }],
        },
        board: true,
      },
    })

    if (!tournament) {
      return NextResponse.json(
        { success: false, error: 'Tournament not found' },
        { status: 404 }
      )
    }

    // Separate matches by round
    const semifinals = tournament.knockoutMatches.filter((m) => m.round === 'SEMIFINAL')
    const finals = tournament.knockoutMatches.filter((m) => m.round === 'FINAL')

    // Auto-create final if both semifinals are completed and final doesn't exist
    if (semifinals.length === 2 && finals.length === 0) {
      const finalParticipants = determineFinalParticipants(
        semifinals.map(m => ({ status: m.status, winnerId: m.winnerId ?? undefined }))
      )
      if (finalParticipants) {
        const finalMatch = await prisma.match.create({
          data: {
            tournamentId,
            player1Id: finalParticipants.player1Id,
            player2Id: finalParticipants.player2Id,
            player1Score: 0,
            player2Score: 0,
            status: 'PENDING',
            round: 'FINAL',
            matchNumber: 1,
          },
          include: {
            player1: true,
            player2: true,
          },
        })

        finals.push(finalMatch)
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        semifinals,
        finals,
      },
    })
  } catch (error) {
    console.error('Error fetching knockout bracket:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch knockout bracket' },
      { status: 500 }
    )
  }
}

