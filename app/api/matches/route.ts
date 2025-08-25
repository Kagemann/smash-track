import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { createMatchSchema } from '@/types'

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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('sessionId')
    const status = searchParams.get('status')

    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: 'Session ID is required' },
        { status: 400 }
      )
    }

    const where: any = { sessionId }
    if (status) where.status = status

    const matches = await prisma.match.findMany({
      where,
      include: {
        session: {
          select: {
            id: true,
            name: true,
            board: {
              select: {
                id: true,
                name: true,
                type: true,
              }
            },
          }
        },
        player1: true,
        player2: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({
      success: true,
      data: matches,
    })
  } catch (error) {
    console.error('Error fetching matches:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch matches' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate input
    const validatedData = createMatchSchema.parse(body)
    
    // Check if session exists and is active
    const session = await prisma.session.findUnique({
      where: { id: validatedData.sessionId },
      include: {
        board: {
          select: {
            id: true,
            name: true,
            participants: true,
          }
        },
      },
    })

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Session not found' },
        { status: 404 }
      )
    }

    if (session.status !== 'ACTIVE') {
      return NextResponse.json(
        { success: false, error: 'Session is not active' },
        { status: 400 }
      )
    }

    // Check if both players exist in the board
    const player1 = session.board.participants.find(p => p.id === validatedData.player1Id)
    const player2 = session.board.participants.find(p => p.id === validatedData.player2Id)

    if (!player1 || !player2) {
      return NextResponse.json(
        { success: false, error: 'One or both players not found in board' },
        { status: 400 }
      )
    }

    // Allow multiple matches between the same players in a session
    // This enables rematches and multiple games between the same participants

    // Create match
    const match = await prisma.match.create({
      data: {
        sessionId: validatedData.sessionId,
        player1Id: validatedData.player1Id,
        player2Id: validatedData.player2Id,
        player1Score: 0,
        player2Score: 0,
      },
      include: {
        session: {
          select: {
            id: true,
            name: true,
            board: {
              select: {
                id: true,
                name: true,
              }
            },
          }
        },
        player1: true,
        player2: true,
      },
    })

    // Add to history
    await prisma.history.create({
      data: {
        action: 'match_created',
        details: {
          sessionName: session.name,
          boardName: session.board.name,
          player1Name: player1.name,
          player2Name: player2.name,
        },
        boardId: session.board.id,
      },
    })

    return NextResponse.json({
      success: true,
      data: match,
    })
  } catch (error) {
    console.error('Error creating match:', error)
    
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { success: false, error: 'Invalid input data' },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { success: false, error: 'Failed to create match' },
      { status: 500 }
    )
  }
}
