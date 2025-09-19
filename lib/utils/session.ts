/**
 * Session and match management utilities
 * Functions for handling tournament sessions, matches, and board column management
 */

import { DEFAULT_SESSION_COLUMNS } from '@/lib/constants'

/**
 * Ensures a board has the necessary default columns for session scoring
 * Creates Wins, Losses, and Points columns if they don't exist
 * @param boardId - Board ID
 * @returns Updated board with all columns
 */
export async function ensureDefaultColumns(boardId: string) {
  const { prisma } = await import('@/lib/db')
  
  const board = await prisma.board.findUnique({
    where: { id: boardId },
    include: { columns: true }
  })

  if (!board) {
    throw new Error('Board not found')
  }

  const existingColumnNames = board.columns.map(col => col.name)
  const missingColumns = DEFAULT_SESSION_COLUMNS.filter(col => 
    !existingColumnNames.includes(col.name)
  )

  if (missingColumns.length > 0) {
    await prisma.column.createMany({
      data: missingColumns.map(col => ({
        ...col,
        boardId
      }))
    })
  }

  // Return the updated board with all columns
  return await prisma.board.findUnique({
    where: { id: boardId },
    include: { columns: true }
  })
}

/**
 * Gets the column ID for a specific column name on a board
 * @param boardId - Board ID
 * @param columnName - Column name to find
 * @returns Column ID or undefined if not found
 */
export async function getColumnId(boardId: string, columnName: string) {
  const { prisma } = await import('@/lib/db')
  
  const column = await prisma.column.findFirst({
    where: {
      boardId,
      name: columnName
    }
  })

  return column?.id
}

/**
 * Determines how a column should be updated based on match results
 * @param columnName - Name of the column
 * @param player1Score - Player 1's match score
 * @param player2Score - Player 2's match score
 * @param isPlayer1 - Whether calculating for player 1 (true) or player 2 (false)
 * @returns Value to add to the column
 */
export function getColumnUpdateValue(
  columnName: string, 
  player1Score: number, 
  player2Score: number, 
  isPlayer1: boolean
): number {
  const columnNameLower = columnName.toLowerCase()
  const playerScore = isPlayer1 ? player1Score : player2Score
  const opponentScore = isPlayer1 ? player2Score : player1Score

  // Default session columns
  if (columnName === 'Wins') {
    return playerScore > opponentScore ? 1 : 0
  }
  if (columnName === 'Losses') {
    return playerScore < opponentScore ? 1 : 0
  }
  if (columnName === 'Points') {
    // This will be calculated by the session scoring system
    return 0 // Placeholder, actual points calculated elsewhere
  }
  if (columnName === 'Points Scored') {
    return playerScore
  }
  if (columnName === 'Points Taken') {
    return opponentScore
  }

  // Custom columns based on naming patterns
  if (columnNameLower.includes('score') || 
      columnNameLower.includes('goal') || 
      columnNameLower.includes('point')) {
    return playerScore
  }
  
  if (columnNameLower.includes('conceded') || 
      columnNameLower.includes('against')) {
    return opponentScore
  }
  
  if (columnNameLower.includes('difference') || 
      columnNameLower.includes('diff')) {
    return playerScore - opponentScore
  }

  // Default: return the player's score for any other column
  return playerScore
}

/**
 * Checks if a column should be updated based on match results
 * @param columnName - Name of the column
 * @returns True if the column should be updated when matches are completed
 */
export function shouldUpdateColumn(columnName: string): boolean {
  const columnNameLower = columnName.toLowerCase()
  
  // Always update these columns
  const alwaysUpdate = [
    'wins', 'losses', 'points', 'points scored', 'points taken', 
    'score', 'goal', 'point'
  ]
  
  return alwaysUpdate.some(keyword => columnNameLower.includes(keyword))
}

/**
 * Calculate session points based on match outcome
 * @param player1Score - Player 1's match score
 * @param player2Score - Player 2's match score
 * @param winPoints - Points for winning
 * @param lossPoints - Points for losing
 * @param drawPoints - Points for drawing
 * @returns Points for each player
 */
export function calculateMatchPoints(
  player1Score: number,
  player2Score: number,
  winPoints: number,
  lossPoints: number,
  drawPoints: number
) {
  if (player1Score > player2Score) {
    return { 
      player1Points: winPoints, 
      player2Points: lossPoints, 
      winnerId: 'player1',
      player1Wins: 1,
      player2Wins: 0,
      player1Losses: 0,
      player2Losses: 1
    }
  } else if (player1Score < player2Score) {
    return { 
      player1Points: lossPoints, 
      player2Points: winPoints, 
      winnerId: 'player2',
      player1Wins: 0,
      player2Wins: 1,
      player1Losses: 1,
      player2Losses: 0
    }
  } else {
    return { 
      player1Points: drawPoints, 
      player2Points: drawPoints, 
      winnerId: null,
      player1Wins: 0,
      player2Wins: 0,
      player1Losses: 0,
      player2Losses: 0
    }
  }
}
