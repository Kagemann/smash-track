/**
 * Data manipulation utilities
 * Functions for working with arrays, objects, and data transformations
 */

import type { Board, Participant, Score, Column } from '@/types'

/**
 * Board type utility functions
 */
export const BoardType = {
  isLeaderboard: (board: Board): boolean => board.type === 'LEADERBOARD',
  isMultiscore: (board: Board): boolean => board.type === 'MULTISCORE',
} as const

/**
 * Find functions for common data lookups
 */
export const find = {
  /**
   * Find a column by its ID
   * @param columns - Array of columns
   * @param id - Column ID to find
   * @returns Column or undefined
   */
  columnById: (columns: Column[], id: string): Column | undefined => {
    return columns.find(column => column.id === id)
  },

  /**
   * Find a column by its order position
   * @param columns - Array of columns
   * @param order - Order position to find
   * @returns Column or undefined
   */
  columnByOrder: (columns: Column[], order: number): Column | undefined => {
    return columns.find(column => column.order === order)
  },

  /**
   * Find a participant by their ID
   * @param participants - Array of participants
   * @param id - Participant ID to find
   * @returns Participant or undefined
   */
  participantById: (participants: Participant[], id: string): Participant | undefined => {
    return participants.find(participant => participant.id === id)
  },

  /**
   * Find a participant by their name (case-insensitive)
   * @param participants - Array of participants
   * @param name - Participant name to find
   * @returns Participant or undefined
   */
  participantByName: (participants: Participant[], name: string): Participant | undefined => {
    const lowercaseName = name.toLowerCase()
    return participants.find(participant => participant.name.toLowerCase() === lowercaseName)
  },
} as const

/**
 * Filter functions for getting subsets of data
 */
export const filter = {
  /**
   * Get all scores for a specific participant
   * @param scores - Array of all scores
   * @param participantId - Participant ID to filter by
   * @returns Array of scores for the participant
   */
  scoresByParticipant: (scores: Score[], participantId: string): Score[] => {
    return scores.filter(score => score.participantId === participantId)
  },

  /**
   * Get score for a specific participant and column
   * @param scores - Array of all scores
   * @param participantId - Participant ID
   * @param columnId - Column ID (optional for leaderboard)
   * @returns Score or undefined
   */
  scoreByParticipantAndColumn: (
    scores: Score[], 
    participantId: string, 
    columnId?: string
  ): Score | undefined => {
    return scores.find(score => 
      score.participantId === participantId && 
      score.columnId === columnId
    )
  },

  /**
   * Get all scores for a specific column
   * @param scores - Array of all scores
   * @param columnId - Column ID to filter by
   * @returns Array of scores for the column
   */
  scoresByColumn: (scores: Score[], columnId: string): Score[] => {
    return scores.filter(score => score.columnId === columnId)
  },
} as const

/**
 * Sort functions for ordering data
 */
export const sort = {
  /**
   * Sort columns by their order property
   * @param columns - Array of columns to sort
   * @returns Sorted array of columns
   */
  columnsByOrder: (columns: Column[]): Column[] => {
    return [...columns].sort((a, b) => a.order - b.order)
  },

  /**
   * Sort participants by name (alphabetical)
   * @param participants - Array of participants to sort
   * @returns Sorted array of participants
   */
  participantsByName: (participants: Participant[]): Participant[] => {
    return [...participants].sort((a, b) => a.name.localeCompare(b.name))
  },

  /**
   * Sort boards by updated date (most recent first)
   * @param boards - Array of boards to sort
   * @returns Sorted array of boards
   */
  boardsByUpdated: (boards: Board[]): Board[] => {
    return [...boards].sort((a, b) => 
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    )
  },
} as const

/**
 * Transform functions for data manipulation
 */
export const transform = {
  /**
   * Reorder columns based on drag and drop
   * @param columns - Array of columns
   * @param fromIndex - Source index
   * @param toIndex - Target index
   * @returns Reordered columns with updated order values
   */
  reorderColumns: (columns: Column[], fromIndex: number, toIndex: number): Column[] => {
    const result = [...columns]
    const [removed] = result.splice(fromIndex, 1)
    result.splice(toIndex, 0, removed)
    
    // Update order values
    return result.map((column, index) => ({
      ...column,
      order: index,
    }))
  },

  /**
   * Group scores by participant ID
   * @param scores - Array of scores
   * @returns Object with participant IDs as keys and score arrays as values
   */
  groupScoresByParticipant: (scores: Score[]): Record<string, Score[]> => {
    return scores.reduce((acc, score) => {
      const participantId = score.participantId
      if (!acc[participantId]) {
        acc[participantId] = []
      }
      acc[participantId].push(score)
      return acc
    }, {} as Record<string, Score[]>)
  },

  /**
   * Create a lookup map of participants by ID
   * @param participants - Array of participants
   * @returns Object with participant IDs as keys and participant objects as values
   */
  participantLookupMap: (participants: Participant[]): Record<string, Participant> => {
    return participants.reduce((acc, participant) => {
      acc[participant.id] = participant
      return acc
    }, {} as Record<string, Participant>)
  },
} as const

/**
 * Aggregate functions for calculating totals and summaries
 */
export const aggregate = {
  /**
   * Calculate total score for a participant across all columns
   * @param scores - Array of all scores
   * @param participantId - Participant ID
   * @returns Total score
   */
  totalScoreForParticipant: (scores: Score[], participantId: string): number => {
    return filter.scoresByParticipant(scores, participantId)
      .reduce((sum, score) => sum + score.value, 0)
  },

  /**
   * Calculate total participants across all boards
   * @param boards - Array of boards
   * @returns Total number of participants
   */
  totalParticipants: (boards: Board[]): number => {
    return boards.reduce((sum, board) => sum + (board.participants?.length || 0), 0)
  },

  /**
   * Get boards by type with counts
   * @param boards - Array of boards
   * @returns Object with counts by type
   */
  boardsByType: (boards: Board[]): { leaderboards: number; multiscore: number; total: number } => {
    const leaderboards = boards.filter(BoardType.isLeaderboard).length
    const multiscore = boards.filter(BoardType.isMultiscore).length
    return { leaderboards, multiscore, total: boards.length }
  },
} as const
