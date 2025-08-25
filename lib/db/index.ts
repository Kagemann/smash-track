import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// Database utility functions
export async function getBoard(id: string) {
  return await prisma.board.findUnique({
    where: { id },
    include: {
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
    },
  })
}

export async function getBoards() {
  return await prisma.board.findMany({
    include: {
      participants: { take: 5 },
      scores: { take: 10 },
    },
    orderBy: { updatedAt: 'desc' },
  })
}

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

export async function deleteBoard(id: string) {
  return await prisma.board.delete({
    where: { id },
  })
}

export async function addParticipant(data: { name: string; boardId: string }) {
  return await prisma.participant.create({
    data,
    include: {
      scores: true,
    },
  })
}

export async function removeParticipant(id: string) {
  return await prisma.participant.delete({
    where: { id },
  })
}

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
      data: { value: data.value },
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

export async function removeColumn(id: string) {
  return await prisma.column.delete({
    where: { id },
  })
}

export async function addHistory(data: {
  action: string
  details: any
  boardId: string
}) {
  return await prisma.history.create({
    data,
  })
}

// Helper function to calculate ranks for leaderboards
export function calculateRanks(scores: Array<{ participantId: string; value: number }>) {
  const sortedScores = [...scores].sort((a, b) => b.value - a.value)
  
  return sortedScores.map((score, index) => ({
    participantId: score.participantId,
    rank: index + 1,
    value: score.value,
  }))
}

// Helper function to get board URLs
export function getBoardUrls(boardId: string) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  
  return {
    publicUrl: `${baseUrl}/boards/${boardId}`,
    adminUrl: `${baseUrl}/boards/${boardId}/admin`,
  }
}
