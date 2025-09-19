/**
 * Session and match management service
 * Handles session creation, match management, and tournament scoring
 */

import { apiClient, handleApiResponse } from './api-client'
import { API_ENDPOINTS } from '@/lib/constants'
import type {
  Session,
  Match,
  CreateSessionInput,
  UpdateSessionInput,
  CreateMatchInput,
  UpdateMatchInput,
  CompleteMatchInput,
  ApiResponse,
} from '@/types'

/**
 * Session management service
 */
export const sessionService = {
  /**
   * Get all sessions for a board
   * @param boardId - Board ID
   * @returns Promise with array of sessions
   */
  async getByBoard(boardId: string): Promise<Session[]> {
    const response = await apiClient.get<Session[]>(`${API_ENDPOINTS.SESSIONS}?boardId=${boardId}`)
    return handleApiResponse(response)
  },

  /**
   * Get a specific session by ID
   * @param id - Session ID
   * @returns Promise with session data including matches
   */
  async getById(id: string): Promise<Session> {
    const response = await apiClient.get<Session>(`${API_ENDPOINTS.SESSIONS}/${id}`)
    return handleApiResponse(response)
  },

  /**
   * Create a new session
   * @param data - Session creation data
   * @returns Promise with created session
   */
  async create(data: CreateSessionInput): Promise<Session> {
    const response = await apiClient.post<Session>(API_ENDPOINTS.SESSIONS, data)
    return handleApiResponse(response)
  },

  /**
   * Update an existing session
   * @param id - Session ID
   * @param data - Session update data
   * @returns Promise with updated session
   */
  async update(id: string, data: UpdateSessionInput): Promise<Session> {
    const response = await apiClient.put<Session>(`${API_ENDPOINTS.SESSIONS}/${id}`, data)
    return handleApiResponse(response)
  },

  /**
   * Delete a session
   * @param id - Session ID
   * @returns Promise that resolves when deletion is complete
   */
  async delete(id: string): Promise<void> {
    const response = await apiClient.delete<void>(`${API_ENDPOINTS.SESSIONS}/${id}`)
    handleApiResponse(response)
  },

  /**
   * Complete a session (mark as finished)
   * @param id - Session ID
   * @returns Promise with completed session
   */
  async complete(id: string): Promise<Session> {
    return this.update(id, { status: 'COMPLETED' })
  },

  /**
   * Cancel a session
   * @param id - Session ID
   * @returns Promise with cancelled session
   */
  async cancel(id: string): Promise<Session> {
    return this.update(id, { status: 'CANCELLED' })
  },

  /**
   * Reactivate a session
   * @param id - Session ID
   * @returns Promise with reactivated session
   */
  async reactivate(id: string): Promise<Session> {
    return this.update(id, { status: 'ACTIVE' })
  },

  /**
   * Get session statistics
   * @param id - Session ID
   * @returns Promise with session statistics
   */
  async getStatistics(id: string): Promise<{
    totalMatches: number
    completedMatches: number
    pendingMatches: number
    averageMatchDuration: number
    topPerformer: {
      participantId: string
      participantName: string
      wins: number
      points: number
    }
  }> {
    const response = await apiClient.get<any>(`${API_ENDPOINTS.SESSIONS}/${id}/stats`)
    return handleApiResponse(response)
  },

  /**
   * Generate round-robin matches for all participants
   * @param sessionId - Session ID
   * @returns Promise with created matches
   */
  async generateRoundRobinMatches(sessionId: string): Promise<Match[]> {
    const response = await apiClient.post<Match[]>(`${API_ENDPOINTS.SESSIONS}/${sessionId}/generate-matches`)
    return handleApiResponse(response)
  },
} as const

/**
 * Match management service
 */
