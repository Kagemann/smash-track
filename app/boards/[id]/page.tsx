'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Trophy, BarChart3, Eye, Calendar } from 'lucide-react'
import { useBoardStore } from '@/lib/store/board-store'
import { useUIStore } from '@/lib/store/ui-store'
import { useScoreStore } from '@/lib/store/score-store'
import { LeaderboardTracker } from '@/components/boards/leaderboard-tracker'
import { MultiscoreTracker } from '@/components/boards/multiscore-tracker'
import { Navigation } from '@/components/ui/navigation'
import { Board } from '@/types'

export default function BoardViewerPage() {
  const params = useParams()
  const router = useRouter()
  const [boardId, setBoardId] = useState<string | null>(null)
  const { fetchBoard, currentBoard, loading, error } = useBoardStore()
  const { showToast } = useUIStore()
   const { fetchScores } = useScoreStore()
  const [board, setBoard] = useState<Board | null>(null)

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
      fetchScores(boardId)
    }
  }, [boardId, fetchBoard, fetchScores])

  useEffect(() => {
    if (currentBoard) {
      setBoard(currentBoard)
    }
  }, [currentBoard])

  useEffect(() => {
    if (error) {
      showToast(error, 'error')
    }
  }, [error, showToast])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Loading board...</p>
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
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <Navigation variant="public" boardName={board?.name} />

      <div className="container mx-auto px-4 py-4 sm:py-8">
        {/* Page Header */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="flex items-center justify-center gap-2 sm:gap-3 mb-4">
            {board.type === 'LEADERBOARD' ? (
              <Trophy className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-500" />
            ) : (
              <BarChart3 className="h-6 w-6 sm:h-8 sm:w-8 text-blue-500" />
            )}
            <h1 className="text-2xl sm:text-4xl font-bold truncate">{board.name}</h1>
            <Eye className="h-5 w-5 sm:h-6 sm:w-6 text-muted-foreground" />
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2 mb-4 text-sm">
            <Badge variant="secondary" className="text-xs">
              {board.type === 'LEADERBOARD' ? 'Leaderboard' : 'Multiscore'}
            </Badge>
            <span className="text-muted-foreground hidden sm:inline">•</span>
            <span className="text-muted-foreground">
              {board.participants.length} participants
            </span>
            <span className="text-muted-foreground hidden sm:inline">•</span>
            <span className="text-muted-foreground">
              {board.scores.length} scores
            </span>
          </div>
          <p className="text-sm sm:text-base text-muted-foreground px-4">
            This is a public view of the board. Contact the board owner for admin access.
          </p>
        </div>

        {/* Board Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Participants</CardTitle>
              <CardDescription>Total participants</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{board.participants.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Scores</CardTitle>
              <CardDescription>Total scores recorded</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{board.scores.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Columns</CardTitle>
              <CardDescription>Custom columns</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{board.columns.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Participants List */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Participants</CardTitle>
            <CardDescription>
              All participants in this board
            </CardDescription>
          </CardHeader>
          <CardContent>
            {board.participants.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No participants added yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {board.participants.map((participant) => (
                  <div key={participant.id} className="p-4 border rounded-lg bg-white dark:bg-gray-800">
                    <div className="font-medium mb-2">{participant.name}</div>
                                         <div className="text-sm text-muted-foreground">
                       {participant.scores?.length || 0} scores recorded
                     </div>
                     {participant.scores && participant.scores.length > 0 && (
                       <div className="mt-2 text-sm">
                         Latest: {participant.scores[0]?.value || 0}
                       </div>
                     )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Columns (Multiscore only) */}
        {board.type === 'MULTISCORE' && board.columns.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Columns</CardTitle>
              <CardDescription>
                Custom columns for this multiscore board
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {board.columns.map((column) => (
                  <div key={column.id} className="p-4 border rounded-lg bg-white dark:bg-gray-800">
                    <div className="font-medium mb-2">{column.name}</div>
                    <div className="text-sm text-muted-foreground">
                      Type: {column.type.toLowerCase()}
                    </div>
                    <Badge variant="outline" className="mt-2">
                      {column.type}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Sessions */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Sessions
            </CardTitle>
            <CardDescription>
              Tournament sessions and matches
            </CardDescription>
          </CardHeader>
          <CardContent>
            {board.sessions && board.sessions.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {board.sessions.slice(0, 6).map((session) => (
                  <div key={session.id} className="p-4 border rounded-lg bg-white dark:bg-gray-800">
                    <div className="font-medium mb-2">{session.name}</div>
                    <div className="text-sm text-muted-foreground mb-2">
                      {session.matches?.length || 0} matches
                    </div>
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
                  </div>
                ))}
                {board.sessions.length > 6 && (
                  <div className="p-4 border rounded-lg bg-white dark:bg-gray-800 text-center">
                    <p className="text-sm text-muted-foreground">
                      +{board.sessions.length - 6} more sessions
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-8 w-8 mx-auto mb-2" />
                <p>No sessions created yet</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Score Tracking */}
        {board.type === 'LEADERBOARD' ? (
          <LeaderboardTracker board={board} readOnly={true} />
        ) : (
          <MultiscoreTracker board={board} readOnly={true} />
        )}

        {/* Footer */}
        <div className="text-center py-8">
          <p className="text-sm text-muted-foreground">
            Powered by SmashTrack • Real-time score tracking
          </p>
        </div>
      </div>
    </div>
  )
}
