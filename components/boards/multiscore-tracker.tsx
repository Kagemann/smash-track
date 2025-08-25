'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Minus, BarChart3, Edit3, Trash2 } from 'lucide-react'
import { useScoreStore } from '@/lib/store/score-store'
import { useUIStore } from '@/lib/store/ui-store'
import { Board, Column } from '@/types'

interface MultiscoreTrackerProps {
  board: Board
  readOnly?: boolean
}

export function MultiscoreTracker({ board, readOnly = false }: MultiscoreTrackerProps) {
  const { scores, loading, fetchScores, createScore, updateScore, deleteScore } = useScoreStore()
  const { showToast } = useUIStore()
  const [editingScore, setEditingScore] = useState<string | null>(null)
  const [editValue, setEditValue] = useState<string>('')

  // Fetch scores for this board
  useEffect(() => {
    fetchScores(board.id)
  }, [board.id, fetchScores])

  // Group scores by participant and column
  const getScoreForParticipantAndColumn = (participantId: string, columnId: string) => {
    return scores.find(score => 
      score.participantId === participantId && 
      score.columnId === columnId
    )
  }

  const handleAddScore = useCallback(async (participantId: string, columnId: string, value: number) => {
    const result = await createScore({
      value,
      boardId: board.id,
      participantId,
      columnId,
    })

    if (result) {
      const participant = board.participants.find(p => p.id === participantId)
      const column = board.columns.find(c => c.id === columnId)
      showToast(`Added ${value} to ${participant?.name} in ${column?.name}`, 'success')
    }
  }, [board.id, board.participants, board.columns, createScore, showToast])

  const handleUpdateScore = useCallback(async (scoreId: string, value: number) => {
    const result = await updateScore(scoreId, { value })
    if (result) {
      showToast('Score updated successfully', 'success')
      setEditingScore(null)
    }
  }, [updateScore, showToast])

  const handleDeleteScore = useCallback(async (scoreId: string) => {
    const result = await deleteScore(scoreId)
    if (result) {
      showToast('Score deleted successfully', 'success')
    }
  }, [deleteScore, showToast])

  const formatValue = (value: number, columnType: string) => {
    switch (columnType) {
      case 'NUMBER':
        return value.toString()
      case 'TEXT':
        return value.toString()
      case 'DATE':
        return new Date(value).toLocaleTimeString()
      case 'BOOLEAN':
        return value ? 'Yes' : 'No'
      default:
        return value.toString()
    }
  }

  const getInputType = (columnType: string) => {
    switch (columnType) {
      case 'NUMBER':
        return 'number'
      case 'TEXT':
        return 'text'
      case 'DATE':
        return 'datetime-local'
      case 'BOOLEAN':
        return 'checkbox'
      default:
        return 'text'
    }
  }

  const getColumnIcon = (columnType: string) => {
    switch (columnType) {
      case 'NUMBER':
        return <span className="text-lg">#</span>
      case 'TEXT':
        return <span className="text-lg">T</span>
      case 'DATE':
        return <span className="text-lg">⏰</span>
      case 'BOOLEAN':
        return <span className="text-lg">✓</span>
      default:
        return <BarChart3 className="h-4 w-4" />
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

  if (board.columns.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No columns configured for this multiscore board</p>
        <p className="text-sm">Add columns to start tracking different metrics</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Score Grid */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Score Grid</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 font-medium">Participant</th>
                  {board.columns.map((column) => (
                    <th key={column.id} className="text-center p-3 font-medium">
                      <div className="flex items-center justify-center gap-2">
                        {getColumnIcon(column.type)}
                        <span>{column.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {column.type.toLowerCase()}
                        </Badge>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {board.participants.map((participant) => (
                  <tr key={participant.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="p-3 font-medium">{participant.name}</td>
                    {board.columns.map((column) => {
                      const score = getScoreForParticipantAndColumn(participant.id, column.id)
                      return (
                        <td key={column.id} className="p-3 text-center">
                          {score ? (
                            <div className="flex items-center justify-center gap-2">
                              <span className="font-semibold">
                                {formatValue(score.value, column.type)}
                              </span>
                              {!readOnly && (
                                <div className="flex gap-1">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleAddScore(participant.id, column.id, 1)}
                                    className="h-6 w-6 p-0"
                                  >
                                    <Plus className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleAddScore(participant.id, column.id, -1)}
                                    className="h-6 w-6 p-0"
                                  >
                                    <Minus className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      setEditingScore(score.id)
                                      setEditValue(score.value.toString())
                                    }}
                                    className="h-6 w-6 p-0"
                                  >
                                    <Edit3 className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleDeleteScore(score.id)}
                                    className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="flex items-center justify-center gap-2">
                              <span className="text-muted-foreground">-</span>
                              {!readOnly && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleAddScore(participant.id, column.id, 0)}
                                  className="h-6 w-6 p-0"
                                >
                                  <Plus className="h-3 w-3" />
                                </Button>
                              )}
                            </div>
                          )}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
                      {score.column?.name || 'No Column'}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(score.createdAt).toLocaleTimeString()}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-lg font-semibold">
                      {formatValue(score.value, score.column?.type || 'NUMBER')}
                    </div>
                    {!readOnly && (
                      editingScore === score.id ? (
                        <div className="flex gap-1">
                          <Input
                            type={getInputType(score.column?.type || 'NUMBER')}
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
