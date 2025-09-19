/**
 * Board state management store
 * Manages board-related state using centralized API services
 */

import { create } from 'zustand'
import { boardApi, ApiError } from '@/lib/services'
import type { Board, CreateBoardInput, UpdateBoardInput, BoardWithLinks } from '@/types'

/**
 * Board store state interface
 */
interface BoardState {
  boards: Board[]
  currentBoard: BoardWithLinks | null
  loading: boolean
  error: string | null
}

/**
 * Board store actions interface
 */
interface BoardActions {
  // State setters
  setBoards: (boards: Board[]) => void
  setCurrentBoard: (board: BoardWithLinks | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  clearError: () => void
  
  // Async operations
  fetchBoards: () => Promise<void>
  fetchBoard: (id: string) => Promise<BoardWithLinks | null>
  createBoard: (data: CreateBoardInput) => Promise<BoardWithLinks | null>
  updateBoard: (id: string, data: UpdateBoardInput) => Promise<Board | null>
  deleteBoard: (id: string) => Promise<boolean>
  
  // Utility actions
  reset: () => void
}

type BoardStore = BoardState & BoardActions

export const useBoardStore = create<BoardStore>((set, get) => ({
  // Initial state
  boards: [],
  currentBoard: null,
  loading: false,
  error: null,

  // State setters
  setBoards: (boards) => set({ boards }),
  setCurrentBoard: (board) => set({ currentBoard: board }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),

  // Async operations
  fetchBoards: async () => {
    set({ loading: true, error: null })
    try {
      const boards = await boardApi.boards.getAll()
      set({ boards, loading: false })
    } catch (error) {
      const errorMessage = error instanceof ApiError 
        ? error.message 
        : 'Failed to fetch boards'
      set({ error: errorMessage, loading: false })
    }
  },

  createBoard: async (data) => {
    set({ loading: true, error: null })
    try {
      const newBoard = await boardApi.boards.create(data)
      set((state) => ({
        boards: [newBoard, ...state.boards],
        currentBoard: newBoard,
        loading: false,
      }))
      return newBoard
    } catch (error) {
      const errorMessage = error instanceof ApiError 
        ? error.message 
        : 'Failed to create board'
      set({ error: errorMessage, loading: false })
      return null
    }
  },

  updateBoard: async (id, data) => {
    set({ loading: true, error: null })
    try {
      const updatedBoard = await boardApi.boards.update(id, data)
      set((state) => ({
        boards: state.boards.map((board) =>
          board.id === id ? updatedBoard : board
        ),
        currentBoard: state.currentBoard?.id === id 
          ? { ...state.currentBoard, ...updatedBoard }
          : state.currentBoard,
        loading: false,
      }))
      return updatedBoard
    } catch (error) {
      const errorMessage = error instanceof ApiError 
        ? error.message 
        : 'Failed to update board'
      set({ error: errorMessage, loading: false })
      return null
    }
  },

  deleteBoard: async (id) => {
    set({ loading: true, error: null })
    try {
      await boardApi.boards.delete(id)
      set((state) => ({
        boards: state.boards.filter((board) => board.id !== id),
        currentBoard: state.currentBoard?.id === id ? null : state.currentBoard,
        loading: false,
      }))
      return true
    } catch (error) {
      const errorMessage = error instanceof ApiError 
        ? error.message 
        : 'Failed to delete board'
      set({ error: errorMessage, loading: false })
      return false
    }
  },

  fetchBoard: async (id) => {
    set({ loading: true, error: null })
    try {
      const board = await boardApi.boards.getById(id)
      set({ currentBoard: board, loading: false })
      return board
    } catch (error) {
      const errorMessage = error instanceof ApiError 
        ? error.message 
        : 'Failed to fetch board'
      set({ error: errorMessage, loading: false })
      return null
    }
  },

  // Utility actions
  reset: () => set({ 
    boards: [], 
    currentBoard: null, 
    loading: false, 
    error: null 
  }),
}))
