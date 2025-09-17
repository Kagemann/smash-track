'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, ArrowLeft, Users, Trophy, Calendar } from 'lucide-react'
import { MatchCard } from '@/components/matches/match-card'
import { useBoardStore } from '@/lib/store/board-store'
import { useSessionStore } from '@/lib/store/session-store'
import { useMatchStore } from '@/lib/store/match-store'
import { useUIStore } from '@/lib/store/ui-store'
import { useScoreStore } from '@/lib/store/score-store'
import { Navigation } from '@/components/ui/navigation'
import { Board, Session, Match, Participant } from '@/types'

export default function SessionPage() {
  const params = useParams()
  const router = useRouter()
  const [boardId, setBoardId] = useState<string | null>(null)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [board, setBoard] = useState<Board | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  
  const { fetchBoard, currentBoard, loading: boardLoading, error: boardError } = useBoardStore()
  const { fetchSession, currentSession, loading: sessionLoading, error: sessionError } = useSessionStore()
  const { matches, loading: matchesLoading, error: matchesError, fetchMatches, createMatch, completeMatch, deleteMatch } = useMatchStore()
  const { showToast } = useUIStore()
  const { fetchScores } = useScoreStore()

  useEffect(() => {
    const getParams = async () => {
      const resolvedParams = await params
      const boardId = resolvedParams.id as string
      const sessionId = resolvedParams.sessionId as string
      setBoardId(boardId)
      setSessionId(sessionId)
    }
    getParams()
  }, [params])

  useEffect(() => {
    if (boardId) {
      fetchBoard(boardId)
    }
  }, [boardId, fetchBoard])

  useEffect(() => {
    if (sessionId) {
      fetchSession(sessionId)
      fetchMatches(sessionId)
    }
  }, [sessionId, fetchSession, fetchMatches])

  useEffect(() => {
    if (currentBoard) {
      setBoard(currentBoard)
    }
  }, [currentBoard])

  useEffect(() => {
    if (currentSession) {
      setSession(currentSession)
    }
  }, [currentSession])

  useEffect(() => {
    if (boardError) {
      showToast(boardError, 'error')
    }
  }, [boardError, showToast])

  useEffect(() => {
    if (sessionError) {
      showToast(sessionError, 'error')
    }
  }, [sessionError, showToast])

  useEffect(() => {
    if (matchesError) {
      showToast(matchesError, 'error')
    }
  }, [matchesError, showToast])

  const handleCreateMatch = async (data: { player1Id: string; player2Id: string }) => {
    if (!sessionId) return

    const newMatch = await createMatch({
      sessionId: sessionId,
      player1Id: data.player1Id,
      player2Id: data.player2Id
    })

    if (newMatch) {
      showToast('Match created successfully!', 'success')
      setShowCreateForm(false)
    }
  }

  const handleCompleteMatch = async (
    matchId: string, 
    player1Score: number, 
    player2Score: number, 
    customScores?: Record<string, { player1: number, player2: number }>
  ) => {
    const matchData: any = {
      player1Score,
      player2Score,
      customScores: customScores || {},
    }
    
    const completedMatch = await completeMatch(matchId, matchData)

    if (completedMatch) {
      showToast('Match completed successfully!', 'success')
      // Refresh the score store to update the leaderboard
      if (boardId) {
        fetchScores(boardId)
      }
    }
  }

  const handleDeleteMatch = async (matchId: string) => {
    const success = await deleteMatch(matchId)
    if (success) {
      showToast('Match deleted successfully!', 'success')
    }
  }

  if (boardLoading || sessionLoading || matchesLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Loading session...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!board || !session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Session not found</h1>
            <p className="text-muted-foreground mb-6">
              The session you're looking for doesn't exist or has been deleted.
            </p>
            <Button onClick={() => router.push(`/boards/${boardId}/sessions`)}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Sessions
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const completedMatches = matches.filter(m => m.status === 'COMPLETED')
  const pendingMatches = matches.filter(m => m.status === 'PENDING')

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <Navigation variant="session" boardName={board?.name} sessionName={session?.name} />

      <div className="container mx-auto px-4 py-4 sm:py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push(`/boards/${boardId}/sessions`)}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Back to Sessions</span>
              <span className="sm:hidden">Back</span>
            </Button>
            <div className="min-w-0 flex-1 sm:flex-none">
              <h1 className="text-2xl sm:text-3xl font-bold truncate">{session.name}</h1>
              <p className="text-sm sm:text-base text-muted-foreground">
                {board.name} • Session Management
              </p>
            </div>
          </div>
          {session.status === 'ACTIVE' && (
            <Button onClick={() => setShowCreateForm(true)} className="gap-2 w-full sm:w-auto">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Add Match</span>
              <span className="sm:hidden">Add Match</span>
            </Button>
          )}
        </div>

        {/* Session Info */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Session Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="flex items-center gap-2">
                <Badge 
                  variant="secondary" 
                  className={
                    session.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                    session.status === 'COMPLETED' ? 'bg-blue-100 text-blue-800' :
                    'bg-red-100 text-red-800'
                  }
                >
                  {session.status}
                </Badge>
                <span className="text-sm text-muted-foreground">Status</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span className="text-sm text-muted-foreground">
                  {matches.length} matches
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Trophy className="h-4 w-4" />
                <span className="text-sm text-muted-foreground">
                  {completedMatches.length} completed
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span className="text-sm text-muted-foreground">
                  {new Date(session.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
            {session.description && (
              <p className="text-sm text-muted-foreground mt-4">
                {session.description}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Matches */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Matches</h2>
            <div className="flex gap-2">
              <Badge variant="outline">
                {matches.length} total
              </Badge>
              <Badge variant="secondary">
                {completedMatches.length} completed
              </Badge>
            </div>
          </div>

          {matches.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No matches yet</h3>
                <p className="text-muted-foreground mb-6">
                  {session.status === 'ACTIVE' 
                    ? 'Add your first match to start the session'
                    : 'This session has no matches'
                  }
                </p>
                {session.status === 'ACTIVE' && (
                  <Button onClick={() => setShowCreateForm(true)} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add Your First Match
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {matches.map((match) => (
                <MatchCard
                  key={match.id}
                  match={{
                    ...match,
                    session: {
                      ...match.session,
                      board: board // Pass the board data to show custom columns
                    }
                  }}
                  onEdit={() => {}} // Could implement edit functionality
                  onDelete={() => handleDeleteMatch(match.id)}
                  onComplete={(player1Score, player2Score, customScores) => 
                    handleCompleteMatch(match.id, player1Score, player2Score, customScores)
                  }
                />
              ))}
            </div>
          )}
        </div>

        {/* Create Match Form */}
        {showCreateForm && board && (
          <CreateMatchForm
            participants={board.participants}
            onClose={() => setShowCreateForm(false)}
            onSubmit={handleCreateMatch}
          />
        )}
      </div>
    </div>
  )
}

// Create Match Form Component
function CreateMatchForm({ 
  participants,
  onClose, 
  onSubmit 
}: { 
  participants: Participant[]
  onClose: () => void
  onSubmit: (data: { player1Id: string; player2Id: string }) => void
}) {
  const [player1Id, setPlayer1Id] = useState('')
  const [player2Id, setPlayer2Id] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!player1Id || !player2Id || player1Id === player2Id) return

    setLoading(true)
    await onSubmit({ player1Id, player2Id })
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Create New Match</CardTitle>
          <CardDescription>
            Select two participants for the match
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="player1" className="text-sm font-medium">
                Player 1
              </label>
              <select
                id="player1"
                value={player1Id}
                onChange={(e) => setPlayer1Id(e.target.value)}
                className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                required
              >
                <option value="">Select player...</option>
                {participants.map((participant) => (
                  <option key={participant.id} value={participant.id}>
                    {participant.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="player2" className="text-sm font-medium">
                Player 2
              </label>
              <select
                id="player2"
                value={player2Id}
                onChange={(e) => setPlayer2Id(e.target.value)}
                className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                required
              >
                <option value="">Select player...</option>
                {participants
                  .filter(p => p.id !== player1Id)
                  .map((participant) => (
                    <option key={participant.id} value={participant.id}>
                      {participant.name}
                    </option>
                  ))
                }
              </select>
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
                disabled={loading || !player1Id || !player2Id || player1Id === player2Id}
                className="flex-1"
              >
                {loading ? 'Creating...' : 'Create Match'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
