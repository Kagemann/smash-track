'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Edit, 
  Trash2, 
  Share2, 
  Users, 
  Trophy, 
  BarChart3,
  ExternalLink,
  Copy,
  Calendar
} from 'lucide-react'
import { Board } from '@/types'
import { generateShareData } from '@/lib/utils/board-utils'
import { useUIStore } from '@/lib/store/ui-store'

interface BoardCardProps {
  board: Board
  onEdit?: () => void
  onDelete?: () => void
  onShare?: () => void
}

export function BoardCard({ board, onEdit, onDelete, onShare }: BoardCardProps) {
  const [copied, setCopied] = useState(false)
  const { showToast } = useUIStore()

  const shareData = generateShareData(board)
  const participantCount = board.participants.length
  const scoreCount = board.scores.length

  const handleCopyLink = async (url: string, type: 'public' | 'admin') => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      showToast(`${type === 'public' ? 'Public' : 'Admin'} link copied!`, 'success')
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      showToast('Failed to copy link', 'error')
    }
  }

  const getBoardIcon = () => {
    return board.type === 'LEADERBOARD' ? (
      <Trophy className="h-5 w-5 text-yellow-500" />
    ) : (
      <BarChart3 className="h-5 w-5 text-blue-500" />
    )
  }

  const getBoardTypeLabel = () => {
    return board.type === 'LEADERBOARD' ? 'Leaderboard' : 'Multiscore'
  }

  return (
    <Card className="group hover:shadow-lg transition-all duration-200 hover:scale-[1.02]">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            {getBoardIcon()}
            <div>
              <CardTitle className="text-lg font-semibold">{board.name}</CardTitle>
              <CardDescription className="flex items-center gap-2 mt-1">
                <Badge variant="secondary" className="text-xs">
                  {getBoardTypeLabel()}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {new Date(board.createdAt).toLocaleDateString()}
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
              onClick={onShare}
              className="h-8 w-8 p-0"
            >
              <Share2 className="h-4 w-4" />
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
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>{participantCount} participants</span>
            </div>
            <div className="flex items-center gap-1">
              <Trophy className="h-4 w-4" />
              <span>{scoreCount} scores</span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-2 mt-4 pt-3 border-t">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleCopyLink(shareData.publicUrl, 'public')}
            className="flex-1 h-8 text-xs"
          >
            <Copy className="h-3 w-3 mr-1" />
            Copy Public Link
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleCopyLink(shareData.adminUrl, 'admin')}
            className="flex-1 h-8 text-xs"
          >
            <Copy className="h-3 w-3 mr-1" />
            Copy Admin Link
          </Button>
        </div>

        {/* Session Management */}
        <div className="flex items-center gap-2 mt-2">
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="flex-1 h-8 text-xs"
          >
            <a href={`/boards/${board.id}/sessions`}>
              <Calendar className="h-3 w-3 mr-1" />
              Manage Sessions
            </a>
          </Button>
        </div>

        {/* View Links */}
        <div className="flex items-center gap-2 mt-2">
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="flex-1 h-8 text-xs"
          >
            <a href={shareData.publicUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-3 w-3 mr-1" />
              View Public
            </a>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="flex-1 h-8 text-xs"
          >
            <a href={shareData.adminUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-3 w-3 mr-1" />
              View Admin
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
