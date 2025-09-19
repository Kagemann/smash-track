/**
 * History service layer
 * Contains business logic for history and audit trail operations
 */

import { prisma } from '@/lib/db'
import { History, HistoryAction } from '@/lib/types'
import { DATABASE_CONFIG } from '@/lib/constants'

export interface HistoryEntryData {
  action: HistoryAction
  details: Record<string, any>
  boardId: string
}

export class HistoryService {
  /**
   * Adds a new history entry
   */
  async addHistoryEntry(data: HistoryEntryData): Promise<History> {
    return await prisma.history.create({
      data: {
        action: data.action,
        details: data.details,
        boardId: data.boardId,
      },
    })
  }

  /**
   * Gets history entries for a board
   */
  async getBoardHistory(
    boardId: string,
    limit = DATABASE_CONFIG.MAX_HISTORY_ENTRIES
  ): Promise<History[]> {
    return await prisma.history.findMany({
      where: { boardId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    })
  }

  /**
   * Gets recent history entries across all boards
   */
  async getRecentHistory(limit = 20): Promise<(History & { board: { name: string } })[]> {
    return await prisma.history.findMany({
      include: {
        board: {
          select: {
            name: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    })
  }

  /**
   * Cleans up old history entries for a board
   */
  async cleanupOldHistory(
    boardId: string,
    keepCount = DATABASE_CONFIG.MAX_HISTORY_ENTRIES
  ): Promise<number> {
    // Get the IDs of entries to keep (most recent)
    const entriesToKeep = await prisma.history.findMany({
      where: { boardId },
      select: { id: true },
      orderBy: { createdAt: 'desc' },
      take: keepCount,
    })

    const keepIds = entriesToKeep.map(entry => entry.id)

    if (keepIds.length === 0) {
      return 0
    }

    // Delete entries that are not in the keep list
    const result = await prisma.history.deleteMany({
      where: {
        boardId,
        id: {
          notIn: keepIds,
        },
      },
    })

    return result.count
  }

  /**
   * Gets history statistics for a board
   */
  async getHistoryStats(boardId: string): Promise<{
    totalEntries: number
    entriesByAction: Record<string, number>
    oldestEntry: Date | null
    newestEntry: Date | null
  }> {
    // Get total count
    const totalEntries = await prisma.history.count({
      where: { boardId },
    })

    // Get entries grouped by action
    const entriesByAction = await prisma.history.groupBy({
      by: ['action'],
      where: { boardId },
      _count: true,
    })

    // Get oldest and newest entries
    const [oldestEntry, newestEntry] = await Promise.all([
      prisma.history.findFirst({
        where: { boardId },
        orderBy: { createdAt: 'asc' },
        select: { createdAt: true },
      }),
      prisma.history.findFirst({
        where: { boardId },
        orderBy: { createdAt: 'desc' },
        select: { createdAt: true },
      }),
    ])

    const actionCounts: Record<string, number> = {}
    entriesByAction.forEach(entry => {
      actionCounts[entry.action] = entry._count
    })

    return {
      totalEntries,
      entriesByAction: actionCounts,
      oldestEntry: oldestEntry?.createdAt || null,
      newestEntry: newestEntry?.createdAt || null,
    }
  }

  /**
   * Searches history entries by action type
   */
  async searchHistoryByAction(
    boardId: string,
    action: HistoryAction,
    limit = 50
  ): Promise<History[]> {
    return await prisma.history.findMany({
      where: {
        boardId,
        action,
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    })
  }

  /**
   * Deletes all history for a board
   */
  async deleteAllBoardHistory(boardId: string): Promise<number> {
    const result = await prisma.history.deleteMany({
      where: { boardId },
    })

    return result.count
  }

  /**
   * Creates a formatted history message
   */
  formatHistoryMessage(entry: History): string {
    const details = entry.details as any
    
    switch (entry.action) {
      case 'score_update':
        return `Score updated for ${details.participantName}: ${details.oldValue} → ${details.newValue}`
      
      case 'participant_added':
        return `Participant "${details.participantName}" added to the board`
      
      case 'participant_removed':
        return `Participant "${details.participantName}" removed from the board`
      
      case 'board_updated':
        return `Board "${details.boardName}" was updated`
      
      case 'board_created':
        return `Board "${details.boardName}" was created with ${details.participantCount} participants`
      
      case 'column_added':
        return `Column "${details.columnName}" added to the board`
      
      case 'column_removed':
        return `Column "${details.columnName}" removed from the board`
      
      case 'session_created':
        return `Session "${details.sessionName}" created`
      
      case 'match_created':
        return `Match created: ${details.player1Name} vs ${details.player2Name}`
      
      case 'match_completed':
        return `Match completed: ${details.player1Name} vs ${details.player2Name} (${details.score})`
      
      default:
        return `Action: ${entry.action}`
    }
  }

  /**
   * Gets history entries for a specific participant
   */
  async getParticipantHistory(
    boardId: string,
    participantId: string,
    limit = 20
  ): Promise<History[]> {
    return await prisma.history.findMany({
      where: {
        boardId,
        OR: [
          {
            details: {
              path: ['participantId'],
              equals: participantId,
            },
          },
          {
            details: {
              path: ['player1Id'],
              equals: participantId,
            },
          },
          {
            details: {
              path: ['player2Id'],
              equals: participantId,
            },
          },
        ],
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    })
  }

  /**
   * Bulk creates history entries
   */
  async createMultipleHistoryEntries(entries: HistoryEntryData[]): Promise<void> {
    await prisma.history.createMany({
      data: entries.map(entry => ({
        action: entry.action,
        details: entry.details,
        boardId: entry.boardId,
      })),
    })
  }

  /**
   * Gets history entries within a date range
   */
  async getHistoryByDateRange(
    boardId: string,
    startDate: Date,
    endDate: Date
  ): Promise<History[]> {
    return await prisma.history.findMany({
      where: {
        boardId,
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { createdAt: 'desc' },
    })
  }
}