export const matchService = {
  /**
   * Get all matches for a session
   * @param sessionId - Session ID
   * @returns Promise with array of matches
   */
  async getBySession(sessionId: string): Promise<Match[]> {
    const response = await apiClient.get<Match[]>(`${API_ENDPOINTS.MATCHES}?sessionId=${sessionId}`)
    return handleApiResponse(response)
  },

  /**
   * Get a specific match by ID
   * @param id - Match ID
   * @returns Promise with match data
   */
  async getById(id: string): Promise<Match> {
    const response = await apiClient.get<Match>(`${API_ENDPOINTS.MATCHES}/${id}`)
    return handleApiResponse(response)
  },

  /**
   * Create a new match
   * @param data - Match creation data
   * @returns Promise with created match
   */
  async create(data: CreateMatchInput): Promise<Match> {
    const response = await apiClient.post<Match>(API_ENDPOINTS.MATCHES, data)
    return handleApiResponse(response)
  },

  /**
   * Update a match
   * @param id - Match ID
   * @param data - Match update data
   * @returns Promise with updated match
   */
  async update(id: string, data: UpdateMatchInput): Promise<Match> {
    const response = await apiClient.put<Match>(`${API_ENDPOINTS.MATCHES}/${id}`, data)
    return handleApiResponse(response)
  },

  /**
   * Delete a match
   * @param id - Match ID
   * @returns Promise that resolves when deletion is complete
   */
  async delete(id: string): Promise<void> {
    const response = await apiClient.delete<void>(`${API_ENDPOINTS.MATCHES}/${id}`)
    handleApiResponse(response)
  },

  /**
   * Start a match (mark as in progress)
   * @param id - Match ID
   * @returns Promise with started match
   */
  async start(id: string): Promise<Match> {
    return this.update(id, { status: 'IN_PROGRESS' })
  },

  /**
   * Complete a match with scores and update board accordingly
   * @param id - Match ID
   * @param data - Match completion data including scores
   * @returns Promise with completed match
   */
  async complete(id: string, data: CompleteMatchInput): Promise<Match> {
    const response = await apiClient.post<Match>(`${API_ENDPOINTS.MATCHES}/${id}/complete`, data)
    return handleApiResponse(response)
  },

  /**
   * Cancel a match
   * @param id - Match ID
   * @returns Promise with cancelled match
   */
  async cancel(id: string): Promise<Match> {
    return this.update(id, { status: 'CANCELLED' })
  },

  /**
   * Reset a match to pending status
   * @param id - Match ID
   * @returns Promise with reset match
   */
  async reset(id: string): Promise<Match> {
    return this.update(id, { 
      status: 'PENDING',
      player1Score: 0,
      player2Score: 0,
    })
  },

  /**
   * Get match statistics
   * @param id - Match ID
   * @returns Promise with match statistics
   */
  async getStatistics(id: string): Promise<{
    duration: number
    winner: {
      participantId: string
      participantName: string
      score: number
    }
    loser: {
      participantId: string
      participantName: string
      score: number
    }
    margin: number
    boardUpdates: {
      columnName: string
      player1Change: number
      player2Change: number
    }[]
  }> {
    const response = await apiClient.get<any>(`${API_ENDPOINTS.MATCHES}/${id}/stats`)
    return handleApiResponse(response)
  },

  /**
   * Bulk create matches
   * @param matches - Array of match creation data
   * @returns Promise with created matches
   */
  async bulkCreate(matches: CreateMatchInput[]): Promise<Match[]> {
    const response = await apiClient.post<Match[]>(`${API_ENDPOINTS.MATCHES}/bulk`, { matches })
    return handleApiResponse(response)
  },

  /**
   * Get upcoming matches for a participant
   * @param participantId - Participant ID
   * @param limit - Maximum number of matches to return
   * @returns Promise with upcoming matches
   */
  async getUpcomingForParticipant(participantId: string, limit: number = 5): Promise<Match[]> {
    const response = await apiClient.get<Match[]>(
      `${API_ENDPOINTS.MATCHES}/upcoming?participantId=${participantId}&limit=${limit}`
    )
    return handleApiResponse(response)
  },
} as const

/**
 * Tournament utilities service
 */
export const tournamentService = {
  /**
   * Generate a round-robin tournament for a session
   * @param sessionId - Session ID
   * @returns Promise with tournament structure and matches
   */
  async generateRoundRobin(sessionId: string): Promise<{
    session: Session
    matches: Match[]
    rounds: {
      roundNumber: number
      matches: Match[]
    }[]
  }> {
    const response = await apiClient.post<any>(`${API_ENDPOINTS.SESSIONS}/${sessionId}/tournament/round-robin`)
    return handleApiResponse(response)
  },

  /**
   * Generate a single-elimination tournament
   * @param sessionId - Session ID
   * @param seedParticipants - Whether to seed participants by current ranking
   * @returns Promise with tournament bracket and matches
   */
  async generateSingleElimination(sessionId: string, seedParticipants: boolean = true): Promise<{
    session: Session
    matches: Match[]
    bracket: {
      round: number
      matches: Match[]
    }[]
  }> {
    const response = await apiClient.post<any>(
      `${API_ENDPOINTS.SESSIONS}/${sessionId}/tournament/single-elimination`,
      { seedParticipants }
    )
    return handleApiResponse(response)
  },

  /**
   * Get tournament standings for a session
   * @param sessionId - Session ID
   * @returns Promise with current standings
   */
  async getStandings(sessionId: string): Promise<{
    participantId: string
    participantName: string
    wins: number
    losses: number
    draws: number
    points: number
    pointsScored: number
    pointsTaken: number
    rank: number
  }[]> {
    const response = await apiClient.get<any>(`${API_ENDPOINTS.SESSIONS}/${sessionId}/standings`)
    return handleApiResponse(response)
  },
} as const

/**
 * Combined service object for easy importing
 */
export const sessionApi = {
  sessions: sessionService,
  matches: matchService,
  tournaments: tournamentService,
} as const
