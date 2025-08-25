import { create } from 'zustand'
import { Match, CreateMatchData, UpdateMatchData, CompleteMatchData } from '@/types'

interface MatchState {
  matches: Match[]
  currentMatch: Match | null
  loading: boolean
  error: string | null
}

interface MatchActions {
  setMatches: (matches: Match[]) => void
  setCurrentMatch: (match: Match | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  
  // Async actions
  fetchMatches: (sessionId: string) => Promise<void>
  createMatch: (data: CreateMatchData) => Promise<Match | null>
  updateMatch: (id: string, data: UpdateMatchData) => Promise<Match | null>
  completeMatch: (id: string, data: CompleteMatchData) => Promise<Match | null>
  deleteMatch: (id: string) => Promise<boolean>
  fetchMatch: (id: string) => Promise<Match | null>
}

type MatchStore = MatchState & MatchActions

export const useMatchStore = create<MatchStore>((set, get) => ({
  // State
  matches: [],
  currentMatch: null,
  loading: false,
  error: null,

  // Actions
  setMatches: (matches) => set({ matches }),
  setCurrentMatch: (match) => set({ currentMatch: match }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),

  // Async actions
  fetchMatches: async (sessionId) => {
    set({ loading: true, error: null })
    try {
      const response = await fetch(`/api/matches?sessionId=${sessionId}`)
      const data = await response.json()
      
      if (data.success) {
        set({ matches: data.data, loading: false })
      } else {
        set({ error: data.error, loading: false })
      }
    } catch (error) {
      set({ error: 'Failed to fetch matches', loading: false })
    }
  },

  createMatch: async (data) => {
    set({ loading: true, error: null })
    try {
      const response = await fetch('/api/matches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const result = await response.json()
      
      if (result.success) {
        const newMatch = result.data
        set((state) => ({
          matches: [newMatch, ...state.matches],
          currentMatch: newMatch,
          loading: false,
        }))
        return newMatch
      } else {
        set({ error: result.error, loading: false })
        return null
      }
    } catch (error) {
      set({ error: 'Failed to create match', loading: false })
      return null
    }
  },

  updateMatch: async (id, data) => {
    set({ loading: true, error: null })
    try {
      const response = await fetch(`/api/matches/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const result = await response.json()
      
      if (result.success) {
        const updatedMatch = result.data
        set((state) => ({
          matches: state.matches.map((match) =>
            match.id === id ? updatedMatch : match
          ),
          currentMatch: state.currentMatch?.id === id ? updatedMatch : state.currentMatch,
          loading: false,
        }))
        return updatedMatch
      } else {
        set({ error: result.error, loading: false })
        return null
      }
    } catch (error) {
      set({ error: 'Failed to update match', loading: false })
      return null
    }
  },

  completeMatch: async (id, data) => {
    set({ loading: true, error: null })
    try {
      const response = await fetch(`/api/matches/${id}?action=complete`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const result = await response.json()
      
      if (result.success) {
        const completedMatch = result.data
        set((state) => ({
          matches: state.matches.map((match) =>
            match.id === id ? completedMatch : match
          ),
          currentMatch: state.currentMatch?.id === id ? completedMatch : state.currentMatch,
          loading: false,
        }))
        
        // Refresh the score store to show updated leaderboard
        // We need to import the score store and refresh it
        // This will be handled by the component that calls completeMatch
        return completedMatch
      } else {
        set({ error: result.error, loading: false })
        return null
      }
    } catch (error) {
      set({ error: 'Failed to complete match', loading: false })
      return null
    }
  },

  deleteMatch: async (id) => {
    set({ loading: true, error: null })
    try {
      const response = await fetch(`/api/matches/${id}`, {
        method: 'DELETE',
      })
      const result = await response.json()
      
      if (result.success) {
        set((state) => ({
          matches: state.matches.filter((match) => match.id !== id),
          currentMatch: state.currentMatch?.id === id ? null : state.currentMatch,
          loading: false,
        }))
        return true
      } else {
        set({ error: result.error, loading: false })
        return false
      }
    } catch (error) {
      set({ error: 'Failed to delete match', loading: false })
      return false
    }
  },

  fetchMatch: async (id) => {
    set({ loading: true, error: null })
    try {
      const response = await fetch(`/api/matches/${id}`)
      const data = await response.json()
      
      if (data.success) {
        set({ currentMatch: data.data, loading: false })
        return data.data
      } else {
        set({ error: data.error, loading: false })
        return null
      }
    } catch (error) {
      set({ error: 'Failed to fetch match', loading: false })
      return null
    }
  },
}))
