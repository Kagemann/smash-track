/**
 * Tests for format utilities
 */

import {
  formatNumber,
  formatScore,
  formatTime,
  formatDate,
  formatRelativeTime,
  formatPercentage,
  capitalize,
  toTitleCase,
  truncateText,
  formatRank,
  formatActionName,
  formatMatchScore,
  formatList,
} from '../format'

describe('Format Utilities', () => {
  describe('formatNumber', () => {
    it('should format numbers with locale formatting', () => {
      expect(formatNumber(1234)).toBe('1,234')
      expect(formatNumber(1234567)).toBe('1,234,567')
      expect(formatNumber(123.45)).toBe('123.45')
    })
  })

  describe('formatScore', () => {
    it('should format scores based on column type', () => {
      expect(formatScore(1234, 'NUMBER')).toBe('1,234')
      expect(formatScore(1, 'BOOLEAN')).toBe('Yes')
      expect(formatScore(0, 'BOOLEAN')).toBe('No')
      expect(formatScore(123)).toBe('123')
    })

    it('should format date scores', () => {
      const timestamp = new Date('2023-01-01').getTime()
      expect(formatScore(timestamp, 'DATE')).toBe('1/1/2023')
    })
  })

  describe('formatTime', () => {
    it('should format time in MM:SS format', () => {
      expect(formatTime(65)).toBe('1:05')
      expect(formatTime(125)).toBe('2:05')
      expect(formatTime(30)).toBe('0:30')
    })
  })

  describe('formatDate', () => {
    it('should format dates with default options', () => {
      const date = new Date('2023-01-15T10:30:00')
      const formatted = formatDate(date)
      expect(formatted).toContain('Jan')
      expect(formatted).toContain('15')
      expect(formatted).toContain('2023')
    })

    it('should accept string dates', () => {
      const formatted = formatDate('2023-01-15T10:30:00')
      expect(formatted).toContain('Jan')
      expect(formatted).toContain('15')
      expect(formatted).toContain('2023')
    })
  })

  describe('formatRelativeTime', () => {
    it('should return "just now" for very recent dates', () => {
      const now = new Date()
      expect(formatRelativeTime(now)).toBe('just now')
    })

    it('should format minutes ago', () => {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)
      expect(formatRelativeTime(fiveMinutesAgo)).toBe('5 minutes ago')
    })

    it('should format hours ago', () => {
      const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000)
      expect(formatRelativeTime(twoHoursAgo)).toBe('2 hours ago')
    })

    it('should format days ago', () => {
      const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
      expect(formatRelativeTime(threeDaysAgo)).toBe('3 days ago')
    })
  })

  describe('formatPercentage', () => {
    it('should format percentages correctly', () => {
      expect(formatPercentage(0.5)).toBe('50.0%')
      expect(formatPercentage(0.123, 2)).toBe('12.30%')
      expect(formatPercentage(1)).toBe('100.0%')
    })
  })

  describe('capitalize', () => {
    it('should capitalize first letter', () => {
      expect(capitalize('hello')).toBe('Hello')
      expect(capitalize('WORLD')).toBe('World')
      expect(capitalize('')).toBe('')
    })
  })

  describe('toTitleCase', () => {
    it('should convert to title case', () => {
      expect(toTitleCase('hello world')).toBe('Hello World')
      expect(toTitleCase('THE QUICK BROWN FOX')).toBe('The Quick Brown Fox')
    })
  })

  describe('truncateText', () => {
    it('should truncate text longer than max length', () => {
      expect(truncateText('Hello World', 8)).toBe('Hello...')
      expect(truncateText('Short', 10)).toBe('Short')
    })
  })

  describe('formatRank', () => {
    it('should format ranks with proper suffixes', () => {
      expect(formatRank(1)).toBe('1st')
      expect(formatRank(2)).toBe('2nd')
      expect(formatRank(3)).toBe('3rd')
      expect(formatRank(4)).toBe('4th')
      expect(formatRank(11)).toBe('11th')
      expect(formatRank(21)).toBe('21st')
      expect(formatRank(22)).toBe('22nd')
      expect(formatRank(23)).toBe('23rd')
    })
  })

  describe('formatActionName', () => {
    it('should convert snake_case to Title Case', () => {
      expect(formatActionName('score_update')).toBe('Score Update')
      expect(formatActionName('participant_added')).toBe('Participant Added')
      expect(formatActionName('board_created')).toBe('Board Created')
    })
  })

  describe('formatMatchScore', () => {
    it('should format match scores', () => {
      expect(formatMatchScore(2, 1)).toBe('2 - 1')
      expect(formatMatchScore(0, 3)).toBe('0 - 3')
    })
  })

  describe('formatList', () => {
    it('should format lists with proper conjunctions', () => {
      expect(formatList([])).toBe('')
      expect(formatList(['Apple'])).toBe('Apple')
      expect(formatList(['Apple', 'Banana'])).toBe('Apple and Banana')
      expect(formatList(['Apple', 'Banana', 'Cherry'])).toBe('Apple, Banana, and Cherry')
      expect(formatList(['A', 'B', 'C'], 'or')).toBe('A, B, or C')
    })
  })
})