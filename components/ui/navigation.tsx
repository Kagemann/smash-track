'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Trophy } from 'lucide-react'

interface NavigationProps {
  variant?: 'public' | 'admin' | 'session'
  boardName?: string
  sessionName?: string
}

export function Navigation({ variant = 'public', boardName, sessionName }: NavigationProps) {
  const router = useRouter()

  const getVariantBadge = () => {
    switch (variant) {
      case 'admin':
        return <Badge variant="secondary">Admin View</Badge>
      case 'session':
        return <Badge variant="secondary">Session</Badge>
      default:
        return <Badge variant="secondary">Public View</Badge>
    }
  }

  const getTitle = () => {
    if (sessionName) return sessionName
    if (boardName) return boardName
    return 'SmashTrack'
  }

  return (
    <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          {/* Left side - Back button and title */}
          <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/')}
              className="gap-1 sm:gap-2 text-sm sm:text-base font-semibold text-blue-600 hover:text-blue-700 p-1 sm:p-2"
            >
              <Trophy className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="hidden sm:inline">🏆 SmashTrack</span>
            </Button>
            {(boardName || sessionName) && (
              <>
                <div className="hidden sm:block text-muted-foreground">•</div>
                <h1 className="text-sm sm:text-lg font-semibold truncate">
                  {getTitle()}
                </h1>
              </>
            )}
          </div>

          {/* Right side - Badge */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {getVariantBadge()}
          </div>
        </div>
      </div>
    </div>
  )
}
