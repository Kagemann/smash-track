/**
 * Application constants and configuration values
 * Centralized location for all constants used throughout the app
 */

// API configuration
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  TIMEOUT: 30000, // 30 seconds
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second
} as const

// Database configuration
export const DATABASE_CONFIG = {
  MAX_HISTORY_ENTRIES: 50,
  MAX_BOARD_NAME_LENGTH: 100,
  MAX_PARTICIPANT_NAME_LENGTH: 50,
  MAX_COLUMN_NAME_LENGTH: 50,
  MAX_SESSION_NAME_LENGTH: 100,
  MAX_SESSION_DESCRIPTION_LENGTH: 500,
} as const

// Session scoring defaults
export const SESSION_SCORING = {
  DEFAULT_WIN_POINTS: 3,
  DEFAULT_LOSS_POINTS: 0,
  DEFAULT_DRAW_POINTS: 1,
  MIN_POINTS: 0,
} as const

// Default columns for session scoring
export const DEFAULT_SESSION_COLUMNS = [
  { name: 'Wins', type: 'NUMBER' as const, order: 1 },
  { name: 'Losses', type: 'NUMBER' as const, order: 2 },
  { name: 'Points', type: 'NUMBER' as const, order: 3 },
  { name: 'Points Scored', type: 'NUMBER' as const, order: 4 },
  { name: 'Points Taken', type: 'NUMBER' as const, order: 5 },
] as const

// UI configuration
export const UI_CONFIG = {
  TOAST_DURATION: 5000,
  ANIMATION_DURATION: 200,
  DEBOUNCE_DELAY: 500,
  MOBILE_BREAKPOINT: 768,
  TOUCH_THRESHOLD: 10,
} as const

// Validation limits
export const VALIDATION_LIMITS = {
  MIN_SCORE: 0,
  MAX_SCORE: Number.MAX_SAFE_INTEGER,
  MIN_PARTICIPANTS: 1,
  MAX_PARTICIPANTS: 100,
  MIN_COLUMNS: 0,
  MAX_COLUMNS: 20,
} as const

// Board types and their display information
export const BOARD_TYPES = {
  LEADERBOARD: {
    value: 'LEADERBOARD' as const,
    label: 'Leaderboard',
    description: 'Track scores with automatic ranking and sorting',
    icon: '🏆',
    features: ['Automatic ranking', 'Single score tracking', 'Real-time updates'],
  },
  MULTISCORE: {
    value: 'MULTISCORE' as const,
    label: 'Multiscore',
    description: 'Custom columns with different data types',
    icon: '📊',
    features: ['Multiple columns', 'Custom data types', 'Flexible scoring'],
  },
} as const

// Column types and their configurations
export const COLUMN_TYPES = {
  NUMBER: {
    value: 'NUMBER' as const,
    label: 'Number',
    description: 'Numeric values',
    icon: '🔢',
    defaultValue: 0,
  },
  TEXT: {
    value: 'TEXT' as const,
    label: 'Text',
    description: 'Text values',
    icon: '📝',
    defaultValue: '',
  },
  DATE: {
    value: 'DATE' as const,
    label: 'Date/Time',
    description: 'Date and time values',
    icon: '📅',
    defaultValue: Date.now(),
  },
  BOOLEAN: {
    value: 'BOOLEAN' as const,
    label: 'Yes/No',
    description: 'Boolean values',
    icon: '✅',
    defaultValue: false,
  },
} as const

// Status types and their display information
export const SESSION_STATUSES = {
  ACTIVE: {
    value: 'ACTIVE' as const,
    label: 'Active',
    color: 'green',
    icon: '🟢',
  },
  COMPLETED: {
    value: 'COMPLETED' as const,
    label: 'Completed',
    color: 'blue',
    icon: '🔵',
  },
  CANCELLED: {
    value: 'CANCELLED' as const,
    label: 'Cancelled',
    color: 'red',
    icon: '🔴',
  },
} as const

export const MATCH_STATUSES = {
  PENDING: {
    value: 'PENDING' as const,
    label: 'Pending',
    color: 'gray',
    icon: '⏳',
  },
  IN_PROGRESS: {
    value: 'IN_PROGRESS' as const,
    label: 'In Progress',
    color: 'yellow',
    icon: '🟡',
  },
  COMPLETED: {
    value: 'COMPLETED' as const,
    label: 'Completed',
    color: 'green',
    icon: '🟢',
  },
  CANCELLED: {
    value: 'CANCELLED' as const,
    label: 'Cancelled',
    color: 'red',
    icon: '🔴',
  },
} as const

// History actions and their display information
export const HISTORY_ACTIONS = {
  'score_update': {
    label: 'Score Updated',
    icon: '📊',
    color: 'blue',
  },
  'participant_added': {
    label: 'Participant Added',
    icon: '👤',
    color: 'green',
  },
  'participant_removed': {
    label: 'Participant Removed',
    icon: '❌',
    color: 'red',
  },
  'board_updated': {
    label: 'Board Updated',
    icon: '✏️',
    color: 'blue',
  },
  'board_created': {
    label: 'Board Created',
    icon: '🎯',
    color: 'green',
  },
  'column_added': {
    label: 'Column Added',
    icon: '📋',
    color: 'green',
  },
  'column_removed': {
    label: 'Column Removed',
    icon: '🗑️',
    color: 'red',
  },
  'session_created': {
    label: 'Session Created',
    icon: '🎮',
    color: 'green',
  },
  'match_created': {
    label: 'Match Created',
    icon: '⚔️',
    color: 'blue',
  },
  'match_completed': {
    label: 'Match Completed',
    icon: '🏁',
    color: 'green',
  },
} as const

// Error messages
export const ERROR_MESSAGES = {
  GENERIC: 'An unexpected error occurred. Please try again.',
  NETWORK: 'Network error. Please check your connection and try again.',
  NOT_FOUND: 'The requested resource was not found.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  VALIDATION: 'Please check your input and try again.',
  SERVER: 'Server error. Please try again later.',
  TIMEOUT: 'Request timed out. Please try again.',
} as const

// Success messages
export const SUCCESS_MESSAGES = {
  BOARD_CREATED: 'Board created successfully!',
  BOARD_UPDATED: 'Board updated successfully!',
  BOARD_DELETED: 'Board deleted successfully!',
  PARTICIPANT_ADDED: 'Participant added successfully!',
  PARTICIPANT_REMOVED: 'Participant removed successfully!',
  SCORE_UPDATED: 'Score updated successfully!',
  SESSION_CREATED: 'Session created successfully!',
  MATCH_CREATED: 'Match created successfully!',
  MATCH_COMPLETED: 'Match completed successfully!',
  LINK_COPIED: 'Link copied to clipboard!',
} as const

// Keyboard shortcuts
export const KEYBOARD_SHORTCUTS = {
  INCREMENT: ['+', '=', 'ArrowUp'],
  DECREMENT: ['-', 'ArrowDown'],
  SAVE: ['ctrl+s', 'cmd+s'],
  CANCEL: ['Escape'],
  REFRESH: ['F5', 'ctrl+r', 'cmd+r'],
} as const

// Local storage keys
export const STORAGE_KEYS = {
  THEME: 'smashtrack_theme',
  BOARD_PREFERENCES: 'smashtrack_board_prefs',
  UI_STATE: 'smashtrack_ui_state',
} as const