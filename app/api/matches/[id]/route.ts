import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { updateMatchSchema, completeMatchSchema } from '@/types'
import { getColumnId, getColumnUpdateValue, shouldUpdateColumn } from '@/lib/utils/board-utils'

// Helper function to calculate match points using session configuration
const calculateMatchPoints = (player1Score: number, player2Score: number, session: any) => {
  if (player1Score > player2Score) {
    return { 
      player1Points: session.winPoints, 
      player2Points: session.lossPoints, 
      winnerId: 'player1',
      player1Wins: 1,
      player2Wins: 0,
      player1Losses: 0,
      player2Losses: 1
    }
  } else if (player1Score < player2Score) {
    return { 
      player1Points: session.lossPoints, 
      player2Points: session.winPoints, 
      winnerId: 'player2',
      player1Wins: 0,
      player2Wins: 1,
      player1Losses: 1,
      player2Losses: 0
    }
  } else {
    return { 
      player1Points: session.drawPoints, 
      player2Points: session.drawPoints, 
      winnerId: null,
      player1Wins: 0,
      player2Wins: 0,
      player1Losses: 0,
      player2Losses: 0
    }
  }
}

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

      if (match.session.status !== 'ACTIVE') {
        return NextResponse.json(
          { success: false, error: 'Session is not active' },
          { status: 400 }
        )
      }

      // Calculate points and winner using session configuration
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
        match.session
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
        where: { id: match.session.board.id },
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
            boardId: match.session.board.id,
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
              boardId: match.session.board.id,
              columnId: column.id,
            })
          }
          
          if (customScore.player2 >= 0) {
            scoreData.push({
              value: customScore.player2,
              participantId: match.player2Id,
              boardId: match.session.board.id,
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
                boardId: match.session.board.id,
                columnId: column.id,
              })
            }

            // Add player 2 score to this column
            if (player2Value !== 0) {
              scoreData.push({
                value: player2Value,
                participantId: match.player2Id,
                boardId: match.session.board.id,
                columnId: column.id,
              })
            }
          }
        }
      })

      // Create all scores
      if (scoreData.length > 0) {
        await prisma.score.createMany({
          data: scoreData,
        })
      }

      // Add to history
      await prisma.history.create({
        data: {
          action: 'match_completed',
          details: {
            sessionName: match.session.name,
            boardName: match.session.board.name,
            player1Name: match.player1.name,
            player2Name: match.player2.name,
            player1Score: validatedData.player1Score,
            player2Score: validatedData.player2Score,
            player1Points,
            player2Points,
            winner: winnerId ? (winnerId === 'player1' ? match.player1.name : match.player2.name) : 'Draw',
          },
          boardId: match.session.board.id,
        },
      })

      return NextResponse.json({
        success: true,
        data: updatedMatch,
      })
    }

    // Handle regular match updates
    const validatedData = updateMatchSchema.parse(body)

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
        player1: true,
        player2: true,
      },
    })

    // Add to history
    await prisma.history.create({
      data: {
        action: 'match_updated',
        details: {
          sessionName: match.session.name,
          boardName: match.session.board.name,
          player1Name: match.player1.name,
          player2Name: match.player2.name,
          updatedFields: Object.keys(validatedData),
        },
        boardId: match.session.board.id,
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

    // Delete match
    await prisma.match.delete({
      where: { id: (await params).id },
    })

    // Add to history
    await prisma.history.create({
      data: {
        action: 'match_deleted',
        details: {
          sessionName: match.session.name,
          boardName: match.session.board.name,
          player1Name: match.player1.name,
          player2Name: match.player2.name,
        },
        boardId: match.session.board.id,
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
