import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { createSessionSchema } from '@/types'
import { ensureDefaultColumns } from '@/lib/utils/board-utils'

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

    const sessions = await prisma.session.findMany({
      where,
      include: {
        board: {
          select: {
            id: true,
            name: true,
            type: true,
          }
        },
        matches: {
          include: {
            player1: true,
            player2: true,
          }
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({
      success: true,
      data: sessions,
    })
  } catch (error) {
    console.error('Error fetching sessions:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch sessions' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate input
    const validatedData = createSessionSchema.parse(body)
    
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

    // Ensure default columns exist for session scoring
    await ensureDefaultColumns(validatedData.boardId)

    // Create session
    const session = await prisma.session.create({
      data: {
        name: validatedData.name,
        description: validatedData.description,
        boardId: validatedData.boardId,
        winPoints: validatedData.winPoints,
        lossPoints: validatedData.lossPoints,
        drawPoints: validatedData.drawPoints,
      },
      include: {
        board: {
          select: {
            id: true,
            name: true,
            type: true,
          }
        },
        matches: true,
      },
    })

    // Add to history
    await prisma.history.create({
      data: {
        action: 'session_created',
        details: {
          sessionName: session.name,
          boardName: board.name,
        },
        boardId: board.id,
      },
    })

    return NextResponse.json({
      success: true,
      data: session,
    })
  } catch (error) {
    console.error('Error creating session:', error)
    
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { success: false, error: 'Invalid input data' },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { success: false, error: 'Failed to create session' },
      { status: 500 }
    )
  }
}
