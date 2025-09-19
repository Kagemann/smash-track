/**
 * Board service for managing boards, participants, and scores
 * Centralizes all board-related API calls with consistent error handling
 */

import { apiClient, handleApiResponse } from './api-client'
import { API_ENDPOINTS } from '@/lib/constants'
import type {
  Board,
  BoardWithLinks,
  CreateBoardInput,
  UpdateBoardInput,
  CreateParticipantInput,
  UpdateParticipantInput,
  CreateScoreData,
  UpdateScoreData,
  CreateColumnInput,
  Participant,
  Score,
  Column,
  ApiResponse,
} from '@/types'

/**
 * Board management service
 */
export const boardService = {
  /**
   * Get all boards
   * @returns Promise with array of boards
   */
  async getAll(): Promise<Board[]> {
    const response = await apiClient.get<Board[]>(API_ENDPOINTS.BOARDS)
    return handleApiResponse(response)
  },

  /**
   * Get a specific board by ID
   * @param id - Board ID
   * @returns Promise with board data including URLs
   */
  async getById(id: string): Promise<BoardWithLinks> {
    const response = await apiClient.get<BoardWithLinks>(`${API_ENDPOINTS.BOARDS}/${id}`)
    return handleApiResponse(response)
  },

  /**
   * Create a new board
   * @param data - Board creation data
   * @returns Promise with created board including URLs
   */
  async create(data: CreateBoardInput): Promise<BoardWithLinks> {
    const response = await apiClient.post<BoardWithLinks>(API_ENDPOINTS.BOARDS, data)
    return handleApiResponse(response)
  },

  /**
   * Update an existing board
   * @param id - Board ID
   * @param data - Board update data
   * @returns Promise with updated board
   */
  async update(id: string, data: UpdateBoardInput): Promise<Board> {
    const response = await apiClient.put<Board>(`${API_ENDPOINTS.BOARDS}/${id}`, data)
    return handleApiResponse(response)
  },

  /**
   * Delete a board
   * @param id - Board ID
   * @returns Promise that resolves when deletion is complete
   */
  async delete(id: string): Promise<void> {
    const response = await apiClient.delete<void>(`${API_ENDPOINTS.BOARDS}/${id}`)
    handleApiResponse(response)
  },

  /**
   * Get board statistics
   * @param id - Board ID
   * @returns Promise with board statistics
   */
  async getStatistics(id: string): Promise<{
    participantCount: number
    totalScores: number
    lastUpdated: string
    averageScore: number
  }> {
    const response = await apiClient.get<any>(`${API_ENDPOINTS.BOARDS}/${id}/stats`)
    return handleApiResponse(response)
  },
} as const

/**
 * Participant management service
 */
export const participantService = {
  /**
   * Add a participant to a board
   * @param data - Participant creation data
   * @returns Promise with created participant
   */
  async create(data: CreateParticipantInput): Promise<Participant> {
    const response = await apiClient.post<Participant>(API_ENDPOINTS.PARTICIPANTS, data)
    return handleApiResponse(response)
  },

  /**
   * Update a participant
   * @param id - Participant ID
   * @param data - Participant update data
   * @returns Promise with updated participant
   */
  async update(id: string, data: UpdateParticipantInput): Promise<Participant> {
    const response = await apiClient.put<Participant>(`${API_ENDPOINTS.PARTICIPANTS}/${id}`, data)
    return handleApiResponse(response)
  },

  /**
   * Remove a participant
   * @param id - Participant ID
   * @returns Promise that resolves when deletion is complete
   */
  async delete(id: string): Promise<void> {
    const response = await apiClient.delete<void>(`${API_ENDPOINTS.PARTICIPANTS}/${id}`)
    handleApiResponse(response)
  },

  /**
   * Bulk delete participants
   * @param ids - Array of participant IDs
   * @returns Promise that resolves when all deletions are complete
   */
  async bulkDelete(ids: string[]): Promise<void> {
    const deletePromises = ids.map(id => this.delete(id))
    await Promise.all(deletePromises)
  },
} as const

/**
 * Score management service
 */
export const scoreService = {
  /**
   * Get all scores for a board
   * @param boardId - Board ID
   * @returns Promise with array of scores
   */
  async getByBoard(boardId: string): Promise<Score[]> {
    const response = await apiClient.get<Score[]>(`${API_ENDPOINTS.SCORES}?boardId=${boardId}`)
    return handleApiResponse(response)
  },

  /**
   * Create or update a score
   * @param data - Score creation data
   * @returns Promise with created/updated score
   */
  async createOrUpdate(data: CreateScoreData): Promise<Score> {
    const response = await apiClient.post<Score>(API_ENDPOINTS.SCORES, data)
    return handleApiResponse(response)
  },

  /**
   * Update a specific score
   * @param id - Score ID
   * @param data - Score update data
   * @returns Promise with updated score
   */
  async update(id: string, data: UpdateScoreData): Promise<Score> {
    const response = await apiClient.put<Score>(`${API_ENDPOINTS.SCORES}/${id}`, data)
    return handleApiResponse(response)
  },

  /**
   * Delete a score
   * @param id - Score ID
   * @returns Promise that resolves when deletion is complete
   */
  async delete(id: string): Promise<void> {
    const response = await apiClient.delete<void>(`${API_ENDPOINTS.SCORES}/${id}`)
    handleApiResponse(response)
  },

  /**
   * Increment a score by a specific amount
   * @param participantId - Participant ID
   * @param boardId - Board ID
   * @param amount - Amount to increment (can be negative)
   * @param columnId - Column ID for multiscore boards
   * @returns Promise with updated score
   */
  async increment(
    participantId: string, 
    boardId: string, 
    amount: number, 
    columnId?: string
  ): Promise<Score> {
    const data: CreateScoreData = {
      participantId,
      boardId,
      value: amount,
      columnId,
    }
    return this.createOrUpdate(data)
  },
} as const

/**
 * Column management service
 */
export const columnService = {
  /**
   * Create a new column
   * @param data - Column creation data
   * @returns Promise with created column
   */
  async create(data: CreateColumnInput): Promise<Column> {
    const response = await apiClient.post<Column>('/api/columns', data)
    return handleApiResponse(response)
  },

  /**
   * Update a column
   * @param id - Column ID
   * @param data - Column update data
   * @returns Promise with updated column
   */
  async update(id: string, data: Partial<CreateColumnInput>): Promise<Column> {
    const response = await apiClient.put<Column>(`/api/columns/${id}`, data)
    return handleApiResponse(response)
  },

  /**
   * Delete a column
   * @param id - Column ID
   * @returns Promise that resolves when deletion is complete
   */
  async delete(id: string): Promise<void> {
    const response = await apiClient.delete<void>(`/api/columns/${id}`)
    handleApiResponse(response)
  },

  /**
   * Reorder columns
   * @param boardId - Board ID
   * @param columnIds - Array of column IDs in new order
   * @returns Promise that resolves when reordering is complete
   */
  async reorder(boardId: string, columnIds: string[]): Promise<Column[]> {
    const response = await apiClient.put<Column[]>(`/api/boards/${boardId}/columns/reorder`, { columnIds })
    return handleApiResponse(response)
  },
} as const

/**
 * Combined service object for easy importing
 */
export const boardApi = {
  boards: boardService,
  participants: participantService,
  scores: scoreService,
  columns: columnService,
} as const
