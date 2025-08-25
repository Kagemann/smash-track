'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, ArrowLeft, Calendar, Trophy } from 'lucide-react'
import { SessionCard } from '@/components/sessions/session-card'
import { useBoardStore } from '@/lib/store/board-store'
import { useSessionStore } from '@/lib/store/session-store'
import { useUIStore } from '@/lib/store/ui-store'
import { Board, Session } from '@/types'

export default function SessionsPage() {
  const params = useParams()
  const router = useRouter()
  const [boardId, setBoardId] = useState<string | null>(null)
  const [board, setBoard] = useState<Board | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  
  const { fetchBoard, currentBoard, loading: boardLoading, error: boardError } = useBoardStore()
  const { sessions, loading: sessionsLoading, error: sessionsError, fetchSessions, createSession, deleteSession, updateSession } = useSessionStore()
  const { showToast } = useUIStore()

  useEffect(() => {
    const getBoardId = async () => {
      const resolvedParams = await params
      const id = resolvedParams.id as string
      setBoardId(id)
    }
    getBoardId()
  }, [params])

  useEffect(() => {
    if (boardId) {
      fetchBoard(boardId)
      fetchSessions(boardId)
    }
  }, [boardId, fetchBoard, fetchSessions])

  useEffect(() => {
    if (currentBoard) {
      setBoard(currentBoard)
    }
  }, [currentBoard])

  useEffect(() => {
    if (boardError) {
      showToast(boardError, 'error')
    }
  }, [boardError, showToast])

  useEffect(() => {
    if (sessionsError) {
      showToast(sessionsError, 'error')
    }
  }, [sessionsError, showToast])

  const handleCreateSession = async (data: { 
    name: string; 
    description?: string;
    winPoints?: number;
    lossPoints?: number;
    drawPoints?: number;
  }) => {
    if (!boardId) return

    const newSession = await createSession({
      name: data.name,
      description: data.description,
      boardId: boardId,
      winPoints: data.winPoints || 3,
      lossPoints: data.lossPoints || 0,
      drawPoints: data.drawPoints || 1,
    })

    if (newSession) {
      showToast('Session created successfully!', 'success')
      setShowCreateForm(false)
    }
  }

  const handleDeleteSession = async (sessionId: string) => {
    const success = await deleteSession(sessionId)
    if (success) {
      showToast('Session deleted successfully!', 'success')
    }
  }

  const handleCloseSession = async (sessionId: string) => {
    const success = await updateSession(sessionId, { status: 'COMPLETED' })
    if (success) {
      showToast('Session closed successfully!', 'success')
    }
  }

  const handleViewSession = (sessionId: string) => {
    router.push(`/boards/${boardId}/sessions/${sessionId}`)
  }

  if (boardLoading || sessionsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Loading sessions...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!board) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Board not found</h1>
            <p className="text-muted-foreground mb-6">
              The board you're looking for doesn't exist or has been deleted.
            </p>
            <Button onClick={() => router.push('/')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header with Logo */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => router.push('/')}
                className="gap-2 font-semibold text-lg"
              >
                🏆 SmashTrack
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                onClick={() => router.push(`/boards/${boardId}/admin`)}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Board
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">{board.name}</h1>
            <p className="text-muted-foreground">Session Management</p>
          </div>
          <Button onClick={() => setShowCreateForm(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Create Session
          </Button>
        </div>

        {/* Board Info */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Board Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-2">
                <Badge variant="secondary">
                  {board.type === 'LEADERBOARD' ? 'Leaderboard' : 'Multiscore'}
                </Badge>
                <span className="text-sm text-muted-foreground">Type</span>
              </div>
              <div className="flex items-center gap-2">
                <Trophy className="h-4 w-4" />
                <span className="text-sm text-muted-foreground">
                  {board.participants.length} participants
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span className="text-sm text-muted-foreground">
                  {sessions.length} sessions
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sessions */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Sessions</h2>
            <Badge variant="outline">
              {sessions.length} total
            </Badge>
          </div>

          {sessions.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No sessions yet</h3>
                <p className="text-muted-foreground mb-6">
                  Create your first session to start organizing matches
                </p>
                <Button onClick={() => setShowCreateForm(true)} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Create Your First Session
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sessions.map((session) => (
                <SessionCard
                  key={session.id}
                  session={{
                    ...session,
                    board: board // Pass the board data to show all columns
                  }}
                  onEdit={() => handleViewSession(session.id)}
                  onDelete={() => handleDeleteSession(session.id)}
                  onView={() => handleViewSession(session.id)}
                  onClose={() => handleCloseSession(session.id)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Create Session Form */}
        {showCreateForm && board && (
          <CreateSessionForm
            onClose={() => setShowCreateForm(false)}
            onSubmit={handleCreateSession}
            board={board}
          />
        )}
      </div>
    </div>
  )
}

// Simple Create Session Form Component
function CreateSessionForm({ 
  onClose, 
  onSubmit,
  board
}: { 
  onClose: () => void
  onSubmit: (data: { 
    name: string; 
    description?: string;
    winPoints?: number;
    lossPoints?: number;
    drawPoints?: number;
  }) => void
  board: Board
}) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [winPoints, setWinPoints] = useState(3)
  const [lossPoints, setLossPoints] = useState(0)
  const [drawPoints, setDrawPoints] = useState(1)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    setLoading(true)
    await onSubmit({ 
      name: name.trim(), 
      description: description.trim() || undefined,
      winPoints,
      lossPoints,
      drawPoints
    })
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Create New Session</CardTitle>
          <CardDescription>
            Create a new session to organize matches
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="session-name" className="text-sm font-medium">
                Session Name
              </label>
              <input
                id="session-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Week 1 Tournament"
                className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                required
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="session-description" className="text-sm font-medium">
                Description (Optional)
              </label>
              <textarea
                id="session-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the session..."
                className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                rows={3}
              />
            </div>

            {/* Scoring Configuration */}
            <div className="space-y-4 pt-2 border-t">
              <h4 className="text-sm font-medium">Scoring Configuration</h4>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label htmlFor="win-points" className="text-xs text-muted-foreground">
                    Win Points
                  </label>
                  <input
                    id="win-points"
                    type="number"
                    min="0"
                    value={winPoints}
                    onChange={(e) => setWinPoints(parseInt(e.target.value) || 0)}
                    className="w-full px-2 py-1 text-sm border border-input rounded-md focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor="loss-points" className="text-xs text-muted-foreground">
                    Loss Points
                  </label>
                  <input
                    id="loss-points"
                    type="number"
                    min="0"
                    value={lossPoints}
                    onChange={(e) => setLossPoints(parseInt(e.target.value) || 0)}
                    className="w-full px-2 py-1 text-sm border border-input rounded-md focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor="draw-points" className="text-xs text-muted-foreground">
                    Draw Points
                  </label>
                  <input
                    id="draw-points"
                    type="number"
                    min="0"
                    value={drawPoints}
                    onChange={(e) => setDrawPoints(parseInt(e.target.value) || 0)}
                    className="w-full px-2 py-1 text-sm border border-input rounded-md focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                </div>
              </div>
            </div>

            {/* Available Columns */}
            <div className="space-y-3 pt-2 border-t">
              <h4 className="text-sm font-medium">Available Columns for Scoring</h4>
              <div className="space-y-2">
                <div className="text-xs text-muted-foreground">
                  This session will automatically update the following columns:
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {/* Default columns */}
                  <div className="flex items-center gap-2 text-xs">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Wins</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Losses</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Points</span>
                  </div>
                  
                  {/* Custom board columns */}
                  {board.columns
                    .filter(col => !['Wins', 'Losses', 'Points'].includes(col.name))
                    .map(column => (
                      <div key={column.id} className="flex items-center gap-2 text-xs">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span>{column.name}</span>
                      </div>
                    ))}
                </div>
                {board.columns.filter(col => !['Wins', 'Losses', 'Points'].includes(col.name)).length === 0 && (
                  <div className="text-xs text-muted-foreground italic">
                    No custom columns found. Match scores will be added to relevant columns automatically.
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading || !name.trim()}
                className="flex-1"
              >
                {loading ? 'Creating...' : 'Create Session'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
