/**
 * Tournament group drawing utilities
 * Functions for randomly assigning participants to groups
 */

/**
 * Validates that the sum of group sizes matches the participant count
 * @param participantCount - Total number of participants
 * @param groupSizes - Array of group sizes
 * @returns True if the sum of group sizes equals participant count
 */
export function validateGroupSizes(
  participantCount: number,
  groupSizes: number[]
): boolean {
  const totalGroupSize = groupSizes.reduce((sum, size) => sum + size, 0)
  return totalGroupSize === participantCount
}

/**
 * Randomly draws participants into groups using Fisher-Yates shuffle
 * @param participants - Array of participant IDs
 * @param groupSizes - Array of group sizes (e.g., [6, 5] for two groups)
 * @returns Map of participantId -> groupIndex (0-based)
 */
export function drawGroups(
  participants: string[],
  groupSizes: number[]
): Map<string, number> {
  // Validate input
  if (participants.length === 0) {
    throw new Error('No participants provided')
  }
  
  if (groupSizes.length === 0) {
    throw new Error('No group sizes provided')
  }
  
  if (!validateGroupSizes(participants.length, groupSizes)) {
    throw new Error(
      `Participant count (${participants.length}) does not match sum of group sizes (${groupSizes.reduce((a, b) => a + b, 0)})`
    )
  }

  // Create a shuffled copy of participants using Fisher-Yates shuffle
  const shuffled = [...participants]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }

  // Assign participants to groups
  const assignment = new Map<string, number>()
  let participantIndex = 0

  for (let groupIndex = 0; groupIndex < groupSizes.length; groupIndex++) {
    const groupSize = groupSizes[groupIndex]
    for (let i = 0; i < groupSize; i++) {
      assignment.set(shuffled[participantIndex], groupIndex)
      participantIndex++
    }
  }

  return assignment
}

