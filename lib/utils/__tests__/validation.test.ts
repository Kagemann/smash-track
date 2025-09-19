/**
 * Tests for validation utilities
 */

import {
  isNonEmptyString,
  isNumberInRange,
  isValidEmail,
  isValidUrl,
  isAlphanumericWithSpaces,
  isValidParticipantName,
  isValidBoardName,
  isValidScore,
  sanitizeInput,
  validateArray,
  isValidParticipantArray,
  hasDuplicates,
  hasUniqueParticipants,
  validateBoardForm,
} from '../validation'

describe('Validation Utilities', () => {
  describe('isNonEmptyString', () => {
    it('should validate non-empty strings', () => {
      expect(isNonEmptyString('hello')).toBe(true)
      expect(isNonEmptyString('a')).toBe(true)
      expect(isNonEmptyString('')).toBe(false)
      expect(isNonEmptyString('   ')).toBe(false)
    })
  })

  describe('isNumberInRange', () => {
    it('should validate numbers within range', () => {
      expect(isNumberInRange(5, 0, 10)).toBe(true)
      expect(isNumberInRange(0, 0, 10)).toBe(true)
      expect(isNumberInRange(10, 0, 10)).toBe(true)
      expect(isNumberInRange(-1, 0, 10)).toBe(false)
      expect(isNumberInRange(11, 0, 10)).toBe(false)
      expect(isNumberInRange(NaN, 0, 10)).toBe(false)
    })
  })

  describe('isValidEmail', () => {
    it('should validate email addresses', () => {
      expect(isValidEmail('test@example.com')).toBe(true)
      expect(isValidEmail('user.name@domain.co.uk')).toBe(true)
      expect(isValidEmail('invalid.email')).toBe(false)
      expect(isValidEmail('@domain.com')).toBe(false)
      expect(isValidEmail('test@')).toBe(false)
    })
  })

  describe('isValidUrl', () => {
    it('should validate URLs', () => {
      expect(isValidUrl('https://example.com')).toBe(true)
      expect(isValidUrl('http://localhost:3000')).toBe(true)
      expect(isValidUrl('ftp://files.example.com')).toBe(true)
      expect(isValidUrl('invalid-url')).toBe(false)
      expect(isValidUrl('')).toBe(false)
    })
  })

  describe('isAlphanumericWithSpaces', () => {
    it('should validate alphanumeric strings with spaces', () => {
      expect(isAlphanumericWithSpaces('Hello World 123')).toBe(true)
      expect(isAlphanumericWithSpaces('ABC123')).toBe(true)
      expect(isAlphanumericWithSpaces('Hello@World')).toBe(false)
      expect(isAlphanumericWithSpaces('Test!123')).toBe(false)
    })
  })

  describe('isValidParticipantName', () => {
    it('should validate participant names', () => {
      expect(isValidParticipantName('John Doe')).toBe(true)
      expect(isValidParticipantName('A')).toBe(true)
      expect(isValidParticipantName('')).toBe(false)
      expect(isValidParticipantName('   ')).toBe(false)
      expect(isValidParticipantName('a'.repeat(51))).toBe(false)
    })
  })

  describe('isValidBoardName', () => {
    it('should validate board names', () => {
      expect(isValidBoardName('My Board')).toBe(true)
      expect(isValidBoardName('A')).toBe(true)
      expect(isValidBoardName('')).toBe(false)
      expect(isValidBoardName('   ')).toBe(false)
      expect(isValidBoardName('a'.repeat(101))).toBe(false)
    })
  })

  describe('isValidScore', () => {
    it('should validate scores', () => {
      expect(isValidScore(0)).toBe(true)
      expect(isValidScore(100)).toBe(true)
      expect(isValidScore(3.14)).toBe(true)
      expect(isValidScore(-1)).toBe(false)
      expect(isValidScore(NaN)).toBe(false)
      expect(isValidScore(Infinity)).toBe(false)
    })
  })

  describe('sanitizeInput', () => {
    it('should sanitize user input', () => {
      expect(sanitizeInput('  Hello World  ')).toBe('Hello World')
      expect(sanitizeInput('Safe<script>alert("xss")</script>')).toBe('Safescriptalert("xss")/script')
      expect(sanitizeInput('Normal text')).toBe('Normal text')
    })

    it('should limit input length', () => {
      const longInput = 'a'.repeat(2000)
      const sanitized = sanitizeInput(longInput)
      expect(sanitized.length).toBe(1000)
    })
  })

  describe('validateArray', () => {
    it('should validate arrays with custom validator', () => {
      const isPositive = (n: number) => n > 0
      expect(validateArray([1, 2, 3], isPositive)).toBe(true)
      expect(validateArray([1, -1, 3], isPositive)).toBe(false)
      expect(validateArray([], isPositive, 0)).toBe(true)
      expect(validateArray([], isPositive, 1)).toBe(false)
    })
  })

  describe('isValidParticipantArray', () => {
    it('should validate participant arrays', () => {
      expect(isValidParticipantArray(['Alice', 'Bob'])).toBe(true)
      expect(isValidParticipantArray(['ValidName'])).toBe(true)
      expect(isValidParticipantArray([])).toBe(false)
      expect(isValidParticipantArray(['', 'Bob'])).toBe(false)
    })
  })

  describe('hasDuplicates', () => {
    it('should detect duplicates in arrays', () => {
      expect(hasDuplicates([1, 2, 3])).toBe(false)
      expect(hasDuplicates([1, 2, 2, 3])).toBe(true)
      expect(hasDuplicates([])).toBe(false)
      expect(hasDuplicates(['a', 'b', 'a'])).toBe(true)
    })
  })

  describe('hasUniqueParticipants', () => {
    it('should check for unique participants (case-insensitive)', () => {
      expect(hasUniqueParticipants(['Alice', 'Bob', 'Charlie'])).toBe(true)
      expect(hasUniqueParticipants(['Alice', 'alice'])).toBe(false)
      expect(hasUniqueParticipants(['Alice', ' Alice '])).toBe(false)
    })
  })

  describe('validateBoardForm', () => {
    it('should validate complete board forms', () => {
      const validForm = {
        name: 'Test Board',
        type: 'LEADERBOARD',
        participants: ['Alice', 'Bob']
      }
      
      const result = validateBoardForm(validForm)
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should return errors for invalid forms', () => {
      const invalidForm = {
        name: '',
        type: 'INVALID_TYPE',
        participants: ['Alice', 'alice'] // duplicate names
      }
      
      const result = validateBoardForm(invalidForm)
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Board name must be between 1 and 100 characters')
      expect(result.errors).toContain('Invalid board type')
      expect(result.errors).toContain('Participant names must be unique')
    })

    it('should validate participants requirement', () => {
      const noParticipants = {
        name: 'Test Board',
        type: 'LEADERBOARD',
        participants: []
      }
      
      const result = validateBoardForm(noParticipants)
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('At least one valid participant is required')
    })
  })
})