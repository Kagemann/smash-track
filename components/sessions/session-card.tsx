'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Edit, 
  Trash2, 
  Users, 
  Trophy,
  Calendar,
  Clock
} from 'lucide-react'
import { Session } from '@/types'
import { useUIStore } from '@/lib/store/ui-store'

interface SessionCardProps {
  session: Session
  onEdit?: () => void
  onDelete?: () => void
  onView?: () => void
  onClose?: () => void
}

export function SessionCard({ session, onEdit, onDelete, onView, onClose }: SessionCardProps) {
  const { showToast } = useUIStore()
  const matchCount = session.matches?.length || 0
  const completedMatches = session.matches?.filter(m => m.status === 'COMPLETED').length || 0

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
      case 'COMPLETED':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
      case 'CANCELLED':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <Clock className="h-4 w-4" />
      case 'COMPLETED':
        return <Trophy className="h-4 w-4" />
      case 'CANCELLED':
        return <Trash2 className="h-4 w-4" />
      default:
        return <Calendar className="h-4 w-4" />
    }
  }

  return (
    <Card className="group hover:shadow-lg transition-all duration-200 hover:scale-[1.02]">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-500" />
            <div>
              <CardTitle className="text-lg font-semibold">{session.name}</CardTitle>
              <CardDescription className="flex items-center gap-2 mt-1">
                <Badge 
                  variant="secondary" 
                  className={`text-xs ${getStatusColor(session.status)}`}
                >
                  <div className="flex items-center gap-1">
                    {getStatusIcon(session.status)}
                    {session.status}
                  </div>
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {new Date(session.createdAt).toLocaleDateString()}
                </span>
              </CardDescription>
            </div>
          </div>
          
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
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
        {session.description && (
          <p className="text-sm text-muted-foreground mb-4">
            {session.description}
          </p>
        )}

        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>{matchCount} matches</span>
            </div>
            <div className="flex items-center gap-1">
              <Trophy className="h-4 w-4" />
              <span>{completedMatches} completed</span>
            </div>
          </div>
        </div>
        
        {/* Scoring Configuration */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2 pt-2 border-t">
          <span>Win: {session.winPoints}pts</span>
          <span>Loss: {session.lossPoints}pts</span>
          <span>Draw: {session.drawPoints}pts</span>
        </div>

        {/* Available Columns */}
        <div className="mt-2 pt-2 border-t">
          <div className="text-xs text-muted-foreground mb-2">
            Available columns for scoring:
          </div>
          <div className="grid grid-cols-2 gap-1">
            {/* Default columns */}
            <div className="flex items-center gap-1 text-xs">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Wins</span>
            </div>
            <div className="flex items-center gap-1 text-xs">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Losses</span>
            </div>
            <div className="flex items-center gap-1 text-xs">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Points</span>
            </div>
            
            {/* Custom board columns - these will be populated when board data is available */}
            {session.board?.columns
              ?.filter(col => !['Wins', 'Losses', 'Points'].includes(col.name))
              .map(column => (
                <div key={column.id} className="flex items-center gap-1 text-xs">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>{column.name}</span>
                </div>
              ))}
          </div>
          {(!session.board?.columns || session.board.columns.length === 0) && (
            <div className="text-xs text-muted-foreground italic mt-1">
              All board columns will be updated automatically
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-2 mt-4 pt-3 border-t">
          <Button
            variant="outline"
            size="sm"
            onClick={onView}
            className="flex-1 h-8 text-xs"
          >
            <Users className="h-3 w-3 mr-1" />
            View Matches
          </Button>
          {session.status === 'ACTIVE' && (
            <>
              <Button
                variant="default"
                size="sm"
                onClick={onView}
                className="flex-1 h-8 text-xs"
              >
                <Trophy className="h-3 w-3 mr-1" />
                Add Match
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={onClose}
                className="h-8 w-8 p-0"
                title="Close Session"
              >
                <Clock className="h-3 w-3" />
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
