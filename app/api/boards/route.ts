/**
 * Boards API route handlers
 * Handles CRUD operations for boards
 */

import { NextRequest } from 'next/server'
import { BoardService } from '@/lib/services/board.service'
import { createBoardSchema } from '@/lib/types/api'
import { 
  createSuccessResponse, 
  withErrorHandling, 
  validateRequestBody 
} from '@/lib/api'

const boardService = new BoardService()

/**
 * GET /api/boards
 * Retrieves all boards with basic information
 */
export const GET = withErrorHandling(async () => {
  const boards = await boardService.getAllBoards()
  return createSuccessResponse(boards)
})

/**
 * POST /api/boards
 * Creates a new board with participants and columns
 */
export const POST = withErrorHandling(async (request: NextRequest) => {
  const validation = await validateRequestBody(request, createBoardSchema)
  
  if (!validation.success) {
    return validation.response
  }

  const board = await boardService.createBoard(validation.data)
  const boardWithUrls = await boardService.getBoardWithUrls(board.id)
  
  return createSuccessResponse(boardWithUrls, 'Board created successfully', 201)
})
