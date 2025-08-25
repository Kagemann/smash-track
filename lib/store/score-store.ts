import { create } from 'zustand'
import { Score, CreateScoreData, UpdateScoreData } from '@/types'

interface ScoreState {
  scores: Score[]
  loading: boolean
  error: string | null
}

interface ScoreActions {
  setScores: (scores: Score[]) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  
  // Async actions
  fetchScores: (boardId: string, participantId?: string, columnId?: string) => Promise<void>
  createScore: (data: CreateScoreData) => Promise<Score | null>
  updateScore: (id: string, data: UpdateScoreData) => Promise<Score | null>
  deleteScore: (id: string) => Promise<boolean>
  
  // Real-time actions
  addScore: (score: Score) => void
  updateScoreInStore: (id: string, score: Score) => void
  removeScore: (id: string) => void
}

type ScoreStore = ScoreState & ScoreActions

export const useScoreStore = create<ScoreStore>((set, get) => ({
  // State
  scores: [],
  loading: false,
  error: null,

  // Actions
  setScores: (scores) => set({ scores }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),

  // Async actions
  fetchScores: async (boardId, participantId, columnId) => {
    set({ loading: true, error: null })
    try {
      const params = new URLSearchParams({ boardId })
      if (participantId) params.append('participantId', participantId)
      if (columnId) params.append('columnId', columnId)
      
      const response = await fetch(`/api/scores?${params}`)
      const data = await response.json()
      
      if (data.success) {
        set({ scores: data.data, loading: false })
      } else {
        set({ error: data.error, loading: false })
      }
    } catch (error) {
      set({ error: 'Failed to fetch scores', loading: false })
    }
  },

  createScore: async (data) => {
    set({ loading: true, error: null })
    try {
      const response = await fetch('/api/scores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const result = await response.json()
      
      if (result.success) {
        const newScore = result.data
        set((state) => ({
          scores: [newScore, ...state.scores],
          loading: false,
        }))
        return newScore
      } else {
        set({ error: result.error, loading: false })
        return null
      }
    } catch (error) {
      set({ error: 'Failed to create score', loading: false })
      return null
    }
  },

  updateScore: async (id, data) => {
    set({ loading: true, error: null })
    try {
      const response = await fetch(`/api/scores/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const result = await response.json()
      
      if (result.success) {
        const updatedScore = result.data
        set((state) => ({
          scores: state.scores.map((score) =>
            score.id === id ? updatedScore : score
          ),
          loading: false,
        }))
        return updatedScore
      } else {
        set({ error: result.error, loading: false })
        return null
      }
    } catch (error) {
      set({ error: 'Failed to update score', loading: false })
      return null
    }
  },

  deleteScore: async (id) => {
    set({ loading: true, error: null })
    try {
      const response = await fetch(`/api/scores/${id}`, {
        method: 'DELETE',
      })
      const result = await response.json()
      
      if (result.success) {
        set((state) => ({
          scores: state.scores.filter((score) => score.id !== id),
          loading: false,
        }))
        return true
      } else {
        set({ error: result.error, loading: false })
        return false
      }
    } catch (error) {
      set({ error: 'Failed to delete score', loading: false })
      return false
    }
  },

  // Real-time actions
  addScore: (score) => {
    set((state) => ({
      scores: [score, ...state.scores],
    }))
  },

  updateScoreInStore: (id, score) => {
    set((state) => ({
      scores: state.scores.map((s) => (s.id === id ? score : s)),
    }))
  },

  removeScore: (id) => {
    set((state) => ({
      scores: state.scores.filter((score) => score.id !== id),
    }))
  },
}))
