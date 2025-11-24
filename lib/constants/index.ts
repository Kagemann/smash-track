/**
 * Application constants
 * Centralized constants for consistent values throughout the app
 */

/**
 * API endpoints and configuration
 */
export const API_ENDPOINTS = {
  BOARDS: '/api/boards',
  PARTICIPANTS: '/api/participants',
  SCORES: '/api/scores',
  SESSIONS: '/api/sessions',
  MATCHES: '/api/matches',
  TOURNAMENTS: '/api/tournaments',
  TEST: '/api/test',
} as const

/**
 * Application URLs and routing
 */
export const ROUTES = {
  HOME: '/',
  BOARD_VIEW: '/boards',
  BOARD_ADMIN: '/admin',
  BOARD_SESSIONS: '/sessions',
} as const

/**
 * UI constants
 */
export const UI = {
  TOAST_DURATION: 3000,
  DEBOUNCE_DELAY: 300,
  ANIMATION_DURATION: 150,
  MOBILE_BREAKPOINT: 768,
} as const

/**
 * Board configuration
 */
export const BOARD_CONFIG = {
  MAX_NAME_LENGTH: 100,
  MAX_PARTICIPANT_NAME_LENGTH: 50,
  MAX_COLUMN_NAME_LENGTH: 50,
  MAX_DESCRIPTION_LENGTH: 500,
  MAX_PARTICIPANTS: 100,
  MAX_COLUMNS: 20,
  DEFAULT_WIN_POINTS: 3,
  DEFAULT_LOSS_POINTS: 0,
  DEFAULT_DRAW_POINTS: 1,
} as const

/**
 * Default session columns for board setup
 */
export const DEFAULT_SESSION_COLUMNS = [
  { name: 'Wins', type: 'NUMBER' as const, order: 1 },
  { name: 'Losses', type: 'NUMBER' as const, order: 2 },
  { name: 'Points', type: 'NUMBER' as const, order: 3 },
  { name: 'Points Scored', type: 'NUMBER' as const, order: 4 },
  { name: 'Points Taken', type: 'NUMBER' as const, order: 5 },
] as const

/**
 * History action icons for consistent UI
 */
export const HISTORY_ICONS = {
  score_update: '📊',
  participant_added: '👤',
  participant_removed: '❌',
  board_updated: '✏️',
  column_added: '📋',
  column_removed: '🗑️',
  session_created: '🎮',
  match_completed: '🏆',
  default: '📝',
} as const

/**
 * Board type configuration
 */
export const BOARD_TYPES = {
  LEADERBOARD: 'LEADERBOARD',
  MULTISCORE: 'MULTISCORE',
} as const

/**
 * Column types configuration
 */
export const COLUMN_TYPES = {
  NUMBER: 'NUMBER',
  TEXT: 'TEXT',
  DATE: 'DATE',
  BOOLEAN: 'BOOLEAN',
} as const

/**
 * Session status configuration
 */
export const SESSION_STATUS = {
  ACTIVE: 'ACTIVE',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
} as const

/**
 * Match status configuration
 */
export const MATCH_STATUS = {
  PENDING: 'PENDING',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
} as const

/**
 * Tournament status configuration
 */
export const TOURNAMENT_STATUS = {
  DRAFT: 'DRAFT',
  ACTIVE: 'ACTIVE',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
} as const

/**
 * Tournament phase configuration
 */
export const TOURNAMENT_PHASE = {
  SETUP: 'SETUP',
  GROUP_DRAW: 'GROUP_DRAW',
  GROUP_STAGE: 'GROUP_STAGE',
  KNOCKOUT: 'KNOCKOUT',
  COMPLETED: 'COMPLETED',
} as const

/**
 * Match round configuration
 */
export const MATCH_ROUND = {
  GROUP: 'GROUP',
  SEMIFINAL: 'SEMIFINAL',
  FINAL: 'FINAL',
} as const

/**
 * Environment configuration helpers
 */
export const ENV = {
  get baseUrl(): string {
    return process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  },
  get isDevelopment(): boolean {
    return process.env.NODE_ENV === 'development'
  },
  get isProduction(): boolean {
    return process.env.NODE_ENV === 'production'
  },
} as const
