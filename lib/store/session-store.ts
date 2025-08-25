import { create } from 'zustand'
import { Session, CreateSessionData, UpdateSessionData } from '@/types'

interface SessionState {
  sessions: Session[]
  currentSession: Session | null
  loading: boolean
  error: string | null
}

interface SessionActions {
  setSessions: (sessions: Session[]) => void
  setCurrentSession: (session: Session | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  
  // Async actions
  fetchSessions: (boardId: string) => Promise<void>
  createSession: (data: CreateSessionData) => Promise<Session | null>
  updateSession: (id: string, data: UpdateSessionData) => Promise<Session | null>
  deleteSession: (id: string) => Promise<boolean>
  fetchSession: (id: string) => Promise<Session | null>
}

type SessionStore = SessionState & SessionActions

export const useSessionStore = create<SessionStore>((set, get) => ({
  // State
  sessions: [],
  currentSession: null,
  loading: false,
  error: null,

  // Actions
  setSessions: (sessions) => set({ sessions }),
  setCurrentSession: (session) => set({ currentSession: session }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),

  // Async actions
  fetchSessions: async (boardId) => {
    set({ loading: true, error: null })
    try {
      const response = await fetch(`/api/sessions?boardId=${boardId}`)
      const data = await response.json()
      
      if (data.success) {
        set({ sessions: data.data, loading: false })
      } else {
        set({ error: data.error, loading: false })
      }
    } catch (error) {
      set({ error: 'Failed to fetch sessions', loading: false })
    }
  },

  createSession: async (data) => {
    set({ loading: true, error: null })
    try {
      const response = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const result = await response.json()
      
      if (result.success) {
        const newSession = result.data
        set((state) => ({
          sessions: [newSession, ...state.sessions],
          currentSession: newSession,
          loading: false,
        }))
        return newSession
      } else {
        set({ error: result.error, loading: false })
        return null
      }
    } catch (error) {
      set({ error: 'Failed to create session', loading: false })
      return null
    }
  },

  updateSession: async (id, data) => {
    set({ loading: true, error: null })
    try {
      const response = await fetch(`/api/sessions/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const result = await response.json()
      
      if (result.success) {
        const updatedSession = result.data
        set((state) => ({
          sessions: state.sessions.map((session) =>
            session.id === id ? updatedSession : session
          ),
          currentSession: state.currentSession?.id === id ? updatedSession : state.currentSession,
          loading: false,
        }))
        return updatedSession
      } else {
        set({ error: result.error, loading: false })
        return null
      }
    } catch (error) {
      set({ error: 'Failed to update session', loading: false })
      return null
    }
  },

  deleteSession: async (id) => {
    set({ loading: true, error: null })
    try {
      const response = await fetch(`/api/sessions/${id}`, {
        method: 'DELETE',
      })
      const result = await response.json()
      
      if (result.success) {
        set((state) => ({
          sessions: state.sessions.filter((session) => session.id !== id),
          currentSession: state.currentSession?.id === id ? null : state.currentSession,
          loading: false,
        }))
        return true
      } else {
        set({ error: result.error, loading: false })
        return false
      }
    } catch (error) {
      set({ error: 'Failed to delete session', loading: false })
      return false
    }
  },

  fetchSession: async (id) => {
    set({ loading: true, error: null })
    try {
      const response = await fetch(`/api/sessions/${id}`)
      const data = await response.json()
      
      if (data.success) {
        set({ currentSession: data.data, loading: false })
        return data.data
      } else {
        set({ error: data.error, loading: false })
        return null
      }
    } catch (error) {
      set({ error: 'Failed to fetch session', loading: false })
      return null
    }
  },
}))
