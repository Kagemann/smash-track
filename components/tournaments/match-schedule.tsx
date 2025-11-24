"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { Match, Group } from "@/types"
import { MATCH_STATUS } from "@/lib/constants"
import { Play, Trophy } from "lucide-react"

interface MatchScheduleProps {
  groups: Group[]
  onMatchClick?: (match: Match) => void
  boardId?: string
}

export function MatchSchedule({ groups, onMatchClick, boardId }: MatchScheduleProps) {
  return (
    <div className="space-y-6">
      {groups.map((group) => (
        <Card key={group.id}>
          <CardHeader>
            <CardTitle>{group.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {group.matches.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">
                  No matches scheduled yet
                </div>
              ) : (
                group.matches.map((match) => (
                  <div
                    key={match.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center space-x-4 flex-1">
                      <span className="font-medium">{match.player1.name}</span>
                      <span className="text-muted-foreground">vs</span>
                      <span className="font-medium">{match.player2.name}</span>
                    </div>
                    <div className="flex items-center space-x-4">
                      {match.status === "COMPLETED" ? (
                        <>
                          <span className="font-semibold">{match.player1Score}</span>
                          <span className="text-muted-foreground">-</span>
                          <span className="font-semibold">{match.player2Score}</span>
                          <Trophy className="h-4 w-4 text-yellow-500" />
                        </>
                      ) : (
                        <span className="text-muted-foreground">TBD</span>
                      )}
                      <Badge
                        variant={
                          match.status === "COMPLETED"
                            ? "default"
                            : match.status === "IN_PROGRESS"
                            ? "secondary"
                            : "outline"
                        }
                      >
                        {match.status.replace("_", " ")}
                      </Badge>
                      {onMatchClick && (
                        <Button
                          size="sm"
                          variant={match.status === "COMPLETED" ? "outline" : "default"}
                          onClick={() => onMatchClick(match)}
                        >
                          {match.status === "COMPLETED" ? (
                            "View/Edit"
                          ) : match.status === "IN_PROGRESS" ? (
                            "Enter Score"
                          ) : (
                            <>
                              <Play className="h-4 w-4 mr-2" />
                              Start Match
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

