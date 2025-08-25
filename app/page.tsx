'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Plus, Trophy, BarChart3 } from 'lucide-react'
import { BoardCard } from '@/components/boards/board-card'
import { BoardWizard } from '@/components/forms/board-wizard'
import { useBoardStore } from '@/lib/store/board-store'
import { useUIStore } from '@/lib/store/ui-store'

export default function Home() {
  const { boards, loading, error, fetchBoards } = useBoardStore()
  const { showToast } = useUIStore()
  const [showWizard, setShowWizard] = useState(false)

  useEffect(() => {
    fetchBoards()
  }, [fetchBoards])

  useEffect(() => {
    if (error) {
      showToast(error, 'error')
    }
  }, [error, showToast])

  const handleCreateBoard = () => {
    setShowWizard(true)
  }

  const handleEditBoard = (boardId: string) => {
    // TODO: Open edit board modal
    showToast('Edit board functionality coming soon!', 'info')
  }

  const handleDeleteBoard = async (boardId: string) => {
    // TODO: Implement delete with confirmation
    showToast('Delete board functionality coming soon!', 'info')
  }

  const handleShareBoard = (boardId: string) => {
    // TODO: Open share modal
    showToast('Share board functionality coming soon!', 'info')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Loading boards...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Trophy className="h-8 w-8 text-yellow-500" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              SmashTrack
            </h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Create and manage score tracking boards with real-time updates. 
            Perfect for tournaments, competitions, and collaborative scoring.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <Trophy className="h-6 w-6 text-yellow-500" />
              <div>
                <p className="text-2xl font-bold">{boards.filter(b => b.type === 'LEADERBOARD').length}</p>
                <p className="text-sm text-muted-foreground">Leaderboards</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <BarChart3 className="h-6 w-6 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{boards.filter(b => b.type === 'MULTISCORE').length}</p>
                <p className="text-sm text-muted-foreground">Multiscore Boards</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="h-6 w-6 rounded-full bg-green-500 flex items-center justify-center">
                <span className="text-white text-xs font-bold">T</span>
              </div>
              <div>
                <p className="text-2xl font-bold">{boards.length}</p>
                <p className="text-sm text-muted-foreground">Total Boards</p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">Your Boards</h2>
          <Button onClick={handleCreateBoard} className="gap-2">
            <Plus className="h-4 w-4" />
            Create Board
          </Button>
        </div>

        {/* Boards Grid */}
        {boards.length === 0 ? (
          <div className="text-center py-12">
            <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No boards yet</h3>
            <p className="text-muted-foreground mb-6">
              Create your first board to start tracking scores
            </p>
            <Button onClick={handleCreateBoard} className="gap-2">
              <Plus className="h-4 w-4" />
              Create Your First Board
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {boards.map((board) => (
              <BoardCard
                key={board.id}
                board={board}
                onEdit={() => handleEditBoard(board.id)}
                onDelete={() => handleDeleteBoard(board.id)}
                onShare={() => handleShareBoard(board.id)}
              />
            ))}
          </div>
        )}

        {/* Features */}
        <div className="mt-16">
          <h2 className="text-2xl font-semibold text-center mb-8">Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="bg-blue-100 dark:bg-blue-900/20 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                <Trophy className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-semibold mb-2">Leaderboards</h3>
              <p className="text-sm text-muted-foreground">
                Simple score tracking with automatic ranking and sorting
              </p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 dark:bg-green-900/20 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-semibold mb-2">Multiscore Boards</h3>
              <p className="text-sm text-muted-foreground">
                Track multiple metrics with custom columns and data types
              </p>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 dark:bg-purple-900/20 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                <div className="h-6 w-6 text-purple-600">⚡</div>
              </div>
              <h3 className="font-semibold mb-2">Real-time Updates</h3>
              <p className="text-sm text-muted-foreground">
                Live score updates across multiple devices and users
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Board Creation Wizard */}
      {showWizard && (
        <BoardWizard onClose={() => setShowWizard(false)} />
      )}
    </div>
  )
}
