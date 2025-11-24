/**
 * Tournament match scheduling utilities
 * Functions for generating round-robin schedules
 */

/**
 * Match pair interface
 */
export interface MatchPair {
  player1Id: string
  player2Id: string
}

/**
 * Generates a round-robin schedule for a group of participants
 * Each participant plays every other participant exactly once
 * @param participantIds - Array of participant IDs in the group
 * @returns Array of match pairs
 */
export function generateRoundRobinSchedule(
  participantIds: string[]
): MatchPair[] {
  if (participantIds.length < 2) {
    return []
  }

  const matches: MatchPair[] = []
  const participants = [...participantIds]

  // Generate all unique pairs
  for (let i = 0; i < participants.length; i++) {
    for (let j = i + 1; j < participants.length; j++) {
      matches.push({
        player1Id: participants[i],
        player2Id: participants[j],
      })
    }
  }

  return matches
}

/**
 * Generates round-robin schedules for multiple groups
 * @param groups - Array of groups with id and participantIds
 * @returns Array of group schedules with groupId and matches
 */
export function generateGroupSchedules(
  groups: Array<{ id: string; participantIds: string[] }>
): Array<{ groupId: string; matches: MatchPair[] }> {
  return groups.map((group) => ({
    groupId: group.id,
    matches: generateRoundRobinSchedule(group.participantIds),
  }))
}

