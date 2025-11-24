import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { createTournamentSchema } from '@/types'
import { ensureDefaultColumns } from '@/lib/utils/session'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const boardId = searchParams.get('boardId')
    const status = searchParams.get('status')

    if (!boardId) {
      return NextResponse.json(
        { success: false, error: 'Board ID is required' },
        { status: 400 }
      )
    }

    const where: any = { boardId }
    if (status) where.status = status

    const tournaments = await prisma.tournament.findMany({
      where,
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
        groups: {
          include: {
            matches: {
              where: {
                status: 'COMPLETED',
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    // Add basic stats to each tournament
    const tournamentsWithStats = tournaments.map((tournament) => {
      const totalMatches = tournament.groups.reduce(
        (sum, group) => sum + group.matches.length,
        0
      )
      const completedMatches = tournament.groups.reduce(
        (sum, group) => sum + group.matches.filter((m) => m.status === 'COMPLETED').length,
        0
      )

      return {
        ...tournament,
        stats: {
          playerCount: tournament.participants.length,
          totalMatches,
          completedMatches,
        },
      }
    })

    return NextResponse.json({
      success: true,
      data: tournamentsWithStats,
    })
  } catch (error) {
    console.error('Error fetching tournaments:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch tournaments' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input
    const validatedData = createTournamentSchema.parse(body)

    // Check if board exists
    const board = await prisma.board.findUnique({
      where: { id: validatedData.boardId },
    })

    if (!board) {
      return NextResponse.json(
        { success: false, error: 'Board not found' },
        { status: 404 }
      )
    }

    // Ensure default columns exist for tournament scoring
    await ensureDefaultColumns(validatedData.boardId)

    // Create tournament
    const tournament = await prisma.tournament.create({
      data: {
        name: validatedData.name,
        description: validatedData.description,
        boardId: validatedData.boardId,
        status: 'DRAFT',
        phase: 'SETUP',
        groupConfig: {
          groupSizes: validatedData.groupSizes,
          numGroups: validatedData.groupSizes.length,
        },
      },
      include: {
        board: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
        participants: true,
        groups: true,
      },
    })

    // Add to history
    await prisma.history.create({
      data: {
        action: 'tournament_created',
        details: {
          tournamentName: tournament.name,
          boardName: board.name,
        },
        boardId: board.id,
      },
    })

    return NextResponse.json({
      success: true,
      data: tournament,
    })
  } catch (error) {
    console.error('Error creating tournament:', error)

    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { success: false, error: 'Invalid input data' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Failed to create tournament' },
      { status: 500 }
    )
  }
}

