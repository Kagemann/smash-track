import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const createParticipantSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  boardId: z.string().min(1, 'Board ID is required'),
})

const updateParticipantSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = createParticipantSchema.parse(body)

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

    // Create participant
    const participant = await prisma.participant.create({
      data: {
        name: validatedData.name.trim(),
        boardId: validatedData.boardId,
      },
      include: {
        scores: true,
      },
    })

    // Add to history
    await prisma.history.create({
      data: {
        action: 'participant_added',
        details: {
          participantName: participant.name,
          boardName: board.name,
        },
        boardId: board.id,
      },
    })

    return NextResponse.json({
      success: true,
      data: participant,
    })
  } catch (error) {
    console.error('Error creating participant:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid input data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Failed to create participant' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const participantId = searchParams.get('id')
    
    if (!participantId) {
      return NextResponse.json(
        { success: false, error: 'Participant ID is required' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const validatedData = updateParticipantSchema.parse(body)

    // Get participant to find board
    const existingParticipant = await prisma.participant.findUnique({
      where: { id: participantId },
      include: { board: true },
    })

    if (!existingParticipant) {
      return NextResponse.json(
        { success: false, error: 'Participant not found' },
        { status: 404 }
      )
    }

    // Update participant
    const participant = await prisma.participant.update({
      where: { id: participantId },
      data: {
        name: validatedData.name.trim(),
      },
      include: {
        scores: true,
      },
    })

    // Add to history
    await prisma.history.create({
      data: {
        action: 'participant_updated',
        details: {
          participantName: participant.name,
          boardName: existingParticipant.board.name,
        },
        boardId: existingParticipant.boardId,
      },
    })

    return NextResponse.json({
      success: true,
      data: participant,
    })
  } catch (error) {
    console.error('Error updating participant:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid input data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Failed to update participant' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const participantId = searchParams.get('id')

    if (!participantId) {
      return NextResponse.json(
        { success: false, error: 'Participant ID is required' },
        { status: 400 }
      )
    }

    // Get participant to find board before deletion
    const participant = await prisma.participant.findUnique({
      where: { id: participantId },
      include: { board: true },
    })

    if (!participant) {
      return NextResponse.json(
        { success: false, error: 'Participant not found' },
        { status: 404 }
      )
    }

    // Delete participant
    await prisma.participant.delete({
      where: { id: participantId },
    })

    // Add to history
    await prisma.history.create({
      data: {
        action: 'participant_removed',
        details: {
          participantName: participant.name,
          boardName: participant.board.name,
        },
        boardId: participant.boardId,
      },
    })

    return NextResponse.json({
      success: true,
      data: { message: 'Participant deleted successfully' },
    })
  } catch (error) {
    console.error('Error deleting participant:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete participant' },
      { status: 500 }
    )
  }
}

