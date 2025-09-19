/**
 * Database client configuration and core utilities
 * Provides Prisma client instance and essential database operations
 */

import { PrismaClient } from '@prisma/client'

/**
 * Global Prisma client type for development hot reloading
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

/**
 * Singleton Prisma client instance
 * Prevents multiple instances in development due to hot reloading
 */
export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error'] : ['error'],
})

// Store Prisma instance globally in development
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

/**
 * Standard include configuration for board queries
 * Ensures consistent data structure across all board fetches
 */
export const BOARD_INCLUDE = {
  participants: true,
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
} as const

/**
 * Get a board by ID with all related data
 * @param id - Board ID
 * @returns Board with all related data or null if not found
 */
export async function getBoard(id: string) {
  return await prisma.board.findUnique({
    where: { id },
    include: BOARD_INCLUDE,
  })
}

/**
 * Standard include configuration for board list queries
 * Lighter data for listing multiple boards
 */
export const BOARD_LIST_INCLUDE = {
  participants: { take: 5 },
  scores: { take: 10 },
} as const

/**
 * Get all boards with basic information
 * @returns Array of boards with limited related data for performance
 */
export async function getBoards() {
  return await prisma.board.findMany({
    include: BOARD_LIST_INCLUDE,
    orderBy: { updatedAt: 'desc' },
  })
}

/**
 * Create a new board
 * @param data - Board creation data
 * @returns Created board with related data
 */
export async function createBoard(data: { name: string; type: 'LEADERBOARD' | 'MULTISCORE' }) {
  return await prisma.board.create({
    data,
    include: {
      participants: true,
      columns: true,
      scores: true,
    },
  })
}

/**
 * Update an existing board
 * @param id - Board ID
 * @param data - Board update data
 * @returns Updated board with related data
 */
export async function updateBoard(id: string, data: { name?: string }) {
  return await prisma.board.update({
    where: { id },
    data,
    include: {
      participants: true,
      columns: true,
      scores: true,
    },
  })
}

/**
 * Delete a board and all related data
 * @param id - Board ID
 * @returns Deleted board
 */
export async function deleteBoard(id: string) {
  return await prisma.board.delete({
    where: { id },
  })
}

/**
 * Add a participant to a board
 * @param data - Participant creation data
 * @returns Created participant with scores
 */
export async function addParticipant(data: { name: string; boardId: string }) {
  return await prisma.participant.create({
    data,
    include: {
      scores: true,
    },
  })
}

/**
 * Remove a participant from a board
 * @param id - Participant ID
 * @returns Deleted participant
 */
export async function removeParticipant(id: string) {
  return await prisma.participant.delete({
    where: { id },
  })
}

/**
 * Update or create a score (increment existing or create new)
 * @param data - Score data including value to add
 * @returns Updated or created score with related data
 */
export async function updateScore(data: {
  value: number
  participantId: string
  columnId?: string
  boardId: string
}) {
  // Find existing score or create new one
  const existingScore = await prisma.score.findFirst({
    where: {
      participantId: data.participantId,
      columnId: data.columnId,
      boardId: data.boardId,
    },
  })

  if (existingScore) {
    return await prisma.score.update({
      where: { id: existingScore.id },
      data: { value: existingScore.value + data.value },
      include: {
        participant: true,
        column: true,
      },
    })
  } else {
    return await prisma.score.create({
      data,
      include: {
        participant: true,
        column: true,
      },
    })
  }
}

/**
 * Add a column to a board
 * @param data - Column creation data
 * @returns Created column
 */
export async function addColumn(data: {
  name: string
  type: 'NUMBER' | 'TEXT' | 'DATE' | 'BOOLEAN'
  order: number
  boardId: string
}) {
  return await prisma.column.create({
    data,
  })
}

/**
 * Remove a column from a board
 * @param id - Column ID
 * @returns Deleted column
 */
export async function removeColumn(id: string) {
  return await prisma.column.delete({
    where: { id },
  })
}

/**
 * Add a history entry to track board changes
 * @param data - History entry data
 * @returns Created history entry
 */
export async function addHistory(data: {
  action: string
  details: any
  boardId: string
}) {
  return await prisma.history.create({
    data,
  })
}

/**
 * Calculate participant ranks based on scores (simple ranking)
 * @param scores - Array of participant scores
 * @returns Ranked scores with rank positions
 * @deprecated Use the scoring utilities from lib/utils/scoring instead
 */
export function calculateRanks(scores: Array<{ participantId: string; value: number }>) {
  const sortedScores = [...scores].sort((a, b) => b.value - a.value)
  
  return sortedScores.map((score, index) => ({
    participantId: score.participantId,
    rank: index + 1,
    value: score.value,
  }))
}

/**
 * Generate board URLs for sharing
 * @param boardId - Board ID
 * @returns Object with public and admin URLs
 * @deprecated Use generateBoardUrl from lib/utils/url instead
 */
export function getBoardUrls(boardId: string) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  
  return {
    publicUrl: `${baseUrl}/boards/${boardId}`,
    adminUrl: `${baseUrl}/boards/${boardId}/admin`,
  }
}
