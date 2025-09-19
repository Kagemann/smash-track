/**
 * Score calculation and ranking utilities
 * Functions for calculating rankings, handling ties, and score validation
 */

import type { Board, Participant, Score } from '@/types'

/**
 * Participant with calculated rank information
 */
interface RankedParticipant {
  participantId: string
  participantName: string
  totalScore: number
  scores: Score[]
  rank: number
  isTied: boolean
}

/**
 * Calculate ranks for participants based on their scores
 * @param scores - Array of all scores
 * @param participants - Array of participants
 * @returns Array of participants with rank information
 */
export function calculateRanks(scores: Score[], participants: Participant[]): RankedParticipant[] {
  // Group scores by participant
  const participantScores = participants.map(participant => {
    const participantScores = scores.filter(score => score.participantId === participant.id)
    const totalScore = participantScores.reduce((sum, score) => sum + score.value, 0)
    return {
      participantId: participant.id,
      participantName: participant.name,
      totalScore,
      scores: participantScores,
    }
  })

  // Sort by total score (descending)
  const sortedScores = participantScores.sort((a, b) => b.totalScore - a.totalScore)

  // Assign ranks (handle ties)
  let currentRank = 1
  return sortedScores.map((score, index) => {
    const previousScore = index > 0 ? sortedScores[index - 1].totalScore : null
    
    // Only increment rank if score is different from previous
    if (index > 0 && previousScore !== score.totalScore) {
      currentRank = index + 1
    }
    
    return {
      ...score,
      rank: currentRank,
      isTied: previousScore === score.totalScore,
    }
  })
}

/**
 * Validate a score value based on column type
 * @param value - The score value to validate
 * @param columnType - The type of column
 * @returns True if the score is valid for the column type
 */
export function validateScore(value: number, columnType?: string): boolean {
  switch (columnType) {
    case 'NUMBER':
      return !isNaN(value) && isFinite(value) && value >= 0
    case 'DATE':
      return !isNaN(value) && value > 0
    case 'BOOLEAN':
      return value === 0 || value === 1
    default:
      return true
  }
}

/**
 * Calculate win percentage for a participant
 * @param wins - Number of wins
 * @param losses - Number of losses
 * @returns Win percentage as decimal (0-1)
 */
export function calculateWinPercentage(wins: number, losses: number): number {
  const totalGames = wins + losses
  return totalGames > 0 ? wins / totalGames : 0
}

/**
 * Calculate points based on session scoring rules
 * @param wins - Number of wins
 * @param losses - Number of losses 
 * @param draws - Number of draws
 * @param winPoints - Points per win
 * @param lossPoints - Points per loss
 * @param drawPoints - Points per draw
 * @returns Total points
 */
export function calculateSessionPoints(
  wins: number,
  losses: number,
  draws: number,
  winPoints: number,
  lossPoints: number,
  drawPoints: number
): number {
  return (wins * winPoints) + (losses * lossPoints) + (draws * drawPoints)
}

/**
 * Get the top N participants by score
 * @param rankedParticipants - Array of ranked participants
 * @param count - Number of top participants to return
 * @returns Top N participants
 */
export function getTopParticipants(rankedParticipants: RankedParticipant[], count: number): RankedParticipant[] {
  return rankedParticipants.slice(0, count)
}

/**
 * Calculate score statistics for a board
 * @param scores - Array of all scores
 * @returns Statistics object
 */
export function calculateScoreStatistics(scores: Score[]) {
  if (scores.length === 0) {
    return {
      total: 0,
      average: 0,
      highest: 0,
      lowest: 0,
      count: 0,
    }
  }

  const values = scores.map(score => score.value)
  const total = values.reduce((sum, value) => sum + value, 0)
  
  return {
    total,
    average: total / values.length,
    highest: Math.max(...values),
    lowest: Math.min(...values),
    count: values.length,
  }
}
