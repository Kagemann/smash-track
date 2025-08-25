'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Plus, Minus, Trophy, Medal, Award } from 'lucide-react'
import { useScoreStore } from '@/lib/store/score-store'
import { useUIStore } from '@/lib/store/ui-store'
import { Board, Participant } from '@/types'

interface LeaderboardTrackerProps {
  board: Board
  readOnly?: boolean
}

export function LeaderboardTracker({ board, readOnly = false }: LeaderboardTrackerProps) {
  const { scores, loading, fetchScores, createScore, updateScore } = useScoreStore()
  const { showToast } = useUIStore()
  const [editingScore, setEditingScore] = useState<string | null>(null)
  const [editValue, setEditValue] = useState<string>('')

  // Fetch scores for this board
  useEffect(() => {
    fetchScores(board.id)
  }, [board.id, fetchScores])

  // Calculate participant totals and rankings
  const participantTotals = board.participants.map(participant => {
    const participantScores = scores.filter(score => score.participantId === participant.id)
    const total = participantScores.reduce((sum, score) => sum + score.value, 0)
    return {
      participant,
      total,
      scoreCount: participantScores.length,
      latestScore: participantScores[0] || null,
    }
  }).sort((a, b) => b.total - a.total) // Sort by total descending

  // Add rank to each participant
  const rankedParticipants = participantTotals.map((item, index) => ({
    ...item,
    rank: index + 1,
  }))

  const handleAddScore = useCallback(async (participantId: string, value: number) => {
    const result = await createScore({
      value,
      boardId: board.id,
      participantId,
    })

    if (result) {
      showToast(`Added ${value} points to ${board.participants.find(p => p.id === participantId)?.name}`, 'success')
    }
  }, [board.id, board.participants, createScore, showToast])

  const handleUpdateScore = useCallback(async (scoreId: string, value: number) => {
    const result = await updateScore(scoreId, { value })
    if (result) {
      showToast('Score updated successfully', 'success')
      setEditingScore(null)
    }
  }, [updateScore, showToast])

  const handleKeyPress = useCallback((event: KeyboardEvent) => {
    if (!readOnly) {
      if (event.key === '+' || event.key === '=') {
        // Add 1 point to the first participant (or selected participant)
        if (board.participants.length > 0) {
          handleAddScore(board.participants[0].id, 1)
        }
      } else if (event.key === '-') {
        // Add -1 point (subtract 1) to the first participant
        if (board.participants.length > 0) {
          handleAddScore(board.participants[0].id, -1)
        }
      }
    }
  }, [board.participants, handleAddScore, readOnly])

  useEffect(() => {
    if (!readOnly) {
      document.addEventListener('keydown', handleKeyPress)
      return () => document.removeEventListener('keydown', handleKeyPress)
    }
  }, [handleKeyPress, readOnly])

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-5 w-5 text-yellow-500" />
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />
      case 3:
        return <Award className="h-5 w-5 text-amber-600" />
      default:
        return <span className="text-sm font-medium text-muted-foreground">#{rank}</span>
    }
  }

  const getRankBadge = (rank: number) => {
    switch (rank) {
      case 1:
        return <Badge className="bg-yellow-500 text-white">1st</Badge>
      case 2:
        return <Badge className="bg-gray-400 text-white">2nd</Badge>
      case 3:
        return <Badge className="bg-amber-600 text-white">3rd</Badge>
      default:
        return <Badge variant="secondary">{rank}th</Badge>
    }
  }

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-muted-foreground">Loading scores...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      {!readOnly && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  if (board.participants.length > 0) {
                    handleAddScore(board.participants[0].id, 1)
                  }
                }}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                +1 to First
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  if (board.participants.length > 0) {
                    handleAddScore(board.participants[0].id, -1)
                  }
                }}
                className="gap-2"
              >
                <Minus className="h-4 w-4" />
                -1 to First
              </Button>
              {!readOnly && (
                <div className="text-sm text-muted-foreground ml-4 flex items-center">
                  <span>Keyboard shortcuts: Press + or - to add/subtract points</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Leaderboard */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Leaderboard</CardTitle>
        </CardHeader>
        <CardContent>
          {rankedParticipants.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No participants to track</p>
              <p className="text-sm">Add participants to start tracking scores</p>
            </div>
          ) : (
            <div className="space-y-3">
              {rankedParticipants.map(({ participant, total, rank, scoreCount, latestScore }) => (
                <div
                  key={participant.id}
                  className="flex items-center justify-between p-4 border rounded-lg bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      {getRankIcon(rank)}
                      {getRankBadge(rank)}
                    </div>
                    <div>
                      <div className="font-medium">{participant.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {scoreCount} scores recorded
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-2xl font-bold">{total}</div>
                      <div className="text-sm text-muted-foreground">Total Points</div>
                    </div>

                    {!readOnly && (
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleAddScore(participant.id, 1)}
                          className="h-8 w-8 p-0"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleAddScore(participant.id, -1)}
                          className="h-8 w-8 p-0"
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Session Results */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Session Results</CardTitle>
          <CardDescription>
            Points earned from completed matches
          </CardDescription>
        </CardHeader>
        <CardContent>
          {scores.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No session results yet</p>
              <p className="text-sm">Complete matches in sessions to see results here</p>
            </div>
          ) : (
            <div className="space-y-2">
              {scores.slice(0, 10).map((score) => (
                <div
                  key={score.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="font-medium">
                      {score.participant.name}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(score.createdAt).toLocaleTimeString()}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-lg font-semibold">
                      {score.value > 0 ? '+' : ''}{score.value}
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      Session Match
                    </Badge>
                    {!readOnly && (
                      editingScore === score.id ? (
                        <div className="flex gap-1">
                          <Input
                            type="number"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            className="w-20 h-8"
                            autoFocus
                          />
                          <Button
                            size="sm"
                            onClick={() => handleUpdateScore(score.id, parseInt(editValue) || 0)}
                          >
                            Save
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setEditingScore(null)}
                          >
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditingScore(score.id)
                            setEditValue(score.value.toString())
                          }}
                        >
                          Edit
                        </Button>
                      )
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Scores */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent Scores</CardTitle>
        </CardHeader>
        <CardContent>
          {scores.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No scores recorded yet</p>
              <p className="text-sm">Start adding scores to see them here</p>
            </div>
          ) : (
            <div className="space-y-2">
              {scores.slice(0, 10).map((score) => (
                <div
                  key={score.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="font-medium">
                      {score.participant.name}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(score.createdAt).toLocaleTimeString()}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-lg font-semibold">
                      {score.value > 0 ? '+' : ''}{score.value}
                    </div>
                    {!readOnly && (
                      editingScore === score.id ? (
                        <div className="flex gap-1">
                          <Input
                            type="number"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            className="w-20 h-8"
                            autoFocus
                          />
                          <Button
                            size="sm"
                            onClick={() => handleUpdateScore(score.id, parseInt(editValue) || 0)}
                          >
                            Save
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setEditingScore(null)}
                          >
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditingScore(score.id)
                            setEditValue(score.value.toString())
                          }}
                        >
                          Edit
                        </Button>
                      )
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
