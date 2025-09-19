/**
 * Individual board API route handlers
 * Handles operations on specific boards by ID
 */

import { NextRequest } from 'next/server'
import { BoardService } from '@/lib/services/board.service'
import { updateBoardSchema } from '@/lib/types/api'
import { 
  createSuccessResponse, 
  createNotFoundResponse,
  withErrorHandling, 
  validateRequestBody,
  validatePathParams 
} from '@/lib/api'
import { z } from 'zod'

const boardService = new BoardService()

// Path parameters validation schema
const paramsSchema = z.object({
  id: z.string().min(1, 'Board ID is required'),
})

/**
 * GET /api/boards/[id]
 * Retrieves a specific board with full details
 */
export const GET = withErrorHandling(async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  const paramValidation = await validatePathParams(params, paramsSchema)
  
  if (!paramValidation.success) {
    return paramValidation.response
  }

  const board = await boardService.getBoardWithUrls(paramValidation.data.id)
  
  if (!board) {
    return createNotFoundResponse('Board')
  }

  return createSuccessResponse(board)
})

/**
 * PUT /api/boards/[id]
 * Updates a specific board
 */
export const PUT = withErrorHandling(async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  const paramValidation = await validatePathParams(params, paramsSchema)
  
  if (!paramValidation.success) {
    return paramValidation.response
  }

  const bodyValidation = await validateRequestBody(request, updateBoardSchema)
  
  if (!bodyValidation.success) {
    return bodyValidation.response
  }

  const updatedBoard = await boardService.updateBoard(paramValidation.data.id, bodyValidation.data)
  const boardWithUrls = await boardService.getBoardWithUrls(updatedBoard.id)
  
  return createSuccessResponse(boardWithUrls, 'Board updated successfully')
})

/**
 * DELETE /api/boards/[id]
 * Deletes a specific board
 */
export const DELETE = withErrorHandling(async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  const paramValidation = await validatePathParams(params, paramsSchema)
  
  if (!paramValidation.success) {
    return paramValidation.response
  }

  // Check if board exists
  const exists = await boardService.boardExists(paramValidation.data.id)
  
  if (!exists) {
    return createNotFoundResponse('Board')
  }

  await boardService.deleteBoard(paramValidation.data.id)
  
  return createSuccessResponse(
    { message: 'Board deleted successfully' },
    'Board deleted successfully'
  )
})
