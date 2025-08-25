import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { updateScoreSchema } from '@/types'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

const prisma = globalForPrisma.prisma ?? new PrismaClient({
  datasources: {
    db: {
      url: "file:./dev.db"
    }
  }
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

interface RouteParams {
  params: Promise<{
    id: string
  }>
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const score = await prisma.score.findUnique({
      where: { id },
      include: {
        participant: true,
        column: true,
      },
    })

    if (!score) {
      return NextResponse.json(
        { success: false, error: 'Score not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: score,
    })
  } catch (error) {
    console.error('Error fetching score:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch score' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const body = await request.json()
    const validatedData = updateScoreSchema.parse(body)

    // Check if score exists
    const existingScore = await prisma.score.findUnique({
      where: { id },
      include: { participant: true, board: true }
    })

    if (!existingScore) {
      return NextResponse.json(
        { success: false, error: 'Score not found' },
        { status: 404 }
      )
    }

    // Update score
    const score = await prisma.score.update({
      where: { id },
      data: {
        value: validatedData.value,
      },
      include: {
        participant: true,
        column: true,
      },
    })

    // Add to history
    await prisma.history.create({
      data: {
        action: 'score_updated',
        details: {
          participantName: existingScore.participant.name,
          oldValue: existingScore.value,
          newValue: validatedData.value,
          boardName: existingScore.board.name,
        },
        boardId: existingScore.boardId,
      },
    })

    return NextResponse.json({
      success: true,
      data: score,
    })
  } catch (error) {
    console.error('Error updating score:', error)
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { success: false, error: 'Invalid input data' },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { success: false, error: 'Failed to update score' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params

    // Check if score exists
    const existingScore = await prisma.score.findUnique({
      where: { id },
      include: { participant: true, board: true }
    })

    if (!existingScore) {
      return NextResponse.json(
        { success: false, error: 'Score not found' },
        { status: 404 }
      )
    }

    // Delete score
    await prisma.score.delete({
      where: { id },
    })

    // Add to history
    await prisma.history.create({
      data: {
        action: 'score_deleted',
        details: {
          participantName: existingScore.participant.name,
          scoreValue: existingScore.value,
          boardName: existingScore.board.name,
        },
        boardId: existingScore.boardId,
      },
    })

    return NextResponse.json({
      success: true,
      data: { message: 'Score deleted successfully' },
    })
  } catch (error) {
    console.error('Error deleting score:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete score' },
      { status: 500 }
    )
  }
}
