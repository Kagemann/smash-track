/**
 * Score state management store  
 * Manages score-related state using centralized API services
 */

import { create } from 'zustand'
import { boardApi, ApiError } from '@/lib/services'
import type { Score, CreateScoreData, UpdateScoreData } from '@/types'

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
      const scores = await boardApi.scores.getByBoard(boardId)
      
      // Filter by participant and column if specified
      let filteredScores = scores
      if (participantId) {
        filteredScores = filteredScores.filter(score => score.participantId === participantId)
      }
      if (columnId) {
        filteredScores = filteredScores.filter(score => score.columnId === columnId)
      }
      
      set({ scores: filteredScores, loading: false })
    } catch (error) {
      const errorMessage = error instanceof ApiError 
        ? error.message 
        : 'Failed to fetch scores'
      set({ error: errorMessage, loading: false })
    }
  },

  createScore: async (data) => {
    set({ loading: true, error: null })
    try {
      const newScore = await boardApi.scores.createOrUpdate(data)
      set((state) => ({
        scores: [newScore, ...state.scores],
        loading: false,
      }))
      return newScore
    } catch (error) {
      const errorMessage = error instanceof ApiError 
        ? error.message 
        : 'Failed to create score'
      set({ error: errorMessage, loading: false })
      return null
    }
  },

  updateScore: async (id, data) => {
    set({ loading: true, error: null })
    try {
      const updatedScore = await boardApi.scores.update(id, data)
      set((state) => ({
        scores: state.scores.map((score) =>
          score.id === id ? updatedScore : score
        ),
        loading: false,
      }))
      return updatedScore
    } catch (error) {
      const errorMessage = error instanceof ApiError 
        ? error.message 
        : 'Failed to update score'
      set({ error: errorMessage, loading: false })
      return null
    }
  },

  deleteScore: async (id) => {
    set({ loading: true, error: null })
    try {
      await boardApi.scores.delete(id)
      set((state) => ({
        scores: state.scores.filter((score) => score.id !== id),
        loading: false,
      }))
      return true
    } catch (error) {
      const errorMessage = error instanceof ApiError 
        ? error.message 
        : 'Failed to delete score'
      set({ error: errorMessage, loading: false })
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
