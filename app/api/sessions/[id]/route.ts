import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { updateSessionSchema } from '@/types'

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

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await prisma.session.findUnique({
      where: { id: params.id },
      include: {
        board: {
          select: {
            id: true,
            name: true,
            type: true,
            participants: true,
          }
        },
        matches: {
          include: {
            player1: true,
            player2: true,
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    })

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Session not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: session,
    })
  } catch (error) {
    console.error('Error fetching session:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch session' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const validatedData = updateSessionSchema.parse(body)

    const session = await prisma.session.update({
      where: { id: params.id },
      data: validatedData,
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
    })

    // Add to history
    await prisma.history.create({
      data: {
        action: 'session_updated',
        details: {
          sessionName: session.name,
          boardName: session.board.name,
          updatedFields: Object.keys(validatedData),
        },
        boardId: session.boardId,
      },
    })

    return NextResponse.json({
      success: true,
      data: session,
    })
  } catch (error) {
    console.error('Error updating session:', error)
    
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { success: false, error: 'Invalid input data' },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { success: false, error: 'Failed to update session' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await prisma.session.findUnique({
      where: { id: params.id },
      include: {
        board: {
          select: {
            id: true,
            name: true,
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

    // Delete session (matches will be deleted due to cascade)
    await prisma.session.delete({
      where: { id: params.id },
    })

    // Add to history
    await prisma.history.create({
      data: {
        action: 'session_deleted',
        details: {
          sessionName: session.name,
          boardName: session.board.name,
        },
        boardId: session.boardId,
      },
    })

    return NextResponse.json({
      success: true,
      data: { message: 'Session deleted successfully' },
    })
  } catch (error) {
    console.error('Error deleting session:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete session' },
      { status: 500 }
    )
  }
}
