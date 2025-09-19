/**
 * Data validation utilities
 * Functions for validating various data types and business rules
 */

import { BOARD_CONFIG } from '@/lib/constants'
import type { Board, Participant, Column } from '@/types'

/**
 * Validate board name
 * @param name - Board name to validate
 * @returns Validation result with error message if invalid
 */
export function validateBoardName(name: string): { valid: boolean; error?: string } {
  if (!name || name.trim().length === 0) {
    return { valid: false, error: 'Board name is required' }
  }
  
  if (name.trim().length > BOARD_CONFIG.MAX_NAME_LENGTH) {
    return { valid: false, error: `Board name must be ${BOARD_CONFIG.MAX_NAME_LENGTH} characters or less` }
  }
  
  return { valid: true }
}

/**
 * Validate participant name
 * @param name - Participant name to validate
 * @returns Validation result with error message if invalid
 */
export function validateParticipantName(name: string): { valid: boolean; error?: string } {
  if (!name || name.trim().length === 0) {
    return { valid: false, error: 'Participant name is required' }
  }
  
  if (name.trim().length > BOARD_CONFIG.MAX_PARTICIPANT_NAME_LENGTH) {
    return { valid: false, error: `Participant name must be ${BOARD_CONFIG.MAX_PARTICIPANT_NAME_LENGTH} characters or less` }
  }
  
  return { valid: true }
}

/**
 * Validate column name
 * @param name - Column name to validate
 * @returns Validation result with error message if invalid
 */
export function validateColumnName(name: string): { valid: boolean; error?: string } {
  if (!name || name.trim().length === 0) {
    return { valid: false, error: 'Column name is required' }
  }
  
  if (name.trim().length > BOARD_CONFIG.MAX_COLUMN_NAME_LENGTH) {
    return { valid: false, error: `Column name must be ${BOARD_CONFIG.MAX_COLUMN_NAME_LENGTH} characters or less` }
  }
  
  return { valid: true }
}

/**
 * Validate session description
 * @param description - Session description to validate
 * @returns Validation result with error message if invalid
 */
export function validateSessionDescription(description?: string): { valid: boolean; error?: string } {
  if (!description) {
    return { valid: true } // Description is optional
  }
  
  if (description.length > BOARD_CONFIG.MAX_DESCRIPTION_LENGTH) {
    return { valid: false, error: `Description must be ${BOARD_CONFIG.MAX_DESCRIPTION_LENGTH} characters or less` }
  }
  
  return { valid: true }
}

/**
 * Validate that two players are different for a match
 * @param player1Id - First player ID
 * @param player2Id - Second player ID
 * @returns Validation result with error message if invalid
 */
export function validateMatchPlayers(player1Id: string, player2Id: string): { valid: boolean; error?: string } {
  if (!player1Id || !player2Id) {
    return { valid: false, error: 'Both players must be selected' }
  }
  
  if (player1Id === player2Id) {
    return { valid: false, error: 'Players must be different' }
  }
  
  return { valid: true }
}

/**
 * Validate score values for different column types
 * @param value - Score value
 * @param columnType - Type of column
 * @returns Validation result with error message if invalid
 */
export function validateScoreValue(value: number, columnType?: string): { valid: boolean; error?: string } {
  if (isNaN(value)) {
    return { valid: false, error: 'Score must be a valid number' }
  }
  
  switch (columnType) {
    case 'NUMBER':
      if (!isFinite(value)) {
        return { valid: false, error: 'Score must be a finite number' }
      }
      if (value < 0) {
        return { valid: false, error: 'Score cannot be negative' }
      }
      break
    case 'BOOLEAN':
      if (value !== 0 && value !== 1) {
        return { valid: false, error: 'Boolean score must be 0 or 1' }
      }
      break
    case 'DATE':
      if (value <= 0) {
        return { valid: false, error: 'Date score must be positive' }
      }
      break
  }
  
  return { valid: true }
}

/**
 * Check if a board name is unique among existing boards
 * @param name - Board name to check
 * @param boards - Array of existing boards
 * @param excludeId - Board ID to exclude from check (for updates)
 * @returns True if name is unique
 */
export function isBoardNameUnique(name: string, boards: Board[], excludeId?: string): boolean {
  const trimmedName = name.trim().toLowerCase()
  return !boards.some(board => 
    board.id !== excludeId && 
    board.name.toLowerCase() === trimmedName
  )
}

/**
 * Check if a participant name is unique within a board
 * @param name - Participant name to check
 * @param participants - Array of existing participants
 * @param excludeId - Participant ID to exclude from check (for updates)
 * @returns True if name is unique
 */
export function isParticipantNameUnique(name: string, participants: Participant[], excludeId?: string): boolean {
  const trimmedName = name.trim().toLowerCase()
  return !participants.some(participant => 
    participant.id !== excludeId && 
    participant.name.toLowerCase() === trimmedName
  )
}

/**
 * Check if a column name is unique within a board
 * @param name - Column name to check
 * @param columns - Array of existing columns
 * @param excludeId - Column ID to exclude from check (for updates)
 * @returns True if name is unique
 */
export function isColumnNameUnique(name: string, columns: Column[], excludeId?: string): boolean {
  const trimmedName = name.trim().toLowerCase()
  return !columns.some(column => 
    column.id !== excludeId && 
    column.name.toLowerCase() === trimmedName
  )
}

/**
 * Validate email address format (for future sharing features)
 * @param email - Email address to validate
 * @returns Validation result with error message if invalid
 */
export function validateEmail(email: string): { valid: boolean; error?: string } {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  
  if (!email || email.trim().length === 0) {
    return { valid: false, error: 'Email is required' }
  }
  
  if (!emailRegex.test(email.trim())) {
    return { valid: false, error: 'Please enter a valid email address' }
  }
  
  return { valid: true }
}
