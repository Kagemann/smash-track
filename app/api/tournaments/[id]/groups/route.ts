import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { calculateGroupRankings } from '@/lib/utils/tournament/ranking'

export async function GET(
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

    // Calculate standings for each group
    const groupStandings = tournament.groups.map((group) => {
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
        group: {
          id: group.id,
          name: group.name,
          order: group.order,
        },
        standings,
      }
    })

    return NextResponse.json({
      success: true,
      data: groupStandings,
    })
  } catch (error) {
    console.error('Error fetching group standings:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch group standings' },
      { status: 500 }
    )
  }
}

