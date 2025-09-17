'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  Edit, 
  Trash2, 
  Trophy,
  Users,
  Check,
  X,
  Clock
} from 'lucide-react'
import { Match } from '@/types'
import { useUIStore } from '@/lib/store/ui-store'

interface MatchCardProps {
  match: Match
  onEdit?: () => void
  onDelete?: () => void
  onComplete?: (player1Score: number, player2Score: number, customScores?: Record<string, { player1: number, player2: number }>) => void
}

export function MatchCard({ match, onEdit, onDelete, onComplete }: MatchCardProps) {
  const { showToast } = useUIStore()
  const [isCompleting, setIsCompleting] = useState(false)
  const [player1Score, setPlayer1Score] = useState(match.player1Score || 0)
  const [player2Score, setPlayer2Score] = useState(match.player2Score || 0)
  const [customScores, setCustomScores] = useState<Record<string, { player1: number, player2: number }>>({})

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
      case 'COMPLETED':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
      case 'CANCELLED':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="h-4 w-4" />
      case 'IN_PROGRESS':
        return <Users className="h-4 w-4" />
      case 'COMPLETED':
        return <Trophy className="h-4 w-4" />
      case 'CANCELLED':
        return <X className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const getWinner = () => {
    if (match.status !== 'COMPLETED') return null
    if (match.player1Score > match.player2Score) return match.player1.name
    if (match.player2Score > match.player1Score) return match.player2.name
    return 'Draw'
  }

  const handleComplete = () => {
    console.log('Completing match with custom scores:', customScores)
    console.log('Custom scores type:', typeof customScores)
    console.log('Custom scores keys:', Object.keys(customScores))
    console.log('Player1 score:', player1Score)
    console.log('Player2 score:', player2Score)
    
    // Prepare custom scores with auto-populated Points Scored and Points Taken
    const finalCustomScores = { ...customScores }
    
    // Auto-populate Points Scored and Points Taken if they exist as columns
    if (match.session?.board?.columns) {
      match.session.board.columns.forEach(column => {
        if (column.name === 'Points Scored') {
          finalCustomScores[column.id] = {
            player1: player1Score,
            player2: player2Score
          }
        } else if (column.name === 'Points Taken') {
          finalCustomScores[column.id] = {
            player1: player2Score, // Points taken by player1 = points scored by player2
            player2: player1Score  // Points taken by player2 = points scored by player1
          }
        }
      })
    }
    
    // Filter out empty custom scores (but keep Points Scored and Points Taken)
    const filteredCustomScores = Object.fromEntries(
      Object.entries(finalCustomScores).filter(([key, value]) => {
        if (!value || typeof value !== 'object') return false
        
        // Always include Points Scored and Points Taken
        const column = match.session?.board?.columns?.find(col => col.id === key)
        if (column && (column.name === 'Points Scored' || column.name === 'Points Taken')) {
          return true
        }
        
        // For other columns, only include if they have values > 0
        return value.player1 > 0 || value.player2 > 0
      })
    )
    
    console.log('Filtered custom scores:', filteredCustomScores)
    
    if (onComplete) {
      // Always pass customScores, even if empty
      onComplete(player1Score, player2Score, filteredCustomScores)
      setIsCompleting(false)
    }
  }

  const handleCancel = () => {
    setPlayer1Score(match.player1Score || 0)
    setPlayer2Score(match.player2Score || 0)
    setCustomScores({})
    setIsCompleting(false)
  }

  return (
    <Card className="group hover:shadow-lg transition-all duration-200 hover:scale-[1.02]">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-purple-500" />
            <div>
              <CardTitle className="text-lg font-semibold">
                {match.player1.name} vs {match.player2.name}
              </CardTitle>
              <CardDescription className="flex items-center gap-2 mt-1">
                <Badge 
                  variant="secondary" 
                  className={`text-xs ${getStatusColor(match.status)}`}
                >
                  <div className="flex items-center gap-1">
                    {getStatusIcon(match.status)}
                    {match.status}
                  </div>
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {new Date(match.createdAt).toLocaleDateString()}
                </span>
              </CardDescription>
            </div>
          </div>
          
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {match.status !== 'COMPLETED' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsCompleting(true)}
                className="h-8 w-8 p-0"
              >
                <Check className="h-4 w-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={onEdit}
              className="h-8 w-8 p-0"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onDelete}
              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {match.status === 'COMPLETED' ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div className="text-center flex-1">
                <div className="font-semibold">{match.player1.name}</div>
                <div className="text-2xl font-bold">{match.player1Score}</div>
              </div>
              <div className="text-muted-foreground">vs</div>
              <div className="text-center flex-1">
                <div className="font-semibold">{match.player2.name}</div>
                <div className="text-2xl font-bold">{match.player2Score}</div>
              </div>
            </div>
            
            {getWinner() && (
              <div className="text-center">
                <Badge variant="default" className="text-sm">
                  <Trophy className="h-3 w-3 mr-1" />
                  Winner: {getWinner()}
                </Badge>
              </div>
            )}
          </div>
        ) : isCompleting ? (
          <div className="space-y-4">
            {/* Main Score Inputs */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="player1-score">{match.player1.name}</Label>
                <Input
                  id="player1-score"
                  type="number"
                  min="0"
                  value={player1Score}
                  onChange={(e) => setPlayer1Score(parseInt(e.target.value) || 0)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="player2-score">{match.player2.name}</Label>
                <Input
                  id="player2-score"
                  type="number"
                  min="0"
                  value={player2Score}
                  onChange={(e) => setPlayer2Score(parseInt(e.target.value) || 0)}
                />
              </div>
            </div>

            {/* Custom Column Inputs */}
            {match.session?.board?.columns && match.session.board.columns.length > 0 && (
              <div className="space-y-3 pt-4 border-t">
                <div className="text-sm font-medium text-muted-foreground">
                  Additional Statistics
                </div>
                <div className="grid grid-cols-1 gap-3">
                  {match.session.board.columns
                    .filter(col => !['Wins', 'Losses', 'Points'].includes(col.name))
                    .map(column => {
                      // Auto-populate Points Scored and Points Taken
                      const isPointsScored = column.name === 'Points Scored'
                      const isPointsTaken = column.name === 'Points Taken'
                      
                      return (
                        <div key={column.id} className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor={`${column.id}-player1`}>
                              {match.player1.name} - {column.name}
                            </Label>
                            <Input
                              id={`${column.id}-player1`}
                              type="number"
                              min="0"
                              value={
                                isPointsScored ? player1Score :
                                isPointsTaken ? player2Score :
                                customScores[column.id]?.player1 || 0
                              }
                              onChange={(e) => setCustomScores(prev => ({
                                ...prev,
                                [column.id]: {
                                  player1: parseInt(e.target.value) || 0,
                                  player2: prev[column.id]?.player2 || 0
                                }
                              }))}
                              disabled={isPointsScored || isPointsTaken}
                              className={isPointsScored || isPointsTaken ? 'bg-gray-50 dark:bg-gray-800' : ''}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor={`${column.id}-player2`}>
                              {match.player2.name} - {column.name}
                            </Label>
                            <Input
                              id={`${column.id}-player2`}
                              type="number"
                              min="0"
                              value={
                                isPointsScored ? player2Score :
                                isPointsTaken ? player1Score :
                                customScores[column.id]?.player2 || 0
                              }
                              onChange={(e) => setCustomScores(prev => ({
                                ...prev,
                                [column.id]: {
                                  player1: prev[column.id]?.player1 || 0,
                                  player2: parseInt(e.target.value) || 0
                                }
                              }))}
                              disabled={isPointsScored || isPointsTaken}
                              className={isPointsScored || isPointsTaken ? 'bg-gray-50 dark:bg-gray-800' : ''}
                            />
                          </div>
                        </div>
                      )
                    })}
                </div>
              </div>
            )}
            
            <div className="flex gap-2">
              <Button
                onClick={handleComplete}
                className="flex-1"
                size="sm"
              >
                <Check className="h-4 w-4 mr-2" />
                Complete Match
              </Button>
              <Button
                variant="outline"
                onClick={handleCancel}
                size="sm"
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-4 text-muted-foreground">
            <p>Match not completed yet</p>
            <p className="text-sm">Click the checkmark to enter scores</p>
          </div>
        )}

        {/* Quick Actions */}
        {match.status !== 'COMPLETED' && !isCompleting && (
          <div className="flex items-center gap-2 mt-4 pt-3 border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsCompleting(true)}
              className="flex-1 h-8 text-xs"
            >
              <Check className="h-3 w-3 mr-1" />
              Complete Match
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
