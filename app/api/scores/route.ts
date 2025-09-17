import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { createScoreSchema, updateScoreSchema } from '@/types'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const boardId = searchParams.get('boardId')
    const participantId = searchParams.get('participantId')
    const columnId = searchParams.get('columnId')

    if (!boardId) {
      return NextResponse.json(
        { success: false, error: 'Board ID is required' },
        { status: 400 }
      )
    }

    const where: any = { boardId }
    if (participantId) where.participantId = participantId
    if (columnId) where.columnId = columnId

    const scores = await prisma.score.findMany({
      where,
      include: {
        participant: true,
        column: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({
      success: true,
      data: scores,
    })
  } catch (error) {
    console.error('Error fetching scores:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch scores' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = createScoreSchema.parse(body)

    // Check if board and participant exist
    const board = await prisma.board.findUnique({
      where: { id: validatedData.boardId },
      include: { participants: true, columns: true }
    })

    if (!board) {
      return NextResponse.json(
        { success: false, error: 'Board not found' },
        { status: 404 }
      )
    }

    const participant = board.participants.find(p => p.id === validatedData.participantId)
    if (!participant) {
      return NextResponse.json(
        { success: false, error: 'Participant not found' },
        { status: 404 }
      )
    }

    // For multiscore boards, validate column exists
    if (board.type === 'MULTISCORE' && validatedData.columnId) {
      const column = board.columns.find(c => c.id === validatedData.columnId)
      if (!column) {
        return NextResponse.json(
          { success: false, error: 'Column not found' },
          { status: 404 }
        )
      }
    }

    // Create score
    const score = await prisma.score.create({
      data: {
        value: validatedData.value,
        boardId: validatedData.boardId,
        participantId: validatedData.participantId,
        columnId: validatedData.columnId || null,
      },
      include: {
        participant: true,
        column: true,
      },
    })

    // Add to history
    await prisma.history.create({
      data: {
        action: 'score_added',
        details: {
          participantName: participant.name,
          scoreValue: validatedData.value,
          boardName: board.name,
        },
        boardId: board.id,
      },
    })

    return NextResponse.json({
      success: true,
      data: score,
    })
  } catch (error) {
    console.error('Error creating score:', error)
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { success: false, error: 'Invalid input data' },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { success: false, error: 'Failed to create score' },
      { status: 500 }
    )
  }
}
