import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { updateTournamentSchema } from '@/types'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const tournament = await prisma.tournament.findUnique({
      where: { id: (await params).id },
      include: {
        board: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
        participants: {
          include: {
            participant: true,
            group: true,
          },
        },
        groups: {
          include: {
            participants: {
              include: {
                participant: true,
              },
            },
            matches: {
              include: {
                player1: true,
                player2: true,
              },
              orderBy: { createdAt: 'asc' },
            },
          },
          orderBy: { order: 'asc' },
        },
        knockoutMatches: {
          include: {
            player1: true,
            player2: true,
          },
          orderBy: [{ round: 'asc' }, { matchNumber: 'asc' }],
        },
      },
    })

    if (!tournament) {
      return NextResponse.json(
        { success: false, error: 'Tournament not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: tournament,
    })
  } catch (error) {
    console.error('Error fetching tournament:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch tournament' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json()
    const validatedData = updateTournamentSchema.parse(body)

    const tournament = await prisma.tournament.findUnique({
      where: { id: (await params).id },
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

    const updatedTournament = await prisma.tournament.update({
      where: { id: (await params).id },
      data: validatedData,
      include: {
        board: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
        participants: {
          include: {
            participant: true,
          },
        },
        groups: true,
      },
    })

    // Add to history
    await prisma.history.create({
      data: {
        action: 'tournament_updated',
        details: {
          tournamentName: tournament.name,
          boardName: tournament.board.name,
          updatedFields: Object.keys(validatedData),
        },
        boardId: tournament.boardId,
      },
    })

    return NextResponse.json({
      success: true,
      data: updatedTournament,
    })
  } catch (error) {
    console.error('Error updating tournament:', error)

    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { success: false, error: 'Invalid input data' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Failed to update tournament' },
      { status: 500 }
    )
  }
}

