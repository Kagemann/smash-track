/**
 * URL generation utilities
 * Centralized functions for generating URLs throughout the application
 */

import { API_CONFIG } from '@/lib/constants'

/**
 * Gets the base URL for the application
 */
export function getBaseUrl(): string {
  return API_CONFIG.BASE_URL
}

/**
 * Generates board URLs for public and admin access
 */
export function getBoardUrls(boardId: string) {
  const baseUrl = getBaseUrl()
  
  return {
    publicUrl: `${baseUrl}/boards/${boardId}`,
    adminUrl: `${baseUrl}/boards/${boardId}/admin`,
  }
}

/**
 * Generates a public board URL
 */
export function getPublicBoardUrl(boardId: string): string {
  return `${getBaseUrl()}/boards/${boardId}`
}

/**
 * Generates an admin board URL
 */
export function getAdminBoardUrl(boardId: string): string {
  return `${getBaseUrl()}/boards/${boardId}/admin`
}

/**
 * Generates session URLs
 */
export function getSessionUrls(boardId: string, sessionId?: string) {
  const baseUrl = getBaseUrl()
  const sessionBaseUrl = `${baseUrl}/boards/${boardId}/sessions`
  
  if (sessionId) {
    return {
      sessionUrl: `${sessionBaseUrl}/${sessionId}`,
      sessionsUrl: sessionBaseUrl,
    }
  }
  
  return {
    sessionsUrl: sessionBaseUrl,
  }
}

/**
 * Generates API endpoint URLs
 */
export function getApiUrls() {
  const baseUrl = getBaseUrl()
  
  return {
    boards: `${baseUrl}/api/boards`,
    board: (id: string) => `${baseUrl}/api/boards/${id}`,
    participants: `${baseUrl}/api/participants`,
    participant: (id: string) => `${baseUrl}/api/participants/${id}`,
    scores: `${baseUrl}/api/scores`,
    score: (id: string) => `${baseUrl}/api/scores/${id}`,
    sessions: `${baseUrl}/api/sessions`,
    session: (id: string) => `${baseUrl}/api/sessions/${id}`,
    matches: `${baseUrl}/api/matches`,
    match: (id: string) => `${baseUrl}/api/matches/${id}`,
  }
}

/**
 * Generates share data for a board
 */
export function generateShareData(boardId: string, boardName: string) {
  const { publicUrl, adminUrl } = getBoardUrls(boardId)
  
  return {
    publicUrl,
    adminUrl,
    boardName,
  }
}

/**
 * Validates if a URL is a valid board URL
 */
export function isValidBoardUrl(url: string): boolean {
  try {
    const urlObj = new URL(url)
    const pathPattern = /^\/boards\/[a-zA-Z0-9]+(?:\/admin)?$/
    return pathPattern.test(urlObj.pathname)
  } catch {
    return false
  }
}

/**
 * Extracts board ID from a board URL
 */
export function extractBoardIdFromUrl(url: string): string | null {
  try {
    const urlObj = new URL(url)
    const matches = urlObj.pathname.match(/^\/boards\/([a-zA-Z0-9]+)(?:\/admin)?$/)
    return matches ? matches[1] : null
  } catch {
    return null
  }
}

/**
 * Checks if a URL is an admin URL
 */
export function isAdminUrl(url: string): boolean {
  try {
    const urlObj = new URL(url)
    return urlObj.pathname.endsWith('/admin')
  } catch {
    return false
  }
}