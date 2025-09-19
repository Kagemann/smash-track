/**
 * Board service layer
 * Contains business logic for board operations
 */

import { prisma } from '@/lib/db'
import { 
  Board, 
  CreateBoardInput, 
  UpdateBoardInput,
  BoardType,
  HistoryAction 
} from '@/lib/types'
import { getBoardUrls } from '@/lib/api/urls'
import { DATABASE_CONFIG } from '@/lib/constants'
import { HistoryService } from './history.service'

export class BoardService {
  private historyService = new HistoryService()

  /**
   * Retrieves all boards with basic participant and score information
   */
  async getAllBoards(): Promise<Board[]> {
    return await prisma.board.findMany({
      include: {
        participants: { 
          take: 5,
          orderBy: { createdAt: 'desc' }
        },
        scores: { 
          take: 10,
          orderBy: { updatedAt: 'desc' }
        },
        _count: {
          select: {
            participants: true,
            scores: true,
            sessions: true,
          }
        }
      },
      orderBy: { updatedAt: 'desc' },
    })
  }

  /**
   * Retrieves a single board with full details
   */
  async getBoardById(id: string): Promise<Board | null> {
    return await prisma.board.findUnique({
      where: { id },
      include: {
        participants: {
          include: {
            scores: {
              include: {
                column: true,
              },
            },
          },
        },
        columns: { 
          orderBy: { order: 'asc' } 
        },
        scores: {
          include: {
            participant: true,
            column: true,
          },
          orderBy: { updatedAt: 'desc' },
        },
        history: { 
          orderBy: { createdAt: 'desc' }, 
          take: DATABASE_CONFIG.MAX_HISTORY_ENTRIES 
        },
        sessions: {
          include: {
            matches: {
              include: {
                player1: true,
                player2: true,
              },
            },
            _count: {
              select: {
                matches: true,
              }
            }
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    })
  }

  /**
   * Creates a new board with participants and columns
   */
  async createBoard(data: CreateBoardInput): Promise<Board> {
    const board = await prisma.board.create({
      data: {
        name: data.name.trim(),
        type: data.type,
        participants: {
          create: data.participants.map(name => ({
            name: name.trim()
          }))
        },
        columns: {
          create: data.columns.map((column, index) => ({
            name: column.name.trim(),
            type: this.mapColumnType(column.type),
            order: index
          }))
        }
      },
      include: {
        participants: true,
        columns: { orderBy: { order: 'asc' } },
        scores: true,
        history: { orderBy: { createdAt: 'desc' }, take: 10 },
        sessions: true,
      },
    })

    // Add creation to history
    await this.historyService.addHistoryEntry({
      action: 'board_created',
      details: {
        boardName: board.name,
        boardType: board.type,
        participantCount: data.participants.length,
        columnCount: data.columns.length,
      },
      boardId: board.id,
    })

    return board
  }

  /**
   * Updates an existing board
   */
  async updateBoard(id: string, data: UpdateBoardInput): Promise<Board> {
    const board = await prisma.board.update({
      where: { id },
      data: {
        name: data.name?.trim(),
      },
      include: {
        participants: true,
        columns: { orderBy: { order: 'asc' } },
        scores: true,
        history: { orderBy: { createdAt: 'desc' }, take: 10 },
        sessions: true,
      },
    })

    // Add update to history
    if (data.name) {
      await this.historyService.addHistoryEntry({
        action: 'board_updated',
        details: {
          boardName: board.name,
          updatedFields: Object.keys(data),
        },
        boardId: board.id,
      })
    }

    return board
  }

  /**
   * Deletes a board and all related data
   */
  async deleteBoard(id: string): Promise<void> {
    // Verify board exists
    const existingBoard = await prisma.board.findUnique({
      where: { id },
    })

    if (!existingBoard) {
      throw new Error('Board not found')
    }

    // Delete board (cascade will handle related records)
    await prisma.board.delete({
      where: { id },
    })
  }

  /**
   * Checks if a board exists
   */
  async boardExists(id: string): Promise<boolean> {
    const count = await prisma.board.count({
      where: { id },
    })
    
    return count > 0
  }

  /**
   * Gets board statistics
   */
  async getBoardStats(id: string): Promise<{
    participantCount: number
    scoreCount: number
    sessionCount: number
    lastActivity: Date | null
  }> {
    const stats = await prisma.board.findUnique({
      where: { id },
      select: {
        updatedAt: true,
        _count: {
          select: {
            participants: true,
            scores: true,
            sessions: true,
          }
        }
      }
    })

    if (!stats) {
      throw new Error('Board not found')
    }

    return {
      participantCount: stats._count.participants,
      scoreCount: stats._count.scores,
      sessionCount: stats._count.sessions,
      lastActivity: stats.updatedAt,
    }
  }

  /**
   * Gets board with share URLs
   */
  async getBoardWithUrls(id: string): Promise<Board & { publicUrl: string; adminUrl: string }> {
    const board = await this.getBoardById(id)
    
    if (!board) {
      throw new Error('Board not found')
    }

    const urls = getBoardUrls(board.id)
    
    return {
      ...board,
      publicUrl: urls.publicUrl,
      adminUrl: urls.adminUrl,
    }
  }

  /**
   * Search boards by name
   */
  async searchBoards(query: string, limit = 10): Promise<Board[]> {
    return await prisma.board.findMany({
      where: {
        name: {
          contains: query,
          mode: 'insensitive',
        },
      },
      include: {
        participants: { take: 3 },
        _count: {
          select: {
            participants: true,
            scores: true,
            sessions: true,
          }
        }
      },
      orderBy: { updatedAt: 'desc' },
      take: limit,
    })
  }

  /**
   * Gets recent boards (most recently updated)
   */
  async getRecentBoards(limit = 5): Promise<Board[]> {
    return await prisma.board.findMany({
      include: {
        participants: { take: 3 },
        _count: {
          select: {
            participants: true,
            scores: true,
          }
        }
      },
      orderBy: { updatedAt: 'desc' },
      take: limit,
    })
  }

  /**
   * Maps frontend column type to database column type
   */
  private mapColumnType(frontendType: 'number' | 'text' | 'time'): 'NUMBER' | 'TEXT' | 'DATE' | 'BOOLEAN' {
    switch (frontendType) {
      case 'number':
        return 'NUMBER'
      case 'text':
        return 'TEXT'
      case 'time':
        return 'DATE'
      default:
        return 'TEXT'
    }
  }

  /**
   * Updates board's last modified timestamp
   */
  async touchBoard(id: string): Promise<void> {
    await prisma.board.update({
      where: { id },
      data: {
        updatedAt: new Date(),
      },
    })
  }

  /**
   * Gets board type configuration
   */
  getBoardTypeConfig(type: BoardType) {
    switch (type) {
      case 'LEADERBOARD':
        return {
          allowMultipleColumns: false,
          defaultSorting: 'desc',
          allowRanking: true,
        }
      case 'MULTISCORE':
        return {
          allowMultipleColumns: true,
          defaultSorting: 'none',
          allowRanking: false,
        }
      default:
        throw new Error(`Unknown board type: ${type}`)
    }
  }
}