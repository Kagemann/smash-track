/**
 * Tests for URL utilities
 */

import {
  getBaseUrl,
  getBoardUrls,
  getPublicBoardUrl,
  getAdminBoardUrl,
  getSessionUrls,
  getApiUrls,
  generateShareData,
  isValidBoardUrl,
  extractBoardIdFromUrl,
  isAdminUrl,
} from '../urls'

// Mock environment variables
const originalEnv = process.env

describe('URL Utilities', () => {
  beforeEach(() => {
    jest.resetModules()
    process.env = { ...originalEnv }
  })

  afterAll(() => {
    process.env = originalEnv
  })

  describe('getBaseUrl', () => {
    it('should return the configured base URL', () => {
      process.env.NEXT_PUBLIC_APP_URL = 'https://example.com'
      expect(getBaseUrl()).toBe('https://example.com')
    })

    it('should return default URL when not configured', () => {
      delete process.env.NEXT_PUBLIC_APP_URL
      expect(getBaseUrl()).toBe('http://localhost:3000')
    })
  })

  describe('getBoardUrls', () => {
    it('should generate correct board URLs', () => {
      process.env.NEXT_PUBLIC_APP_URL = 'https://example.com'
      const boardId = 'board123'
      const urls = getBoardUrls(boardId)
      
      expect(urls).toEqual({
        publicUrl: 'https://example.com/boards/board123',
        adminUrl: 'https://example.com/boards/board123/admin',
      })
    })
  })

  describe('getPublicBoardUrl', () => {
    it('should generate public board URL', () => {
      process.env.NEXT_PUBLIC_APP_URL = 'https://example.com'
      const url = getPublicBoardUrl('board123')
      expect(url).toBe('https://example.com/boards/board123')
    })
  })

  describe('getAdminBoardUrl', () => {
    it('should generate admin board URL', () => {
      process.env.NEXT_PUBLIC_APP_URL = 'https://example.com'
      const url = getAdminBoardUrl('board123')
      expect(url).toBe('https://example.com/boards/board123/admin')
    })
  })

  describe('getSessionUrls', () => {
    it('should generate session URLs without specific session ID', () => {
      process.env.NEXT_PUBLIC_APP_URL = 'https://example.com'
      const urls = getSessionUrls('board123')
      
      expect(urls).toEqual({
        sessionsUrl: 'https://example.com/boards/board123/sessions',
      })
    })

    it('should generate session URLs with specific session ID', () => {
      process.env.NEXT_PUBLIC_APP_URL = 'https://example.com'
      const urls = getSessionUrls('board123', 'session456')
      
      expect(urls).toEqual({
        sessionUrl: 'https://example.com/boards/board123/sessions/session456',
        sessionsUrl: 'https://example.com/boards/board123/sessions',
      })
    })
  })

  describe('getApiUrls', () => {
    it('should generate all API endpoint URLs', () => {
      process.env.NEXT_PUBLIC_APP_URL = 'https://example.com'
      const urls = getApiUrls()
      
      expect(urls.boards).toBe('https://example.com/api/boards')
      expect(urls.board('123')).toBe('https://example.com/api/boards/123')
      expect(urls.participants).toBe('https://example.com/api/participants')
      expect(urls.scores).toBe('https://example.com/api/scores')
      expect(urls.sessions).toBe('https://example.com/api/sessions')
      expect(urls.matches).toBe('https://example.com/api/matches')
    })
  })

  describe('generateShareData', () => {
    it('should generate share data object', () => {
      process.env.NEXT_PUBLIC_APP_URL = 'https://example.com'
      const shareData = generateShareData('board123', 'My Board')
      
      expect(shareData).toEqual({
        publicUrl: 'https://example.com/boards/board123',
        adminUrl: 'https://example.com/boards/board123/admin',
        boardName: 'My Board',
      })
    })
  })

  describe('isValidBoardUrl', () => {
    it('should validate board URLs', () => {
      expect(isValidBoardUrl('https://example.com/boards/abc123')).toBe(true)
      expect(isValidBoardUrl('https://example.com/boards/abc123/admin')).toBe(true)
      expect(isValidBoardUrl('https://example.com/boards/abc123xyz')).toBe(true)
      
      expect(isValidBoardUrl('https://example.com/boards/')).toBe(false)
      expect(isValidBoardUrl('https://example.com/other/abc123')).toBe(false)
      expect(isValidBoardUrl('invalid-url')).toBe(false)
      expect(isValidBoardUrl('')).toBe(false)
    })
  })

  describe('extractBoardIdFromUrl', () => {
    it('should extract board ID from valid URLs', () => {
      expect(extractBoardIdFromUrl('https://example.com/boards/abc123')).toBe('abc123')
      expect(extractBoardIdFromUrl('https://example.com/boards/abc123/admin')).toBe('abc123')
      expect(extractBoardIdFromUrl('http://localhost:3000/boards/xyz789')).toBe('xyz789')
    })

    it('should return null for invalid URLs', () => {
      expect(extractBoardIdFromUrl('https://example.com/other/abc123')).toBe(null)
      expect(extractBoardIdFromUrl('invalid-url')).toBe(null)
      expect(extractBoardIdFromUrl('')).toBe(null)
    })
  })

  describe('isAdminUrl', () => {
    it('should identify admin URLs', () => {
      expect(isAdminUrl('https://example.com/boards/abc123/admin')).toBe(true)
      expect(isAdminUrl('https://example.com/boards/abc123')).toBe(false)
      expect(isAdminUrl('https://example.com/admin')).toBe(true)
      expect(isAdminUrl('invalid-url')).toBe(false)
    })
  })
})