/**
 * Client-side validation utilities
 * Helper functions for validating user input
 */

/**
 * Validates if a string is not empty or just whitespace
 */
export function isNonEmptyString(value: string): boolean {
  return typeof value === 'string' && value.trim().length > 0
}

/**
 * Validates if a number is within a specified range
 */
export function isNumberInRange(value: number, min: number, max: number): boolean {
  return typeof value === 'number' && !isNaN(value) && value >= min && value <= max
}

/**
 * Validates email format (basic client-side validation)
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Validates URL format
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

/**
 * Validates if a string contains only alphanumeric characters and spaces
 */
export function isAlphanumericWithSpaces(value: string): boolean {
  const alphanumericRegex = /^[a-zA-Z0-9\s]+$/
  return alphanumericRegex.test(value)
}

/**
 * Validates if a string is a valid participant name
 */
export function isValidParticipantName(name: string): boolean {
  return (
    isNonEmptyString(name) &&
    name.length <= 50 &&
    name.trim().length >= 1
  )
}

/**
 * Validates if a string is a valid board name
 */
export function isValidBoardName(name: string): boolean {
  return (
    isNonEmptyString(name) &&
    name.length <= 100 &&
    name.trim().length >= 1
  )
}

/**
 * Validates if a score is valid
 */
export function isValidScore(score: number): boolean {
  return (
    typeof score === 'number' &&
    !isNaN(score) &&
    isFinite(score) &&
    score >= 0
  )
}

/**
 * Sanitizes user input by removing potentially harmful characters
 */
export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove basic HTML tags
    .substring(0, 1000) // Limit length for safety
}

/**
 * Validates if an array has items and all items pass a validation function
 */
export function validateArray<T>(
  items: T[],
  validator: (item: T) => boolean,
  minLength = 1
): boolean {
  return (
    Array.isArray(items) &&
    items.length >= minLength &&
    items.every(validator)
  )
}

/**
 * Validates participant names array
 */
export function isValidParticipantArray(participants: string[]): boolean {
  return validateArray(
    participants,
    isValidParticipantName,
    1 // At least one participant
  )
}

/**
 * Checks if two arrays have duplicate values
 */
export function hasDuplicates<T>(array: T[]): boolean {
  return new Set(array).size !== array.length
}

/**
 * Validates if participant names are unique
 */
export function hasUniqueParticipants(participants: string[]): boolean {
  const trimmed = participants.map(p => p.trim().toLowerCase())
  return !hasDuplicates(trimmed)
}

/**
 * Comprehensive form validation for board creation
 */
export interface BoardValidationResult {
  isValid: boolean
  errors: string[]
}

export function validateBoardForm(data: {
  name: string
  type: string
  participants: string[]
}): BoardValidationResult {
  const errors: string[] = []

  // Validate board name
  if (!isValidBoardName(data.name)) {
    errors.push('Board name must be between 1 and 100 characters')
  }

  // Validate board type
  if (!['LEADERBOARD', 'MULTISCORE'].includes(data.type)) {
    errors.push('Invalid board type')
  }

  // Validate participants
  if (!isValidParticipantArray(data.participants)) {
    errors.push('At least one valid participant is required')
  }

  // Check for unique participants
  if (!hasUniqueParticipants(data.participants)) {
    errors.push('Participant names must be unique')
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}