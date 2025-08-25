import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { createBoardSchema } from '@/types'

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

// Helper function to get board URLs
function getBoardUrls(boardId: string) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  
  return {
    publicUrl: `${baseUrl}/boards/${boardId}`,
    adminUrl: `${baseUrl}/boards/${boardId}/admin`,
  }
}

export async function GET() {
  try {
    const boards = await prisma.board.findMany({
      include: {
        participants: true,
        scores: true,
      },
      orderBy: { updatedAt: 'desc' },
    })

    return NextResponse.json({
      success: true,
      data: boards,
    })
  } catch (error) {
    console.error('Error fetching boards:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch boards' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate input
    const validatedData = createBoardSchema.parse(body)
    
    // Create board with participants and columns
    const board = await prisma.board.create({
      data: {
        name: validatedData.name,
        type: validatedData.type,
        participants: {
          create: validatedData.participants.map(name => ({
            name: name.trim()
          }))
        },
        columns: {
          create: validatedData.columns.map((column, index) => ({
            name: column.name,
            type: (column.type === 'time' ? 'DATE' : column.type.toUpperCase()) as 'NUMBER' | 'TEXT' | 'DATE' | 'BOOLEAN',
            order: index
          }))
        }
      },
      include: {
        participants: true,
        columns: true,
        scores: true,
      },
    })

    // Generate URLs
    const urls = getBoardUrls(board.id)

    // Add to history
    await prisma.history.create({
      data: {
        action: 'board_created',
        details: {
          boardName: board.name,
          boardType: board.type,
          participantCount: validatedData.participants.length,
          columnCount: validatedData.columns.length,
        },
        boardId: board.id,
      },
    })

    return NextResponse.json({
      success: true,
      data: {
        ...board,
        publicUrl: urls.publicUrl,
        adminUrl: urls.adminUrl,
      },
    })
  } catch (error) {
    console.error('Error creating board:', error)
    
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { success: false, error: 'Invalid input data' },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { success: false, error: 'Failed to create board' },
      { status: 500 }
    )
  }
}
