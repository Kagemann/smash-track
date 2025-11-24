import { create } from 'zustand'
import { Tournament, CreateTournamentData, UpdateTournamentData } from '@/types'
import { tournamentService } from '@/lib/services/tournament-service'

interface TournamentState {
  tournaments: Tournament[]
  currentTournament: Tournament | null
  loading: boolean
  error: string | null
}

interface TournamentActions {
  setTournaments: (tournaments: Tournament[]) => void
  setCurrentTournament: (tournament: Tournament | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void

  // Async actions
  fetchTournaments: (boardId: string) => Promise<void>
  fetchTournament: (id: string) => Promise<Tournament | null>
  createTournament: (data: CreateTournamentData) => Promise<Tournament | null>
  updateTournament: (id: string, data: UpdateTournamentData) => Promise<Tournament | null>
  addPlayers: (tournamentId: string, participantIds: string[]) => Promise<boolean>
  removePlayer: (tournamentId: string, participantId: string) => Promise<boolean>
  drawGroups: (tournamentId: string, assignments?: Record<string, number>) => Promise<boolean>
  generateSchedule: (tournamentId: string) => Promise<boolean>
  advanceToKnockout: (tournamentId: string) => Promise<boolean>
}

type TournamentStore = TournamentState & TournamentActions

export const useTournamentStore = create<TournamentStore>((set, get) => ({
  // State
  tournaments: [],
  currentTournament: null,
  loading: false,
  error: null,

  // Actions
  setTournaments: (tournaments) => set({ tournaments }),
  setCurrentTournament: (tournament) => set({ currentTournament: tournament }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),

  // Async actions
  fetchTournaments: async (boardId) => {
    set({ loading: true, error: null })
    try {
      const tournaments = await tournamentService.getByBoard(boardId)
      set({ tournaments, loading: false })
    } catch (error) {
      set({ error: 'Failed to fetch tournaments', loading: false })
    }
  },

  fetchTournament: async (id) => {
    set({ loading: true, error: null })
    try {
      const tournament = await tournamentService.getById(id)
      set({ currentTournament: tournament, loading: false })
      return tournament
    } catch (error) {
      set({ error: 'Failed to fetch tournament', loading: false })
      return null
    }
  },

  createTournament: async (data) => {
    set({ loading: true, error: null })
    try {
      const tournament = await tournamentService.create(data)
      set((state) => ({
        tournaments: [tournament, ...state.tournaments],
        currentTournament: tournament,
        loading: false,
      }))
      return tournament
    } catch (error) {
      set({ error: 'Failed to create tournament', loading: false })
      return null
    }
  },

  updateTournament: async (id, data) => {
    set({ loading: true, error: null })
    try {
      const tournament = await tournamentService.update(id, data)
      set((state) => ({
        tournaments: state.tournaments.map((t) => (t.id === id ? tournament : t)),
        currentTournament:
          state.currentTournament?.id === id ? tournament : state.currentTournament,
        loading: false,
      }))
      return tournament
    } catch (error) {
      set({ error: 'Failed to update tournament', loading: false })
      return null
    }
  },

  addPlayers: async (tournamentId, participantIds) => {
    set({ loading: true, error: null })
    try {
      await tournamentService.addPlayers(tournamentId, participantIds)
      // Refresh tournament
      await get().fetchTournament(tournamentId)
      set({ loading: false })
      return true
    } catch (error: any) {
      const errorMessage = error?.message || error?.error || 'Failed to add players'
      console.error('Error adding players:', error)
      set({ error: errorMessage, loading: false })
      return false
    }
  },

  removePlayer: async (tournamentId, participantId) => {
    set({ loading: true, error: null })
    try {
      await tournamentService.removePlayer(tournamentId, participantId)
      // Refresh tournament
      await get().fetchTournament(tournamentId)
      set({ loading: false })
      return true
    } catch (error) {
      set({ error: 'Failed to remove player', loading: false })
      return false
    }
  },

  drawGroups: async (tournamentId, assignments) => {
    set({ loading: true, error: null })
    try {
      await tournamentService.drawGroups(tournamentId, assignments)
      // Refresh tournament
      await get().fetchTournament(tournamentId)
      set({ loading: false })
      return true
    } catch (error) {
      set({ error: 'Failed to draw groups', loading: false })
      return false
    }
  },

  generateSchedule: async (tournamentId) => {
    set({ loading: true, error: null })
    try {
      await tournamentService.generateSchedule(tournamentId)
      // Refresh tournament
      await get().fetchTournament(tournamentId)
      set({ loading: false })
      return true
    } catch (error) {
      set({ error: 'Failed to generate schedule', loading: false })
      return false
    }
  },

  advanceToKnockout: async (tournamentId) => {
    set({ loading: true, error: null })
    try {
      await tournamentService.advanceToKnockout(tournamentId)
      // Refresh tournament
      await get().fetchTournament(tournamentId)
      set({ loading: false })
      return true
    } catch (error) {
      set({ error: 'Failed to advance to knockout', loading: false })
      return false
    }
  },
}))

