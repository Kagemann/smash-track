/**
 * Tournament advancement utilities
 * Functions for determining knockout stage participants
 */

import type { Match } from '@/types'
import type { GroupStanding } from '@/types'

/**
 * Determines semifinal participants from group standings
 * Format: Group A 1st vs Group B 2nd, Group B 1st vs Group A 2nd
 * @param groups - Array of groups with standings
 * @returns Semifinal match pairings
 */
export function determineSemifinalParticipants(
  groups: Array<{ id: string; name: string; standings: GroupStanding[] }>
): {
  semifinal1: { player1Id: string; player2Id: string }
  semifinal2: { player1Id: string; player2Id: string }
} {
  if (groups.length !== 2) {
    throw new Error('Semifinals require exactly 2 groups')
  }

  const [groupA, groupB] = groups

  // Get top 2 from each group
  const groupA1st = groupA.standings.find((s) => s.rank === 1)
  const groupA2nd = groupA.standings.find((s) => s.rank === 2)
  const groupB1st = groupB.standings.find((s) => s.rank === 1)
  const groupB2nd = groupB.standings.find((s) => s.rank === 2)

  if (!groupA1st || !groupA2nd || !groupB1st || !groupB2nd) {
    throw new Error('Not enough participants in groups to advance to semifinals')
  }

  // Semifinal 1: Group A 1st vs Group B 2nd
  // Semifinal 2: Group B 1st vs Group A 2nd
  return {
    semifinal1: {
      player1Id: groupA1st.participantId,
      player2Id: groupB2nd.participantId,
    },
    semifinal2: {
      player1Id: groupB1st.participantId,
      player2Id: groupA2nd.participantId,
    },
  }
}

/**
 * Determines final participants from completed semifinal matches
 * @param semifinalResults - Array of completed semifinal matches (should be 2)
 * @returns Final match participants (winners of semifinals) or null if not ready
 */
export function determineFinalParticipants(
  semifinalResults: Array<Pick<Match, 'status' | 'winnerId'>>
): { player1Id: string; player2Id: string } | null {
  if (semifinalResults.length !== 2) {
    return null
  }

  // Check both matches are completed
  if (semifinalResults.some((match) => match.status !== 'COMPLETED')) {
    return null
  }

  // Get winners
  const winners: string[] = []
  for (const match of semifinalResults) {
    const winnerId = match.winnerId ?? undefined
    if (!winnerId) {
      return null // Draw in semifinal - shouldn't happen but handle it
    }
    winners.push(winnerId)
  }

  if (winners.length !== 2) {
    return null
  }

  return {
    player1Id: winners[0],
    player2Id: winners[1],
  }
}

