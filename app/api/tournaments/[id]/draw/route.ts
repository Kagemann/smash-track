import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { drawGroups, validateGroupSizes } from '@/lib/utils/tournament/draw'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const tournamentId = (await params).id
    const body = await request.json().catch(() => ({}))
    const manualAssignments = body.assignments as Record<string, number> | undefined // participantId -> groupIndex

    // Get tournament with participants
    const tournament = await prisma.tournament.findUnique({
      where: { id: tournamentId },
      include: {
        participants: {
          include: {
            participant: true,
          },
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

    if (tournament.phase !== 'SETUP') {
      return NextResponse.json(
        { success: false, error: 'Draw can only be performed during SETUP phase' },
        { status: 400 }
      )
    }

    const participantIds = tournament.participants.map((tp) => tp.participantId)
    const groupSizes = (tournament.groupConfig as { groupSizes: number[] }).groupSizes

    // Validate group sizes
    if (!validateGroupSizes(participantIds.length, groupSizes)) {
      return NextResponse.json(
        {
          success: false,
          error: `Participant count (${participantIds.length}) does not match sum of group sizes (${groupSizes.reduce((a, b) => a + b, 0)})`,
        },
        { status: 400 }
      )
    }

    // Create groups first
    const groups = []
    for (let i = 0; i < groupSizes.length; i++) {
      const group = await prisma.group.create({
        data: {
          tournamentId,
          name: `Group ${String.fromCharCode(65 + i)}`, // A, B, C, etc.
          order: i,
        },
      })
      groups.push(group)
    }

    // Determine assignment: manual or random
    let assignment: Map<string, number>
    
    if (manualAssignments) {
      // Validate manual assignments
      const assignedCounts = new Array(groupSizes.length).fill(0)
      for (const [participantId, groupIndex] of Object.entries(manualAssignments)) {
        if (!participantIds.includes(participantId)) {
          return NextResponse.json(
            { success: false, error: `Invalid participant ID: ${participantId}` },
            { status: 400 }
          )
        }
        if (groupIndex < 0 || groupIndex >= groupSizes.length) {
          return NextResponse.json(
            { success: false, error: `Invalid group index: ${groupIndex}` },
            { status: 400 }
          )
        }
        assignedCounts[groupIndex]++
      }

      // Check if all groups are filled correctly
      for (let i = 0; i < groupSizes.length; i++) {
        if (assignedCounts[i] !== groupSizes[i]) {
          return NextResponse.json(
            { success: false, error: `Group ${String.fromCharCode(65 + i)} should have ${groupSizes[i]} participants, but has ${assignedCounts[i]}` },
            { status: 400 }
          )
        }
      }

      // Check if all participants are assigned
      if (Object.keys(manualAssignments).length !== participantIds.length) {
        return NextResponse.json(
          { success: false, error: 'All participants must be assigned to a group' },
          { status: 400 }
        )
      }

      assignment = new Map(Object.entries(manualAssignments).map(([id, idx]) => [id, idx]))
    } else {
      // Random draw
      assignment = drawGroups(participantIds, groupSizes)
    }

    // Assign participants to groups
    for (const [participantId, groupIndex] of assignment.entries()) {
      await prisma.tournamentParticipant.updateMany({
        where: {
          tournamentId,
          participantId,
        },
        data: {
          groupId: groups[groupIndex].id,
        },
      })
    }

    // Update tournament phase
    await prisma.tournament.update({
      where: { id: tournamentId },
      data: { phase: 'GROUP_DRAW' },
    })

    // Add to history
    await prisma.history.create({
      data: {
        action: 'tournament_groups_drawn',
        details: {
          tournamentName: tournament.name,
          boardName: tournament.board.name,
          groupCount: groups.length,
        },
        boardId: tournament.boardId,
      },
    })

    return NextResponse.json({
      success: true,
      data: { groups, assignment: Object.fromEntries(assignment) },
    })
  } catch (error) {
    console.error('Error drawing groups:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to draw groups' },
      { status: 500 }
    )
  }
}

