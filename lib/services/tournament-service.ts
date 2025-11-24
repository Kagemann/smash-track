/**
 * Tournament management service
 * Handles tournament creation, group management, and knockout stages
 */

import { apiClient, handleApiResponse } from './api-client'
import { API_ENDPOINTS } from '@/lib/constants'
import type {
  Tournament,
  Match,
  CreateTournamentInput,
  UpdateTournamentInput,
  GroupStanding,
  ApiResponse,
} from '@/types'

/**
 * Tournament management service
 */
export const tournamentService = {
  /**
   * Get all tournaments for a board
   * @param boardId - Board ID
   * @returns Promise with array of tournaments
   */
  async getByBoard(boardId: string): Promise<Tournament[]> {
    const response = await apiClient.get<Tournament[]>(
      `${API_ENDPOINTS.TOURNAMENTS}?boardId=${boardId}`
    )
    return handleApiResponse(response)
  },

  /**
   * Get a specific tournament by ID
   * @param id - Tournament ID
   * @returns Promise with tournament data including groups, participants, matches
   */
  async getById(id: string): Promise<Tournament> {
    const response = await apiClient.get<Tournament>(`${API_ENDPOINTS.TOURNAMENTS}/${id}`)
    return handleApiResponse(response)
  },

  /**
   * Create a new tournament
   * @param data - Tournament creation data
   * @returns Promise with created tournament
   */
  async create(data: CreateTournamentInput): Promise<Tournament> {
    const response = await apiClient.post<Tournament>(API_ENDPOINTS.TOURNAMENTS, data)
    return handleApiResponse(response)
  },

  /**
   * Update an existing tournament
   * @param id - Tournament ID
   * @param data - Tournament update data
   * @returns Promise with updated tournament
   */
  async update(id: string, data: UpdateTournamentInput): Promise<Tournament> {
    const response = await apiClient.patch<Tournament>(`${API_ENDPOINTS.TOURNAMENTS}/${id}`, data)
    return handleApiResponse(response)
  },

  /**
   * Add players to a tournament
   * @param tournamentId - Tournament ID
   * @param participantIds - Array of participant IDs
   * @returns Promise that resolves when players are added
   */
  async addPlayers(tournamentId: string, participantIds: string[]): Promise<void> {
    const response = await apiClient.post<void>(
      `${API_ENDPOINTS.TOURNAMENTS}/${tournamentId}/players`,
      { participantIds }
    )
    handleApiResponse(response)
  },

  /**
   * Remove a player from a tournament
   * @param tournamentId - Tournament ID
   * @param participantId - Participant ID
   * @returns Promise that resolves when player is removed
   */
  async removePlayer(tournamentId: string, participantId: string): Promise<void> {
    const response = await apiClient.delete<void>(
      `${API_ENDPOINTS.TOURNAMENTS}/${tournamentId}/players?participantId=${participantId}`
    )
    handleApiResponse(response)
  },

  /**
   * Draw players into groups randomly or manually
   * @param tournamentId - Tournament ID
   * @param assignments - Optional manual assignments (participantId -> groupIndex)
   * @returns Promise that resolves when groups are drawn
   */
  async drawGroups(tournamentId: string, assignments?: Record<string, number>): Promise<void> {
    const response = await apiClient.post<void>(
      `${API_ENDPOINTS.TOURNAMENTS}/${tournamentId}/draw`,
      assignments ? { assignments } : {}
    )
    handleApiResponse(response)
  },

  /**
   * Generate group match schedule
   * @param tournamentId - Tournament ID
   * @returns Promise that resolves when schedule is generated
   */
  async generateSchedule(tournamentId: string): Promise<void> {
    const response = await apiClient.post<void>(
      `${API_ENDPOINTS.TOURNAMENTS}/${tournamentId}/schedule`
    )
    handleApiResponse(response)
  },

  /**
   * Get group standings
   * @param tournamentId - Tournament ID
   * @returns Promise with array of group standings
   */
  async getGroupStandings(tournamentId: string): Promise<GroupStanding[][]> {
    const response = await apiClient.get<Array<{ group: any; standings: GroupStanding[] }>>(
      `${API_ENDPOINTS.TOURNAMENTS}/${tournamentId}/groups`
    )
    const data = handleApiResponse(response)
    return data.map((g) => g.standings)
  },

  /**
   * Advance tournament to knockout stage
   * @param tournamentId - Tournament ID
   * @returns Promise that resolves when advancement is complete
   */
  async advanceToKnockout(tournamentId: string): Promise<void> {
    const response = await apiClient.post<void>(
      `${API_ENDPOINTS.TOURNAMENTS}/${tournamentId}/advance`
    )
    handleApiResponse(response)
  },

  /**
   * Get knockout bracket
   * @param tournamentId - Tournament ID
   * @returns Promise with knockout matches (semifinals and finals)
   */
  async getKnockoutBracket(tournamentId: string): Promise<{
    semifinals: Match[]
    finals: Match[]
  }> {
    const response = await apiClient.get<{ semifinals: Match[]; finals: Match[] }>(
      `${API_ENDPOINTS.TOURNAMENTS}/${tournamentId}/knockout`
    )
    return handleApiResponse(response)
  },
} as const

