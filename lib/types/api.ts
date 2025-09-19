/**
 * API request/response types and validation schemas
 * These types define the shape of data for API endpoints
 */

import { z } from 'zod'
import { BoardType, ColumnType, SessionStatus, MatchStatus } from './database'

// Common API response structure
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// Pagination types
export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// Board-related API types
export interface CreateBoardRequest {
  name: string
  type: BoardType
  participants: string[]
  columns: Array<{
    name: string
    type: 'number' | 'text' | 'time'
  }>
}

export interface UpdateBoardRequest {
  name?: string
}

export interface CreateParticipantRequest {
  name: string
  boardId: string
}

export interface UpdateParticipantRequest {
  name: string
}

export interface CreateScoreRequest {
  value: number
  participantId: string
  columnId?: string
  boardId: string
}

export interface UpdateScoreRequest {
  value: number
}

export interface CreateColumnRequest {
  name: string
  type: ColumnType
  order: number
  boardId: string
}

// Session-related API types
export interface CreateSessionRequest {
  name: string
  description?: string
  boardId: string
  winPoints?: number
  lossPoints?: number
  drawPoints?: number
}

export interface UpdateSessionRequest {
  name?: string
  description?: string
  status?: SessionStatus
  winPoints?: number
  lossPoints?: number
  drawPoints?: number
}

// Match-related API types
export interface CreateMatchRequest {
  sessionId: string
  player1Id: string
  player2Id: string
}

export interface UpdateMatchRequest {
  player1Score?: number
  player2Score?: number
  status?: MatchStatus
}

export interface CompleteMatchRequest {
  player1Score: number
  player2Score: number
  customScores?: Record<string, { player1: number, player2: number }>
}

// Share data type
export interface ShareData {
  publicUrl: string
  adminUrl: string
  boardName: string
}

// Real-time event types
export interface PusherEvent {
  type: 'score_update' | 'participant_added' | 'participant_removed' | 'board_update'
  data: any
  boardId: string
}

// Validation schemas using Zod
export const createBoardSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  type: z.enum(["LEADERBOARD", "MULTISCORE"]),
  participants: z.array(z.string().min(1, "Participant name is required").max(50)),
  columns: z.array(z.object({
    name: z.string().min(1, "Column name is required").max(50),
    type: z.enum(["number", "text", "time"])
  })).optional().default([]),
})

export const updateBoardSchema = z.object({
  name: z.string().min(1).max(100).optional(),
})

export const createParticipantSchema = z.object({
  name: z.string().min(1, "Name is required").max(50),
  boardId: z.string(),
})

export const updateParticipantSchema = z.object({
  name: z.string().min(1, "Name is required").max(50),
})

export const createScoreSchema = z.object({
  value: z.number().min(0, "Score must be non-negative"),
  boardId: z.string().min(1, "Board ID is required"),
  participantId: z.string().min(1, "Participant ID is required"),
  columnId: z.string().optional(),
})

export const updateScoreSchema = z.object({
  value: z.number().min(0, "Score must be non-negative"),
})

export const createColumnSchema = z.object({
  name: z.string().min(1, "Column name is required").max(50),
  type: z.enum(["NUMBER", "TEXT", "DATE", "BOOLEAN"]),
  order: z.number().int().min(0),
  boardId: z.string(),
})

export const createSessionSchema = z.object({
  name: z.string().min(1, "Session name is required").max(100),
  description: z.string().max(500).optional(),
  boardId: z.string().min(1, "Board ID is required"),
  winPoints: z.number().min(0).default(3),
  lossPoints: z.number().min(0).default(0),
  drawPoints: z.number().min(0).default(1),
})

export const updateSessionSchema = z.object({
  name: z.string().min(1, "Session name is required").max(100).optional(),
  description: z.string().max(500).optional(),
  status: z.enum(["ACTIVE", "COMPLETED", "CANCELLED"]).optional(),
  winPoints: z.number().min(0).optional(),
  lossPoints: z.number().min(0).optional(),
  drawPoints: z.number().min(0).optional(),
})

export const createMatchSchema = z.object({
  sessionId: z.string().min(1, "Session ID is required"),
  player1Id: z.string().min(1, "Player 1 is required"),
  player2Id: z.string().min(1, "Player 2 is required"),
}).refine((data) => data.player1Id !== data.player2Id, {
  message: "Players must be different",
  path: ["player2Id"],
})

export const updateMatchSchema = z.object({
  player1Score: z.number().min(0, "Score must be non-negative").optional(),
  player2Score: z.number().min(0, "Score must be non-negative").optional(),
  status: z.enum(["PENDING", "IN_PROGRESS", "COMPLETED", "CANCELLED"]).optional(),
})

export const completeMatchSchema = z.object({
  player1Score: z.number().min(0, "Score must be non-negative"),
  player2Score: z.number().min(0, "Score must be non-negative"),
  customScores: z.record(z.object({
    player1: z.number().min(0, "Score must be non-negative"),
    player2: z.number().min(0, "Score must be non-negative"),
  })).optional(),
})

// Type inference from schemas
export type CreateBoardInput = z.infer<typeof createBoardSchema>
export type UpdateBoardInput = z.infer<typeof updateBoardSchema>
export type CreateParticipantInput = z.infer<typeof createParticipantSchema>
export type UpdateParticipantInput = z.infer<typeof updateParticipantSchema>
export type CreateScoreInput = z.infer<typeof createScoreSchema>
export type UpdateScoreInput = z.infer<typeof updateScoreSchema>
export type CreateColumnInput = z.infer<typeof createColumnSchema>
export type CreateSessionInput = z.infer<typeof createSessionSchema>
export type UpdateSessionInput = z.infer<typeof updateSessionSchema>
export type CreateMatchInput = z.infer<typeof createMatchSchema>
export type UpdateMatchInput = z.infer<typeof updateMatchSchema>
export type CompleteMatchInput = z.infer<typeof completeMatchSchema>