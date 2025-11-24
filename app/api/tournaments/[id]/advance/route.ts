import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { calculateGroupRankings } from '@/lib/utils/tournament/ranking'
import { determineSemifinalParticipants } from '@/lib/utils/tournament/advancement'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const tournamentId = (await params).id

    // Get tournament with groups, participants, and matches
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
            matches: {
              include: {
                player1: true,
                player2: true,
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

    if (tournament.phase !== 'GROUP_STAGE') {
      return NextResponse.json(
        { success: false, error: 'Can only advance from GROUP_STAGE phase' },
        { status: 400 }
      )
    }

    // Check all group matches are completed
    for (const group of tournament.groups) {
      const incompleteMatches = group.matches.filter((m) => m.status !== 'COMPLETED')
      if (incompleteMatches.length > 0) {
        return NextResponse.json(
          {
            success: false,
            error: `Not all matches in ${group.name} are completed`,
          },
          { status: 400 }
        )
      }
    }

    // Calculate final group rankings
    const groupsWithStandings = tournament.groups.map((group) => {
      const participants = group.participants.map((tp) => tp.participant)
      const matches = group.matches

      const standings = calculateGroupRankings(
        group.id,
        matches,
        participants,
        3, // winPoints
        0, // lossPoints
        1 // drawPoints
      )

      return {
        id: group.id,
        name: group.name,
        standings,
      }
    })

    // Determine semifinal participants
    const semifinals = determineSemifinalParticipants(groupsWithStandings)

    // Update participant seeds based on final rankings
    for (const group of groupsWithStandings) {
      for (const standing of group.standings) {
        await prisma.tournamentParticipant.updateMany({
          where: {
            tournamentId,
            participantId: standing.participantId,
          },
          data: {
            seed: standing.rank,
          },
        })
      }
    }

    // Create semifinal matches
    const semifinal1 = await prisma.match.create({
      data: {
        tournamentId,
        player1Id: semifinals.semifinal1.player1Id,
        player2Id: semifinals.semifinal1.player2Id,
        player1Score: 0,
        player2Score: 0,
        status: 'PENDING',
        round: 'SEMIFINAL',
        matchNumber: 1,
      },
    })

    const semifinal2 = await prisma.match.create({
      data: {
        tournamentId,
        player1Id: semifinals.semifinal2.player1Id,
        player2Id: semifinals.semifinal2.player2Id,
        player1Score: 0,
        player2Score: 0,
        status: 'PENDING',
        round: 'SEMIFINAL',
        matchNumber: 2,
      },
    })

    // Update tournament phase
    await prisma.tournament.update({
      where: { id: tournamentId },
      data: { phase: 'KNOCKOUT' },
    })

    // Add to history
    await prisma.history.create({
      data: {
        action: 'tournament_advanced_to_knockout',
        details: {
          tournamentName: tournament.name,
          boardName: tournament.board.name,
        },
        boardId: tournament.boardId,
      },
    })

    return NextResponse.json({
      success: true,
      data: {
        semifinals: [semifinal1, semifinal2],
      },
    })
  } catch (error) {
    console.error('Error advancing to knockout:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to advance to knockout stage' },
      { status: 500 }
    )
  }
}

