"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Match } from "@/types"
import { Play, Trophy } from "lucide-react"

interface MatchDialogProps {
  match: Match | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onStart: (matchId: string) => Promise<void>
  onComplete: (matchId: string, player1Score: number, player2Score: number) => Promise<void>
}

export function MatchDialog({ match, open, onOpenChange, onStart, onComplete }: MatchDialogProps) {
  const [player1Score, setPlayer1Score] = useState(0)
  const [player2Score, setPlayer2Score] = useState(0)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (match) {
      setPlayer1Score(match.player1Score || 0)
      setPlayer2Score(match.player2Score || 0)
    }
  }, [match])

  const handleStart = async () => {
    if (!match) return
    setLoading(true)
    try {
      await onStart(match.id)
      onOpenChange(false)
    } catch (error) {
      console.error("Error starting match:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleComplete = async () => {
    if (!match) return
    if (player1Score < 0 || player2Score < 0) {
      return
    }
    setLoading(true)
    try {
      await onComplete(match.id, player1Score, player2Score)
      onOpenChange(false)
    } catch (error) {
      console.error("Error completing match:", error)
    } finally {
      setLoading(false)
    }
  }

  if (!match) return null

  const isCompleted = match.status === "COMPLETED"
  const isInProgress = match.status === "IN_PROGRESS"
  const isPending = match.status === "PENDING"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            {isCompleted ? "Match Result" : isInProgress ? "Enter Match Score" : "Start Match"}
          </DialogTitle>
          <DialogDescription>
            {isCompleted 
              ? "View or edit the match result"
              : isInProgress
              ? "Enter the final scores for this match"
              : "Start this match to begin tracking scores"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Match Info */}
          <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/50">
            <div className="text-center flex-1">
              <div className="font-semibold text-lg">{match.player1.name}</div>
              {isCompleted && (
                <div className="text-2xl font-bold mt-2">{match.player1Score}</div>
              )}
            </div>
            <div className="text-muted-foreground mx-4">vs</div>
            <div className="text-center flex-1">
              <div className="font-semibold text-lg">{match.player2.name}</div>
              {isCompleted && (
                <div className="text-2xl font-bold mt-2">{match.player2Score}</div>
              )}
            </div>
          </div>

          {/* Status Badge */}
          <div className="flex justify-center">
            <Badge
              variant={
                isCompleted
                  ? "default"
                  : isInProgress
                  ? "secondary"
                  : "outline"
              }
            >
              {match.status.replace("_", " ")}
            </Badge>
          </div>

          {/* Score Input (for IN_PROGRESS or editing COMPLETED) */}
          {(isInProgress || isCompleted) && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="player1-score">{match.player1.name} Score</Label>
                  <Input
                    id="player1-score"
                    type="number"
                    min="0"
                    value={player1Score}
                    onChange={(e) => setPlayer1Score(parseInt(e.target.value) || 0)}
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="player2-score">{match.player2.name} Score</Label>
                  <Input
                    id="player2-score"
                    type="number"
                    min="0"
                    value={player2Score}
                    onChange={(e) => setPlayer2Score(parseInt(e.target.value) || 0)}
                    disabled={loading}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          {isPending && (
            <Button onClick={handleStart} disabled={loading}>
              <Play className="h-4 w-4 mr-2" />
              {loading ? "Starting..." : "Start Match"}
            </Button>
          )}
          {(isInProgress || isCompleted) && (
            <Button onClick={handleComplete} disabled={loading || player1Score < 0 || player2Score < 0}>
              <Trophy className="h-4 w-4 mr-2" />
              {loading ? "Saving..." : isCompleted ? "Update Result" : "Complete Match"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

