import { z } from 'zod'

// Database Types (from Prisma)
export interface Board {
  id: string
  name: string
  type: 'LEADERBOARD' | 'MULTISCORE'
  createdAt: Date
  updatedAt: Date
  participants: Participant[]
  columns: Column[]
  scores: Score[]
  history: History[]
  sessions: Session[]
}

export interface Participant {
  id: string
  name: string
  boardId: string
  scores: Score[]
  createdAt: Date
  player1Matches: Match[]
  player2Matches: Match[]
}

export interface Column {
  id: string
  name: string
  type: 'NUMBER' | 'TEXT' | 'DATE' | 'BOOLEAN'
  order: number
  boardId: string
  scores: Score[]
}

export interface Score {
  id: string
  value: number
  participantId: string
  columnId?: string
  boardId: string
  createdAt: Date
  updatedAt: Date
  participant: Participant
  column?: Column
}

export interface History {
  id: string
  action: string
  details: any
  boardId: string
  createdAt: Date
}

export interface Session {
  id: string
  name: string
  description?: string
  boardId: string
  board: Board
  status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED'
  winPoints: number
  lossPoints: number
  drawPoints: number
  createdAt: Date
  updatedAt: Date
  matches: Match[]
}

export interface Match {
  id: string
  sessionId: string
  session: Session
  player1Id: string
  player1: Participant
  player2Id: string
  player2: Participant
  player1Score: number
  player2Score: number
  winnerId?: string
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
  createdAt: Date
  updatedAt: Date
}

// Form Types
export interface CreateBoardData {
  name: string
  type: 'LEADERBOARD' | 'MULTISCORE'
  participants: string[]
  columns: Array<{
    name: string
    type: 'number' | 'text' | 'time'
  }>
}

export interface UpdateBoardData {
  name?: string
}

export interface CreateParticipantData {
  name: string
  boardId: string
}

export interface UpdateParticipantData {
  name: string
}

export interface CreateScoreData {
  value: number
  participantId: string
  columnId?: string
  boardId: string
}

export interface UpdateScoreData {
  value: number
  participantId?: string
  columnId?: string
}

export interface CreateColumnData {
  name: string
  type: 'NUMBER' | 'TEXT' | 'DATE' | 'BOOLEAN'
  order: number
  boardId: string
}

export interface CreateSessionData {
  name: string
  description?: string
  boardId: string
  winPoints?: number
  lossPoints?: number
  drawPoints?: number
}

export interface UpdateSessionData {
  name?: string
  description?: string
  status?: 'ACTIVE' | 'COMPLETED' | 'CANCELLED'
  winPoints?: number
  lossPoints?: number
  drawPoints?: number
}

export interface CreateMatchData {
  sessionId: string
  player1Id: string
  player2Id: string
}

export interface UpdateMatchData {
  player1Score?: number
  player2Score?: number
  status?: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
}

export interface CompleteMatchData {
  player1Score: number
  player2Score: number
  customScores?: Record<string, { player1: number, player2: number }>
}

// UI Types
export interface BoardCardProps {
  board: Board
  onEdit?: () => void
  onDelete?: () => void
  onShare?: () => void
}

export interface ScoreTableProps {
  board: Board
  onScoreUpdate: (data: UpdateScoreData) => void
  onParticipantAdd: (data: CreateParticipantData) => void
  onParticipantRemove: (id: string) => void
}

export interface ParticipantListProps {
  participants: Participant[]
  onAdd: (data: CreateParticipantData) => void
  onRemove: (id: string) => void
  onBulkDelete?: (ids: string[]) => void
}

export interface ScoreInputProps {
  value: number
  onChange: (value: number) => void
  onIncrement?: () => void
  onDecrement?: () => void
  disabled?: boolean
}

export interface RankChipProps {
  rank: number
  participant: Participant
  score: number
}

// History Types
export type HistoryAction = 
  | 'score_update'
  | 'participant_added'
  | 'participant_removed'
  | 'board_updated'
  | 'column_added'
  | 'column_removed'

export interface HistoryEntry {
  id: string
  action: HistoryAction
  details: {
    participantName?: string
    oldValue?: number
    newValue?: number
    columnName?: string
    boardName?: string
  }
  timestamp: Date
}

// Share Types
export interface ShareData {
  publicUrl: string
  adminUrl: string
  boardName: string
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
}

export interface BoardWithLinks extends Board {
  publicUrl: string
  adminUrl: string
}

// Real-time Types
export interface PusherEvent {
  type: 'score_update' | 'participant_added' | 'participant_removed' | 'board_update'
  data: any
  boardId: string
}

// Zod Schemas
export const createBoardSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  type: z.enum(["LEADERBOARD", "MULTISCORE"]),
  participants: z.array(z.string().min(1, "Participant name is required").max(50)),
  columns: z.array(z.object({
    name: z.string().min(1, "Column name is required").max(50),
    type: z.enum(["number", "text", "time"])
  })).optional().default([]),
})

export const createScoreSchema = z.object({
  value: z.number(), // Allow negative values for score increments/decrements
  boardId: z.string().min(1, "Board ID is required"),
  participantId: z.string().min(1, "Participant ID is required"),
  columnId: z.string().optional(), // For multiscore boards
})

export const updateScoreSchema = z.object({
  value: z.number(), // Allow negative values for score decrements
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

export type CreateBoardInput = z.infer<typeof createBoardSchema>
export type UpdateBoardInput = z.infer<typeof updateBoardSchema>
export type CreateParticipantInput = z.infer<typeof createParticipantSchema>
export type UpdateParticipantInput = z.infer<typeof updateParticipantSchema>
export type UpdateScoreInput = z.infer<typeof updateScoreSchema>
export type CreateColumnInput = z.infer<typeof createColumnSchema>
export type CreateSessionInput = z.infer<typeof createSessionSchema>
export type UpdateSessionInput = z.infer<typeof updateSessionSchema>
export type CreateMatchInput = z.infer<typeof createMatchSchema>
export type UpdateMatchInput = z.infer<typeof updateMatchSchema>
export type CompleteMatchInput = z.infer<typeof completeMatchSchema>
