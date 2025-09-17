import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { updateBoardSchema } from '@/types'

// Helper function to get board URLs
function getBoardUrls(boardId: string) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  
  return {
    publicUrl: `${baseUrl}/boards/${boardId}`,
    adminUrl: `${baseUrl}/boards/${boardId}/admin`,
  }
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const board = await prisma.board.findUnique({
      where: { id },
      include: {
        participants: {
          include: {
            scores: true,
          },
        },
        columns: { orderBy: { order: 'asc' } },
        scores: {
          include: {
            participant: true,
            column: true,
          },
        },
        history: { orderBy: { createdAt: 'desc' }, take: 50 },
        sessions: {
          include: {
            matches: {
              include: {
                player1: true,
                player2: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    })

    if (!board) {
      return NextResponse.json(
        { success: false, error: 'Board not found' },
        { status: 404 }
      )
    }

    // Generate URLs
    const urls = getBoardUrls(board.id)

    return NextResponse.json({
      success: true,
      data: {
        ...board,
        publicUrl: urls.publicUrl,
        adminUrl: urls.adminUrl,
      },
    })
  } catch (error) {
    console.error('Error fetching board:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch board' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    
    // Validate input
    const validatedData = updateBoardSchema.parse(body)
    
    // Update board
    const board = await prisma.board.update({
      where: { id },
      data: validatedData,
      include: {
        participants: true,
        columns: true,
        scores: true,
      },
    })

    // Add to history
    await prisma.history.create({
      data: {
        action: 'board_updated',
        details: {
          boardName: board.name,
          updatedFields: Object.keys(validatedData),
        },
        boardId: board.id,
      },
    })

    // Generate URLs
    const urls = getBoardUrls(board.id)

    return NextResponse.json({
      success: true,
      data: {
        ...board,
        publicUrl: urls.publicUrl,
        adminUrl: urls.adminUrl,
      },
    })
  } catch (error) {
    console.error('Error updating board:', error)
    
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { success: false, error: 'Invalid input data' },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { success: false, error: 'Failed to update board' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    // Check if board exists
    const existingBoard = await prisma.board.findUnique({
      where: { id },
    })

    if (!existingBoard) {
      return NextResponse.json(
        { success: false, error: 'Board not found' },
        { status: 404 }
      )
    }

    // Delete board (cascade will handle related records)
    await prisma.board.delete({
      where: { id },
    })

    return NextResponse.json({
      success: true,
      data: { message: 'Board deleted successfully' },
    })
  } catch (error) {
    console.error('Error deleting board:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete board' },
      { status: 500 }
    )
  }
}
