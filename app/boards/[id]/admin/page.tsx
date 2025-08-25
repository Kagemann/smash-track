'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ArrowLeft, Share2, Settings, Trophy, BarChart3, Calendar } from 'lucide-react'
import { useBoardStore } from '@/lib/store/board-store'
import { useUIStore } from '@/lib/store/ui-store'
import { useScoreStore } from '@/lib/store/score-store'
import { Board } from '@/types'
import { LeaderboardTracker } from '@/components/boards/leaderboard-tracker'
import { MultiscoreTracker } from '@/components/boards/multiscore-tracker'

export default function BoardAdminPage() {
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
            <Button onClick={() => window.history.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
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
              <Badge variant="secondary">
                Admin View
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={() => window.history.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold">{board.name}</h1>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="secondary">
                  {board.type === 'LEADERBOARD' ? 'Leaderboard' : 'Multiscore'}
                </Badge>
                {board.type === 'LEADERBOARD' ? (
                  <Trophy className="h-4 w-4 text-yellow-500" />
                ) : (
                  <BarChart3 className="h-4 w-4 text-blue-500" />
                )}
              </div>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" size="sm" asChild>
              <a href={`/boards/${boardId}/sessions`}>
                <Calendar className="h-4 w-4 mr-2" />
                Sessions
              </a>
            </Button>
            <Button variant="outline" size="sm">
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>

        {/* Board Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Participants</CardTitle>
              <CardDescription>Total participants in this board</CardDescription>
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
              <CardDescription>Custom columns (Multiscore only)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{board.columns.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Participants */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Participants</CardTitle>
            <CardDescription>
              Manage participants and their scores
            </CardDescription>
          </CardHeader>
          <CardContent>
            {board.participants.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No participants added yet</p>
                <p className="text-sm">Add participants to start tracking scores</p>
              </div>
            ) : (
              <div className="space-y-3">
                {board.participants.map((participant) => (
                  <div key={participant.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">{participant.name}</div>
                                             <div className="text-sm text-muted-foreground">
                         {participant.scores?.length || 0} scores recorded
                       </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        Edit
                      </Button>
                      <Button size="sm" variant="outline">
                        View Scores
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Columns (Multiscore only) */}
        {board.type === 'MULTISCORE' && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Columns</CardTitle>
              <CardDescription>
                Custom columns for this multiscore board
              </CardDescription>
            </CardHeader>
            <CardContent>
              {board.columns.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No columns configured yet</p>
                  <p className="text-sm">Add columns to track different metrics</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {board.columns.map((column) => (
                    <div key={column.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">{column.name}</div>
                        <div className="text-sm text-muted-foreground">
                          Type: {column.type.toLowerCase()}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Badge variant="outline">{column.type}</Badge>
                        <Button size="sm" variant="outline">
                          Edit
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
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
              <div className="space-y-3">
                {board.sessions.map((session) => (
                  <div key={session.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">{session.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {session.matches?.length || 0} matches • {session.status}
                      </div>
                      {session.description && (
                        <div className="text-sm text-muted-foreground mt-1">
                          {session.description}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
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
                      <Button size="sm" variant="outline" asChild>
                        <a href={`/boards/${boardId}/sessions/${session.id}`}>
                          View
                        </a>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-8 w-8 mx-auto mb-2" />
                <p>No sessions created yet</p>
                <p className="text-sm">Create sessions to organize matches</p>
                <Button size="sm" variant="outline" className="mt-2" asChild>
                  <a href={`/boards/${boardId}/sessions`}>
                    Create Session
                  </a>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

                 {/* Score Tracking */}
         {board.type === 'LEADERBOARD' ? (
           <LeaderboardTracker board={board} />
         ) : (
           <MultiscoreTracker board={board} />
         )}

         {/* Recent Activity */}
         <Card>
           <CardHeader>
             <CardTitle>Recent Activity</CardTitle>
             <CardDescription>
               Latest changes and updates
             </CardDescription>
           </CardHeader>
           <CardContent>
             <div className="text-center py-8 text-muted-foreground">
               <p>No recent activity</p>
               <p className="text-sm">Activity will appear here as you make changes</p>
             </div>
           </CardContent>
         </Card>
      </div>
    </div>
  )
}
