import { Board, Participant, Score, Column } from '@/types'

// URL generation utilities
export const generateBoardUrl = (id: string, type: 'public' | 'admin') => {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  return `${baseUrl}/boards/${id}${type === 'admin' ? '/admin' : ''}`
}

export const generateShareData = (board: Board) => {
  return {
    publicUrl: generateBoardUrl(board.id, 'public'),
    adminUrl: generateBoardUrl(board.id, 'admin'),
    boardName: board.name,
  }
}

// Score calculation utilities
export const calculateRanks = (scores: Score[], participants: Participant[]) => {
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
  return sortedScores.map((score, index) => {
    const rank = index + 1
    const previousScore = index > 0 ? sortedScores[index - 1].totalScore : null
    
    return {
      ...score,
      rank: previousScore === score.totalScore ? index : rank,
      isTied: previousScore === score.totalScore,
    }
  })
}

// Score formatting utilities
export const formatScore = (value: number, columnType?: string) => {
  switch (columnType) {
    case 'NUMBER':
      return value.toLocaleString()
    case 'DATE':
      return new Date(value).toLocaleDateString()
    case 'BOOLEAN':
      return value ? 'Yes' : 'No'
    default:
      return value.toString()
  }
}

export const formatTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

// Validation utilities
export const validateScore = (value: number, columnType?: string) => {
  switch (columnType) {
    case 'NUMBER':
      return !isNaN(value) && isFinite(value)
    case 'DATE':
      return !isNaN(value) && value > 0
    case 'BOOLEAN':
      return value === 0 || value === 1
    default:
      return true
  }
}

// Board type utilities
export const isLeaderboard = (board: Board) => board.type === 'LEADERBOARD'
export const isMultiscore = (board: Board) => board.type === 'MULTISCORE'

// Column utilities
export const getColumnById = (columns: Column[], id: string) => {
  return columns.find(column => column.id === id)
}

export const getColumnByOrder = (columns: Column[], order: number) => {
  return columns.find(column => column.order === order)
}

export const reorderColumns = (columns: Column[], fromIndex: number, toIndex: number) => {
  const result = [...columns]
  const [removed] = result.splice(fromIndex, 1)
  result.splice(toIndex, 0, removed)
  
  // Update order values
  return result.map((column, index) => ({
    ...column,
    order: index,
  }))
}

// Participant utilities
export const getParticipantById = (participants: Participant[], id: string) => {
  return participants.find(participant => participant.id === id)
}

export const getParticipantScores = (scores: Score[], participantId: string) => {
  return scores.filter(score => score.participantId === participantId)
}

export const getParticipantScoreForColumn = (
  scores: Score[], 
  participantId: string, 
  columnId?: string
) => {
  return scores.find(score => 
    score.participantId === participantId && 
    score.columnId === columnId
  )
}

// History utilities
export const formatHistoryAction = (action: string) => {
  return action
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

export const getHistoryIcon = (action: string) => {
  switch (action) {
    case 'score_update':
      return '📊'
    case 'participant_added':
      return '👤'
    case 'participant_removed':
      return '❌'
    case 'board_updated':
      return '✏️'
    case 'column_added':
      return '📋'
    case 'column_removed':
      return '🗑️'
    default:
      return '📝'
  }
}

// Real-time utilities
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

// Keyboard utilities
export const handleKeyboardScoreUpdate = (
  event: KeyboardEvent,
  currentValue: number,
  onUpdate: (value: number) => void
) => {
  switch (event.key) {
    case '+':
    case '=':
      event.preventDefault()
      onUpdate(currentValue + 1)
      break
    case '-':
      event.preventDefault()
      onUpdate(Math.max(0, currentValue - 1))
      break
    case 'ArrowUp':
      event.preventDefault()
      onUpdate(currentValue + 1)
      break
    case 'ArrowDown':
      event.preventDefault()
      onUpdate(Math.max(0, currentValue - 1))
      break
  }
}

// Mobile utilities
export const isMobile = () => {
  if (typeof window === 'undefined') return false
  return window.innerWidth < 768
}

export const isTouchDevice = () => {
  if (typeof window === 'undefined') return false
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0
}

/**
 * Ensures a board has the necessary default columns for session scoring
 * Creates Wins, Losses, and Points columns if they don't exist
 */
export async function ensureDefaultColumns(boardId: string) {
  const { prisma } = await import('@/lib/db')
  
  const board = await prisma.board.findUnique({
    where: { id: boardId },
    include: { columns: true }
  })

  if (!board) {
    throw new Error('Board not found')
  }

  const defaultColumns = [
    { name: 'Wins', type: 'NUMBER' as const, order: 1 },
    { name: 'Losses', type: 'NUMBER' as const, order: 2 },
    { name: 'Points', type: 'NUMBER' as const, order: 3 },
  ]

  const existingColumnNames = board.columns.map(col => col.name)
  const missingColumns = defaultColumns.filter(col => !existingColumnNames.includes(col.name))

  if (missingColumns.length > 0) {
    await prisma.column.createMany({
      data: missingColumns.map(col => ({
        ...col,
        boardId
      }))
    })
  }

  // Return the updated board with all columns
  return await prisma.board.findUnique({
    where: { id: boardId },
    include: { columns: true }
  })
}

/**
 * Gets the column ID for a specific column name on a board
 */
export async function getColumnId(boardId: string, columnName: string) {
  const { prisma } = await import('@/lib/db')
  
  const column = await prisma.column.findFirst({
    where: {
      boardId,
      name: columnName
    }
  })

  return column?.id
}

/**
 * Determines how a column should be updated based on match results
 */
export function getColumnUpdateValue(columnName: string, player1Score: number, player2Score: number, isPlayer1: boolean) {
  const columnNameLower = columnName.toLowerCase()
  const playerScore = isPlayer1 ? player1Score : player2Score
  const opponentScore = isPlayer1 ? player2Score : player1Score

  // Default session columns
  if (columnName === 'Wins') {
    return playerScore > opponentScore ? 1 : 0
  }
  if (columnName === 'Losses') {
    return playerScore < opponentScore ? 1 : 0
  }
  if (columnName === 'Points') {
    // This will be calculated by the session scoring system
    return 0 // Placeholder, actual points calculated elsewhere
  }

  // Custom columns based on naming patterns
  if (columnNameLower.includes('score') || columnNameLower.includes('goal') || columnNameLower.includes('point')) {
    return playerScore
  }
  
  if (columnNameLower.includes('conceded') || columnNameLower.includes('against')) {
    return opponentScore
  }
  
  if (columnNameLower.includes('difference') || columnNameLower.includes('diff')) {
    return playerScore - opponentScore
  }

  // Default: return the player's score for any other column
  return playerScore
}

/**
 * Checks if a column should be updated based on match results
 */
export function shouldUpdateColumn(columnName: string) {
  const columnNameLower = columnName.toLowerCase()
  
  // Always update these columns
  const alwaysUpdate = ['wins', 'losses', 'points', 'score', 'goal', 'point']
  
  return alwaysUpdate.some(keyword => columnNameLower.includes(keyword))
}
