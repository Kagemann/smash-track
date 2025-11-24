/**
 * Tournament ranking utilities
 * Functions for calculating group standings and rankings
 */

import type { Match, Participant } from '@/types'
import type { GroupStanding } from '@/types'
import { calculateMatchPoints } from '../session'

/**
 * Calculates head-to-head record between two participants
 * @param participant1Id - First participant ID
 * @param participant2Id - Second participant ID
 * @param matches - All matches involving these participants
 * @returns Head-to-head record
 */
export function calculateHeadToHead(
  participant1Id: string,
  participant2Id: string,
  matches: Match[]
): { participant1Wins: number; participant2Wins: number } {
  const headToHeadMatches = matches.filter(
    (match) =>
      (match.player1Id === participant1Id && match.player2Id === participant2Id) ||
      (match.player1Id === participant2Id && match.player2Id === participant1Id)
  )

  let participant1Wins = 0
  let participant2Wins = 0

  for (const match of headToHeadMatches) {
    if (match.status !== 'COMPLETED') continue

    const isPlayer1 = match.player1Id === participant1Id
    if (match.player1Score > match.player2Score) {
      if (isPlayer1) participant1Wins++
      else participant2Wins++
    } else if (match.player1Score < match.player2Score) {
      if (isPlayer1) participant2Wins++
      else participant1Wins++
    }
    // Draws don't count for head-to-head
  }

  return { participant1Wins, participant2Wins }
}

/**
 * Compares two standings for sorting
 * Ranking criteria: Points → Goal Difference → Goals For → Head-to-Head
 * @param a - First standing
 * @param b - Second standing
 * @param matches - All matches for head-to-head comparison
 * @returns Comparison result (-1, 0, or 1)
 */
export function compareStandings(
  a: GroupStanding,
  b: GroupStanding,
  matches: Match[] = []
): number {
  // 1. Points (descending)
  if (a.points !== b.points) {
    return b.points - a.points
  }

  // 2. Goal difference (descending)
  if (a.goalDifference !== b.goalDifference) {
    return b.goalDifference - a.goalDifference
  }

  // 3. Goals for (descending)
  if (a.goalsFor !== b.goalsFor) {
    return b.goalsFor - a.goalsFor
  }

  // 4. Head-to-head (if applicable)
  if (matches.length > 0) {
    const h2h = calculateHeadToHead(a.participantId, b.participantId, matches)
    if (h2h.participant1Wins !== h2h.participant2Wins) {
      const aIsPlayer1 = a.participantId < b.participantId // Use ID comparison for consistency
      if (aIsPlayer1) {
        return h2h.participant2Wins - h2h.participant1Wins // Reverse because we want higher wins first
      } else {
        return h2h.participant1Wins - h2h.participant2Wins
      }
    }
  }

  // If all criteria are equal, maintain original order
  return 0
}

/**
 * Calculates group standings for all participants in a group
 * @param groupId - Group ID
 * @param matches - All completed matches for this group
 * @param participants - All participants in the group
 * @param winPoints - Points for a win (default: 3)
 * @param lossPoints - Points for a loss (default: 0)
 * @param drawPoints - Points for a draw (default: 1)
 * @returns Array of standings sorted by ranking
 */
export function calculateGroupRankings(
  groupId: string,
  matches: Array<Pick<Match, 'groupId' | 'status' | 'player1Id' | 'player2Id' | 'player1Score' | 'player2Score'>>,
  participants: Array<Pick<Participant, 'id' | 'name'>>,
  winPoints: number = 3,
  lossPoints: number = 0,
  drawPoints: number = 1
): GroupStanding[] {
  // Filter matches for this group and only completed ones
  const groupMatches = matches.filter(
    (match) => match.groupId === groupId && match.status === 'COMPLETED'
  )

  // Initialize standings for all participants
  const standingsMap = new Map<string, GroupStanding>()

  for (const participant of participants) {
    standingsMap.set(participant.id, {
      participantId: participant.id,
      participantName: participant.name,
      wins: 0,
      losses: 0,
      draws: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      goalDifference: 0,
      points: 0,
      rank: 0,
    })
  }

  // Calculate statistics from matches
  for (const match of groupMatches) {
    const player1Standing = standingsMap.get(match.player1Id)
    const player2Standing = standingsMap.get(match.player2Id)

    if (!player1Standing || !player2Standing) continue

    const { player1Points, player2Points, player1Wins, player2Wins, player1Losses, player2Losses } =
      calculateMatchPoints(
        match.player1Score,
        match.player2Score,
        winPoints,
        lossPoints,
        drawPoints
      )

    // Update player 1
    player1Standing.goalsFor += match.player1Score
    player1Standing.goalsAgainst += match.player2Score
    player1Standing.points += player1Points
    player1Standing.wins += player1Wins
    player1Standing.losses += player1Losses
    if (player1Points === drawPoints && player1Wins === 0 && player1Losses === 0) {
      player1Standing.draws += 1
    }

    // Update player 2
    player2Standing.goalsFor += match.player2Score
    player2Standing.goalsAgainst += match.player1Score
    player2Standing.points += player2Points
    player2Standing.wins += player2Wins
    player2Standing.losses += player2Losses
    if (player2Points === drawPoints && player2Wins === 0 && player2Losses === 0) {
      player2Standing.draws += 1
    }
  }

  // Calculate goal differences
  for (const standing of standingsMap.values()) {
    standing.goalDifference = standing.goalsFor - standing.goalsAgainst
  }

  // Convert to array and sort
  const standings = Array.from(standingsMap.values())

  // Sort by ranking criteria
  standings.sort((a, b) => compareStandings(a, b, groupMatches as Match[]))

  // Assign ranks (handle ties)
  let currentRank = 1
  for (let i = 0; i < standings.length; i++) {
    if (i > 0) {
      const prev = standings[i - 1]
      const curr = standings[i]

      // Only increment rank if standings are different
      if (
        prev.points !== curr.points ||
        prev.goalDifference !== curr.goalDifference ||
        prev.goalsFor !== curr.goalsFor
      ) {
        currentRank = i + 1
      }
    }
    standings[i].rank = currentRank
  }

  return standings
}

