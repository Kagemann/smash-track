import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const addPlayersSchema = z.object({
  participantIds: z.array(z.string().min(1)).min(1, 'At least one participant is required'),
})

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json()
    const validatedData = addPlayersSchema.parse(body)
    const tournamentId = (await params).id

    // Check tournament exists and is in SETUP phase
    const tournament = await prisma.tournament.findUnique({
      where: { id: tournamentId },
      include: {
        board: {
          include: {
            participants: true,
          },
        },
        participants: true,
      },
    })

    if (!tournament) {
      return NextResponse.json(
        { success: false, error: 'Tournament not found' },
        { status: 404 }
      )
    }

    if (tournament.phase !== 'SETUP') {
      return NextResponse.json(
        { success: false, error: 'Players can only be added during SETUP phase' },
        { status: 400 }
      )
    }

    // Validate participants exist in board and not already in tournament
    const existingParticipantIds = tournament.participants.map((tp) => tp.participantId)
    const boardParticipantIds = tournament.board.participants.map((p) => p.id)

    const invalidParticipants = validatedData.participantIds.filter(
      (id) => !boardParticipantIds.includes(id)
    )
    if (invalidParticipants.length > 0) {
      return NextResponse.json(
        { success: false, error: 'Some participants do not exist in the board' },
        { status: 400 }
      )
    }

    const duplicateParticipants = validatedData.participantIds.filter((id) =>
      existingParticipantIds.includes(id)
    )
    if (duplicateParticipants.length > 0) {
      return NextResponse.json(
        { success: false, error: 'Some participants are already in the tournament' },
        { status: 400 }
      )
    }

    // Create tournament participants
    const tournamentParticipants = await prisma.tournamentParticipant.createMany({
      data: validatedData.participantIds.map((participantId) => ({
        tournamentId,
        participantId,
      })),
    })

    // Add to history
    await prisma.history.create({
      data: {
        action: 'tournament_players_added',
        details: {
          tournamentName: tournament.name,
          boardName: tournament.board.name,
          participantCount: validatedData.participantIds.length,
        },
        boardId: tournament.boardId,
      },
    })

    return NextResponse.json({
      success: true,
      data: { count: tournamentParticipants.count },
    })
  } catch (error) {
    console.error('Error adding players to tournament:', error)

    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { success: false, error: 'Invalid input data' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Failed to add players to tournament' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { searchParams } = new URL(request.url)
    const participantId = searchParams.get('participantId')
    const tournamentId = (await params).id

    if (!participantId) {
      return NextResponse.json(
        { success: false, error: 'Participant ID is required' },
        { status: 400 }
      )
    }

    // Check tournament exists and is in SETUP phase
    const tournament = await prisma.tournament.findUnique({
      where: { id: tournamentId },
      include: {
        board: true,
      },
    })

    if (!tournament) {
      return NextResponse.json(
        { success: false, error: 'Tournament not found' },
        { status: 404 }
      )
    }

    if (tournament.phase !== 'SETUP') {
      return NextResponse.json(
        { success: false, error: 'Players can only be removed during SETUP phase' },
        { status: 400 }
      )
    }

    // Remove tournament participant
    await prisma.tournamentParticipant.deleteMany({
      where: {
        tournamentId,
        participantId,
      },
    })

    // Add to history
    await prisma.history.create({
      data: {
        action: 'tournament_player_removed',
        details: {
          tournamentName: tournament.name,
          boardName: tournament.board.name,
          participantId,
        },
        boardId: tournament.boardId,
      },
    })

    return NextResponse.json({
      success: true,
      data: { message: 'Player removed from tournament' },
    })
  } catch (error) {
    console.error('Error removing player from tournament:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to remove player from tournament' },
      { status: 500 }
    )
  }
}

