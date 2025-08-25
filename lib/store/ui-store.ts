import { create } from 'zustand'

interface UIState {
  // Modals and drawers
  sidebarOpen: boolean
  historyOpen: boolean
  shareMenuOpen: boolean
  createBoardModalOpen: boolean
  addParticipantModalOpen: boolean
  editBoardModalOpen: boolean
  
  // Loading states
  isUpdatingScore: boolean
  isAddingParticipant: boolean
  isDeletingParticipant: boolean
  
  // Toast messages
  toast: {
    message: string
    type: 'success' | 'error' | 'warning' | 'info'
    visible: boolean
  } | null
}

interface UIActions {
  // Toggle functions
  toggleSidebar: () => void
  toggleHistory: () => void
  toggleShareMenu: () => void
  toggleCreateBoardModal: () => void
  toggleAddParticipantModal: () => void
  toggleEditBoardModal: () => void
  
  // Set functions
  setSidebarOpen: (open: boolean) => void
  setHistoryOpen: (open: boolean) => void
  setShareMenuOpen: (open: boolean) => void
  setCreateBoardModalOpen: (open: boolean) => void
  setAddParticipantModalOpen: (open: boolean) => void
  setEditBoardModalOpen: (open: boolean) => void
  
  // Loading states
  setIsUpdatingScore: (loading: boolean) => void
  setIsAddingParticipant: (loading: boolean) => void
  setIsDeletingParticipant: (loading: boolean) => void
  
  // Toast functions
  showToast: (message: string, type?: 'success' | 'error' | 'warning' | 'info') => void
  hideToast: () => void
  
  // Reset all modals
  closeAllModals: () => void
}

type UIStore = UIState & UIActions

export const useUIStore = create<UIStore>((set, get) => ({
  // State
  sidebarOpen: false,
  historyOpen: false,
  shareMenuOpen: false,
  createBoardModalOpen: false,
  addParticipantModalOpen: false,
  editBoardModalOpen: false,
  
  isUpdatingScore: false,
  isAddingParticipant: false,
  isDeletingParticipant: false,
  
  toast: null,

  // Toggle functions
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  toggleHistory: () => set((state) => ({ historyOpen: !state.historyOpen })),
  toggleShareMenu: () => set((state) => ({ shareMenuOpen: !state.shareMenuOpen })),
  toggleCreateBoardModal: () => set((state) => ({ createBoardModalOpen: !state.createBoardModalOpen })),
  toggleAddParticipantModal: () => set((state) => ({ addParticipantModalOpen: !state.addParticipantModalOpen })),
  toggleEditBoardModal: () => set((state) => ({ editBoardModalOpen: !state.editBoardModalOpen })),

  // Set functions
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setHistoryOpen: (open) => set({ historyOpen: open }),
  setShareMenuOpen: (open) => set({ shareMenuOpen: open }),
  setCreateBoardModalOpen: (open) => set({ createBoardModalOpen: open }),
  setAddParticipantModalOpen: (open) => set({ addParticipantModalOpen: open }),
  setEditBoardModalOpen: (open) => set({ editBoardModalOpen: open }),

  // Loading states
  setIsUpdatingScore: (loading) => set({ isUpdatingScore: loading }),
  setIsAddingParticipant: (loading) => set({ isAddingParticipant: loading }),
  setIsDeletingParticipant: (loading) => set({ isDeletingParticipant: loading }),

  // Toast functions
  showToast: (message, type = 'info') => {
    set({
      toast: {
        message,
        type,
        visible: true,
      },
    })
    
    // Auto-hide after 3 seconds
    setTimeout(() => {
      get().hideToast()
    }, 3000)
  },

  hideToast: () => set({ toast: null }),

  // Close all modals
  closeAllModals: () => set({
    sidebarOpen: false,
    historyOpen: false,
    shareMenuOpen: false,
    createBoardModalOpen: false,
    addParticipantModalOpen: false,
    editBoardModalOpen: false,
  }),
}))
