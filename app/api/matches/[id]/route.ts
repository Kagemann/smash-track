import { NextRequest, NextResponse } from 'next/server'
import { prisma, updateScore } from '@/lib/db'
import { updateMatchSchema, completeMatchSchema } from '@/types'
import { getColumnId, getColumnUpdateValue, shouldUpdateColumn, calculateMatchPoints } from '@/lib/utils/session'

// Using calculateMatchPoints from session utilities

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const match = await prisma.match.findUnique({
      where: { id: (await params).id },
      include: {
        session: {
          select: {
            id: true,
            name: true,
            status: true,
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
    })

    if (!match) {
      return NextResponse.json(
        { success: false, error: 'Match not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: match,
    })
  } catch (error) {
    console.error('Error fetching match:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch match' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json()
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')

         // Handle match completion
     if (action === 'complete') {
       console.log('Match completion request body:', body)
       console.log('Body type:', typeof body)
       console.log('Body keys:', Object.keys(body))
       
       // Basic validation first
       if (typeof body.player1Score !== 'number' || typeof body.player2Score !== 'number') {
         return NextResponse.json(
           { success: false, error: 'player1Score and player2Score must be numbers' },
           { status: 400 }
         )
       }
       
       if (body.player1Score < 0 || body.player2Score < 0) {
         return NextResponse.json(
           { success: false, error: 'Scores must be non-negative' },
           { status: 400 }
         )
       }
       
       let validatedData
       try {
         validatedData = completeMatchSchema.parse(body)
         console.log('Validated data:', validatedData)
         
         // Ensure customScores is always an object
         if (!validatedData.customScores) {
           validatedData.customScores = {} as Record<string, { player1: number, player2: number }>
         }
       } catch (validationError) {
         console.error('Validation error:', validationError)
         return NextResponse.json(
           { success: false, error: 'Validation failed', details: validationError },
           { status: 400 }
         )
       }
      
      const match = await prisma.match.findUnique({
        where: { id: (await params).id },
        include: {
          session: {
            select: {
              id: true,
              name: true,
              status: true,
              winPoints: true,
              lossPoints: true,
              drawPoints: true,
              board: {
                select: {
                  id: true,
                  name: true,
                  type: true,
                }
              },
            }
          },
          tournament: {
            select: {
              id: true,
              name: true,
              boardId: true,
            }
          },
          group: {
            select: {
              id: true,
              tournamentId: true,
            }
          },
          player1: true,
          player2: true,
        },
      })

      if (!match) {
        return NextResponse.json(
          { success: false, error: 'Match not found' },
          { status: 404 }
        )
      }

      if (match.status === 'COMPLETED') {
        return NextResponse.json(
          { success: false, error: 'Match is already completed' },
          { status: 400 }
        )
      }

      // Determine if this is a tournament match or session match
      const isTournamentMatch = !!(match.groupId || match.tournamentId)
      
      // Get board ID
      let finalBoardId: string
      if (isTournamentMatch) {
        if (match.tournament?.boardId) {
          finalBoardId = match.tournament.boardId
        } else if (match.group?.tournamentId) {
          const tournament = await prisma.tournament.findUnique({
            where: { id: match.group.tournamentId },
            select: { boardId: true }
          })
          if (!tournament) {
            return NextResponse.json(
              { success: false, error: 'Tournament not found' },
              { status: 404 }
            )
          }
          finalBoardId = tournament.boardId
        } else {
          return NextResponse.json(
            { success: false, error: 'Could not determine board for tournament match' },
            { status: 400 }
          )
        }
      } else {
        if (!match.session?.board?.id) {
          return NextResponse.json(
            { success: false, error: 'Could not determine board for session match' },
            { status: 400 }
          )
        }
        finalBoardId = match.session.board.id
        
        // For session matches, validate session is active
        if (match.session.status !== 'ACTIVE') {
          return NextResponse.json(
            { success: false, error: 'Session is not active' },
            { status: 400 }
          )
        }
      }

      // Use default scoring for tournament matches (3/0/1) or session scoring
      const winPoints = isTournamentMatch ? 3 : (match.session?.winPoints || 3)
      const lossPoints = isTournamentMatch ? 0 : (match.session?.lossPoints || 0)
      const drawPoints = isTournamentMatch ? 1 : (match.session?.drawPoints || 1)

      // Calculate points and winner
      const { 
        player1Points, 
        player2Points, 
        winnerId,
        player1Wins,
        player2Wins,
        player1Losses,
        player2Losses
      } = calculateMatchPoints(
        validatedData.player1Score,
        validatedData.player2Score,
        winPoints,
        lossPoints,
        drawPoints
      )

      // Update match
      const updatedMatch = await prisma.match.update({
        where: { id: (await params).id },
        data: {
          player1Score: validatedData.player1Score,
          player2Score: validatedData.player2Score,
          winnerId: winnerId === 'player1' ? match.player1Id : 
                   winnerId === 'player2' ? match.player2Id : null,
          status: 'COMPLETED',
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

      // Get all board columns for comprehensive scoring
      const board = await prisma.board.findUnique({
        where: { id: finalBoardId },
        include: { columns: true }
      })

      if (!board) {
        return NextResponse.json(
          { success: false, error: 'Board not found' },
          { status: 404 }
        )
      }

      // Create scores mapped to specific columns
      const scoreData: Array<{
        value: number
        participantId: string
        boardId: string
        columnId: string
      }> = []

      // Helper function to add score if column exists
      const addScoreIfColumnExists = (participantId: string, columnName: string, value: number) => {
        const column = board.columns.find(col => col.name === columnName)
        if (column && value > 0) {
          scoreData.push({
            value,
            participantId,
            boardId: finalBoardId,
            columnId: column.id,
          })
        }
      }

      // Add default session scores (Wins, Losses, Points, Points Scored, Points Taken)
      addScoreIfColumnExists(match.player1Id, 'Wins', player1Wins)
      addScoreIfColumnExists(match.player1Id, 'Losses', player1Losses)
      addScoreIfColumnExists(match.player1Id, 'Points', player1Points)
      addScoreIfColumnExists(match.player1Id, 'Points Scored', validatedData.player1Score)
      addScoreIfColumnExists(match.player1Id, 'Points Taken', validatedData.player2Score)
      addScoreIfColumnExists(match.player2Id, 'Wins', player2Wins)
      addScoreIfColumnExists(match.player2Id, 'Losses', player2Losses)
      addScoreIfColumnExists(match.player2Id, 'Points', player2Points)
      addScoreIfColumnExists(match.player2Id, 'Points Scored', validatedData.player2Score)
      addScoreIfColumnExists(match.player2Id, 'Points Taken', validatedData.player1Score)

      // Add custom board column scores based on match results and user input
      board.columns.forEach(column => {
        // Skip default columns that are already handled
        if (['Wins', 'Losses', 'Points', 'Points Scored', 'Points Taken'].includes(column.name)) {
          return
        }

        // Check if custom scores were provided for this column
        const customScore = validatedData.customScores?.[column.id] as { player1: number, player2: number } | undefined
        console.log(`Processing column ${column.name} (${column.id}):`, customScore)
        
        if (customScore) {
          // Use the custom scores provided by the user
          if (customScore.player1 >= 0) {
            scoreData.push({
              value: customScore.player1,
              participantId: match.player1Id,
              boardId: finalBoardId,
              columnId: column.id,
            })
          }
          
          if (customScore.player2 >= 0) {
            scoreData.push({
              value: customScore.player2,
              participantId: match.player2Id,
              boardId: finalBoardId,
              columnId: column.id,
            })
          }
        } else {
          // Fall back to automatic calculation based on match results
          if (shouldUpdateColumn(column.name)) {
            // Calculate values for both players
            const player1Value = getColumnUpdateValue(column.name, validatedData.player1Score, validatedData.player2Score, true)
            const player2Value = getColumnUpdateValue(column.name, validatedData.player2Score, validatedData.player1Score, false)

            // Add player 1 score to this column
            if (player1Value !== 0) {
              scoreData.push({
                value: player1Value,
                participantId: match.player1Id,
                boardId: finalBoardId,
                columnId: column.id,
              })
            }

            // Add player 2 score to this column
            if (player2Value !== 0) {
              scoreData.push({
                value: player2Value,
                participantId: match.player2Id,
                boardId: finalBoardId,
                columnId: column.id,
              })
            }
          }
        }
      })

      // Create all scores using the updateScore function to properly accumulate
      if (scoreData.length > 0) {
        for (const score of scoreData) {
          await updateScore({
            value: score.value,
            participantId: score.participantId,
            boardId: score.boardId,
            columnId: score.columnId,
          })
        }
      }

      // Add to history
      const matchContext = isTournamentMatch
        ? {
            tournamentName: match.tournament?.name || 'Tournament',
            round: match.round || 'GROUP',
          }
        : {
            sessionName: match.session?.name || 'Session',
          }

      await prisma.history.create({
        data: {
          action: 'match_completed',
          details: {
            ...matchContext,
            boardName: board.name,
            player1Name: match.player1.name,
            player2Name: match.player2.name,
            player1Score: validatedData.player1Score,
            player2Score: validatedData.player2Score,
            player1Points,
            player2Points,
            winner: winnerId ? (winnerId === 'player1' ? match.player1.name : match.player2.name) : 'Draw',
          },
          boardId: finalBoardId,
        },
      })

      return NextResponse.json({
        success: true,
        data: updatedMatch,
      })
    }

    // Handle regular match updates
    const validatedData = updateMatchSchema.parse(body)

    // First, get the match to check if it's a tournament match
    const existingMatch = await prisma.match.findUnique({
      where: { id: (await params).id },
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
        tournament: {
          select: {
            id: true,
            name: true,
            boardId: true,
          }
        },
        group: {
          select: {
            id: true,
            tournamentId: true,
          }
        },
        player1: true,
        player2: true,
      },
    })

    if (!existingMatch) {
      return NextResponse.json(
        { success: false, error: 'Match not found' },
        { status: 404 }
      )
    }

    // Determine if this is a tournament match
    const isTournamentMatch = !!(existingMatch.groupId || existingMatch.tournamentId)
    
    // Get board ID
    let finalBoardId: string
    let boardName: string
    let matchContext: any = {}

    if (isTournamentMatch) {
      if (existingMatch.tournament?.boardId) {
        finalBoardId = existingMatch.tournament.boardId
        const board = await prisma.board.findUnique({
          where: { id: finalBoardId },
          select: { name: true }
        })
        boardName = board?.name || 'Board'
        matchContext = {
          tournamentName: existingMatch.tournament.name,
          round: existingMatch.round || (existingMatch.groupId ? 'GROUP' : 'UNKNOWN'),
        }
      } else if (existingMatch.group?.tournamentId) {
        const tournament = await prisma.tournament.findUnique({
          where: { id: existingMatch.group.tournamentId },
          select: { boardId: true, name: true }
        })
        if (!tournament) {
          return NextResponse.json(
            { success: false, error: 'Tournament not found' },
            { status: 404 }
          )
        }
        finalBoardId = tournament.boardId
        const board = await prisma.board.findUnique({
          where: { id: finalBoardId },
          select: { name: true }
        })
        boardName = board?.name || 'Board'
        matchContext = {
          tournamentName: tournament.name,
          round: existingMatch.round || 'GROUP',
        }
      } else {
        return NextResponse.json(
          { success: false, error: 'Could not determine board for tournament match' },
          { status: 400 }
        )
      }
    } else {
      if (!existingMatch.session?.board?.id) {
        return NextResponse.json(
          { success: false, error: 'Could not determine board for session match' },
          { status: 400 }
        )
      }
      finalBoardId = existingMatch.session.board.id
      boardName = existingMatch.session.board.name
      matchContext = {
        sessionName: existingMatch.session.name,
      }
    }

    // Update the match
    const match = await prisma.match.update({
      where: { id: (await params).id },
      data: validatedData,
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
        tournament: {
          select: {
            id: true,
            name: true,
            boardId: true,
          }
        },
        group: {
          select: {
            id: true,
            tournamentId: true,
          }
        },
        player1: true,
        player2: true,
      },
    })

    // Add to history
    await prisma.history.create({
      data: {
        action: 'match_updated',
        details: {
          ...matchContext,
          boardName: boardName,
          player1Name: match.player1.name,
          player2Name: match.player2.name,
          updatedFields: Object.keys(validatedData),
        },
        boardId: finalBoardId,
      },
    })

    return NextResponse.json({
      success: true,
      data: match,
    })
  } catch (error) {
    console.error('Error updating match:', error)
    
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { success: false, error: 'Invalid input data' },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { success: false, error: 'Failed to update match' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const match = await prisma.match.findUnique({
      where: { id: (await params).id },
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
        tournament: {
          select: {
            id: true,
            name: true,
            boardId: true,
          }
        },
        group: {
          select: {
            id: true,
            tournamentId: true,
          }
        },
        player1: true,
        player2: true,
      },
    })

    if (!match) {
      return NextResponse.json(
        { success: false, error: 'Match not found' },
        { status: 404 }
      )
    }

    // Determine boardId and context for history
    const isTournamentMatch = !!(match.groupId || match.tournamentId)
    let finalBoardId: string
    let matchContext: any

    if (isTournamentMatch) {
      let tournamentBoardId: string | undefined
      let tournamentName: string | undefined
      if (match.tournament?.boardId) {
        tournamentBoardId = match.tournament.boardId
        tournamentName = match.tournament.name
      } else if (match.group?.tournamentId) {
        const associatedTournament = await prisma.tournament.findUnique({
          where: { id: match.group.tournamentId },
          select: { boardId: true, name: true }
        })
        tournamentBoardId = associatedTournament?.boardId
        tournamentName = associatedTournament?.name
      }
      if (!tournamentBoardId) {
        return NextResponse.json(
          { success: false, error: 'Could not determine board for tournament match' },
          { status: 400 }
        )
      }
      finalBoardId = tournamentBoardId
      matchContext = {
        tournamentName: tournamentName || 'Tournament',
        round: match.round || (match.groupId ? 'GROUP' : 'UNKNOWN'),
      }
    } else {
      if (!match.session?.board?.id) {
        return NextResponse.json(
          { success: false, error: 'Could not determine board for session match' },
          { status: 400 }
        )
      }
      finalBoardId = match.session.board.id
      matchContext = {
        sessionName: match.session.name || 'Session',
      }
    }

    // Delete match
    await prisma.match.delete({
      where: { id: (await params).id },
    })

    // Add to history
    await prisma.history.create({
      data: {
        action: 'match_deleted',
        details: {
          ...matchContext,
          boardName: isTournamentMatch 
            ? (await prisma.board.findUnique({ where: { id: finalBoardId }, select: { name: true } }))?.name || 'Board'
            : match.session?.board?.name || 'Board',
          player1Name: match.player1.name,
          player2Name: match.player2.name,
        },
        boardId: finalBoardId,
      },
    })

    return NextResponse.json({
      success: true,
      data: { message: 'Match deleted successfully' },
    })
  } catch (error) {
    console.error('Error deleting match:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete match' },
      { status: 500 }
    )
  }
}
