/**
 * Database entity types generated from Prisma schema
 * These types represent the database models and relationships
 */

import { z } from 'zod'

// Core entity interfaces
export interface Board {
  id: string
  name: string
  type: BoardType
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
  type: ColumnType
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
  status: SessionStatus
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
  status: MatchStatus
  createdAt: Date
  updatedAt: Date
}

// Enums
export type BoardType = 'LEADERBOARD' | 'MULTISCORE'
export type ColumnType = 'NUMBER' | 'TEXT' | 'DATE' | 'BOOLEAN'
export type SessionStatus = 'ACTIVE' | 'COMPLETED' | 'CANCELLED'
export type MatchStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'

// Extended types for API responses
export interface BoardWithLinks extends Board {
  publicUrl: string
  adminUrl: string
}

// History action types
export type HistoryAction = 
  | 'score_update'
  | 'participant_added'
  | 'participant_removed'
  | 'board_updated'
  | 'column_added'
  | 'column_removed'
  | 'board_created'
  | 'session_created'
  | 'match_created'
  | 'match_completed'

export interface HistoryEntry {
  id: string
  action: HistoryAction
  details: {
    participantName?: string
    oldValue?: number
    newValue?: number
    columnName?: string
    boardName?: string
    sessionName?: string
    matchId?: string
    player1Name?: string
    player2Name?: string
    score?: string
  }
  timestamp: Date
}