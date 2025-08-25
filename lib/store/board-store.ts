import { create } from 'zustand'
import { Board, CreateBoardData, UpdateBoardData } from '@/types'

interface BoardState {
  boards: Board[]
  currentBoard: Board | null
  loading: boolean
  error: string | null
}

interface BoardActions {
  setBoards: (boards: Board[]) => void
  setCurrentBoard: (board: Board | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  
  // Async actions
  fetchBoards: () => Promise<void>
  createBoard: (data: CreateBoardData) => Promise<Board | null>
  updateBoard: (id: string, data: UpdateBoardData) => Promise<Board | null>
  deleteBoard: (id: string) => Promise<boolean>
  fetchBoard: (id: string) => Promise<Board | null>
}

type BoardStore = BoardState & BoardActions

export const useBoardStore = create<BoardStore>((set, get) => ({
  // State
  boards: [],
  currentBoard: null,
  loading: false,
  error: null,

  // Actions
  setBoards: (boards) => set({ boards }),
  setCurrentBoard: (board) => set({ currentBoard: board }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),

  // Async actions
  fetchBoards: async () => {
    set({ loading: true, error: null })
    try {
      const response = await fetch('/api/boards')
      const data = await response.json()
      
      if (data.success) {
        set({ boards: data.data, loading: false })
      } else {
        set({ error: data.error, loading: false })
      }
    } catch (error) {
      set({ error: 'Failed to fetch boards', loading: false })
    }
  },

  createBoard: async (data) => {
    set({ loading: true, error: null })
    try {
      const response = await fetch('/api/boards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const result = await response.json()
      
      if (result.success) {
        const newBoard = result.data
        set((state) => ({
          boards: [newBoard, ...state.boards],
          currentBoard: newBoard,
          loading: false,
        }))
        return newBoard
      } else {
        set({ error: result.error, loading: false })
        return null
      }
    } catch (error) {
      set({ error: 'Failed to create board', loading: false })
      return null
    }
  },

  updateBoard: async (id, data) => {
    set({ loading: true, error: null })
    try {
      const response = await fetch(`/api/boards/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const result = await response.json()
      
      if (result.success) {
        const updatedBoard = result.data
        set((state) => ({
          boards: state.boards.map((board) =>
            board.id === id ? updatedBoard : board
          ),
          currentBoard: state.currentBoard?.id === id ? updatedBoard : state.currentBoard,
          loading: false,
        }))
        return updatedBoard
      } else {
        set({ error: result.error, loading: false })
        return null
      }
    } catch (error) {
      set({ error: 'Failed to update board', loading: false })
      return null
    }
  },

  deleteBoard: async (id) => {
    set({ loading: true, error: null })
    try {
      const response = await fetch(`/api/boards/${id}`, {
        method: 'DELETE',
      })
      const result = await response.json()
      
      if (result.success) {
        set((state) => ({
          boards: state.boards.filter((board) => board.id !== id),
          currentBoard: state.currentBoard?.id === id ? null : state.currentBoard,
          loading: false,
        }))
        return true
      } else {
        set({ error: result.error, loading: false })
        return false
      }
    } catch (error) {
      set({ error: 'Failed to delete board', loading: false })
      return false
    }
  },

  fetchBoard: async (id) => {
    set({ loading: true, error: null })
    try {
      const response = await fetch(`/api/boards/${id}`)
      const data = await response.json()
      
      if (data.success) {
        set({ currentBoard: data.data, loading: false })
        return data.data
      } else {
        set({ error: data.error, loading: false })
        return null
      }
    } catch (error) {
      set({ error: 'Failed to fetch board', loading: false })
      return null
    }
  },
}))
