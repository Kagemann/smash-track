/**
 * URL generation and sharing utilities
 * Functions for creating consistent URLs and share data
 */

import { ENV } from '@/lib/constants'
import type { Board } from '@/types'

/**
 * Generate a board URL for public or admin access
 * @param id - Board ID
 * @param type - Access type ('public' | 'admin')
 * @returns Complete URL string
 */
export function generateBoardUrl(id: string, type: 'public' | 'admin'): string {
  const basePath = `/boards/${id}`
  const adminSuffix = type === 'admin' ? '/admin' : ''
  return `${ENV.baseUrl}${basePath}${adminSuffix}`
}

/**
 * Generate share data for a board including all necessary URLs
 * @param board - Board object
 * @returns Share data object with URLs and board info
 */
export function generateShareData(board: Board) {
  return {
    publicUrl: generateBoardUrl(board.id, 'public'),
    adminUrl: generateBoardUrl(board.id, 'admin'),
    boardName: board.name,
    boardType: board.type,
    participantCount: board.participants?.length || 0,
  }
}

/**
 * Generate a session URL
 * @param boardId - Board ID
 * @param sessionId - Session ID  
 * @returns Complete session URL string
 */
export function generateSessionUrl(boardId: string, sessionId: string): string {
  return `${ENV.baseUrl}/boards/${boardId}/sessions/${sessionId}`
}

/**
 * Extract board ID from a board URL
 * @param url - The board URL
 * @returns Board ID or null if not found
 */
export function extractBoardIdFromUrl(url: string): string | null {
  const match = url.match(/\/boards\/([a-zA-Z0-9]+)/);
  return match ? match[1] : null;
}

/**
 * Check if a URL is a board admin URL
 * @param url - The URL to check
 * @returns True if it's an admin URL
 */
export function isAdminUrl(url: string): boolean {
  return url.includes('/admin');
}

/**
 * Generate a QR code URL for sharing (using a QR service)
 * @param url - The URL to encode in QR
 * @returns QR code image URL
 */
export function generateQrCodeUrl(url: string): string {
  const encodedUrl = encodeURIComponent(url);
  return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodedUrl}`;
}

/**
 * Create a shareable text message for a board
 * @param board - Board object
 * @param includeAdminLink - Whether to include admin link
 * @returns Formatted share message
 */
export function createShareMessage(board: Board, includeAdminLink: boolean = false): string {
  const shareData = generateShareData(board);
  
  let message = `🏆 ${board.name}\n`;
  message += `Track scores in real-time!\n\n`;
  message += `📊 View: ${shareData.publicUrl}`;
  
  if (includeAdminLink) {
    message += `\n✏️ Admin: ${shareData.adminUrl}`;
  }
  
  return message;
}
