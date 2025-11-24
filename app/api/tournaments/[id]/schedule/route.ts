import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { generateGroupSchedules } from '@/lib/utils/tournament/schedule'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const tournamentId = (await params).id

    // Get tournament with groups and participants
    const tournament = await prisma.tournament.findUnique({
      where: { id: tournamentId },
      include: {
        groups: {
          include: {
            participants: {
              include: {
                participant: true,
              },
            },
          },
          orderBy: { order: 'asc' },
        },
        board: true,
      },
    })

    if (!tournament) {
      return NextResponse.json(
        { success: false, error: 'Tournament not found' },
        { status: 404 }
      )
    }

    if (tournament.phase !== 'GROUP_DRAW') {
      return NextResponse.json(
        { success: false, error: 'Schedule can only be generated during GROUP_DRAW phase' },
        { status: 400 }
      )
    }

    // Generate schedules for each group
    const groupSchedules = generateGroupSchedules(
      tournament.groups.map((group) => ({
        id: group.id,
        participantIds: group.participants.map((tp) => tp.participantId),
      }))
    )

    // Create matches
    const createdMatches = []
    for (const schedule of groupSchedules) {
      for (let i = 0; i < schedule.matches.length; i++) {
        const match = schedule.matches[i]
        const createdMatch = await prisma.match.create({
          data: {
            groupId: schedule.groupId,
            player1Id: match.player1Id,
            player2Id: match.player2Id,
            player1Score: 0,
            player2Score: 0,
            status: 'PENDING',
            round: 'GROUP',
            matchNumber: i + 1,
          },
        })
        createdMatches.push(createdMatch)
      }
    }

    // Update tournament phase
    await prisma.tournament.update({
      where: { id: tournamentId },
      data: { phase: 'GROUP_STAGE', status: 'ACTIVE' },
    })

    // Add to history
    await prisma.history.create({
      data: {
        action: 'tournament_schedule_generated',
        details: {
          tournamentName: tournament.name,
          boardName: tournament.board.name,
          matchCount: createdMatches.length,
        },
        boardId: tournament.boardId,
      },
    })

    return NextResponse.json({
      success: true,
      data: { matches: createdMatches },
    })
  } catch (error) {
    console.error('Error generating schedule:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to generate schedule' },
      { status: 500 }
    )
  }
}

