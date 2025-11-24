"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { Match } from "@/types"
import { Play, Trophy } from "lucide-react"

interface BracketViewProps {
  semifinals: Match[]
  finals: Match[]
  onMatchClick?: (match: Match) => void
}

export function BracketView({ semifinals, finals, onMatchClick }: BracketViewProps) {
  return (
    <div className="space-y-6">
      {/* Semifinals */}
      <Card>
        <CardHeader>
          <CardTitle>Semifinals</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {semifinals.map((match, index) => (
              <div
                key={match.id}
                className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">{match.player1.name}</span>
                      {match.status === "COMPLETED" && match.winnerId === match.player1Id && (
                        <Badge variant="default">Winner</Badge>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">{match.player2.name}</span>
                      {match.status === "COMPLETED" && match.winnerId === match.player2Id && (
                        <Badge variant="default">Winner</Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    {match.status === "COMPLETED" ? (
                      <>
                        <span className="font-semibold text-lg">{match.player1Score}</span>
                        <span className="text-muted-foreground">-</span>
                        <span className="font-semibold text-lg">{match.player2Score}</span>
                        <Trophy className="h-5 w-5 text-yellow-500" />
                      </>
                    ) : (
                      <Badge variant="outline">Pending</Badge>
                    )}
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
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Finals */}
      {finals.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Final</CardTitle>
          </CardHeader>
          <CardContent>
            {finals.map((match) => (
              <div
                key={match.id}
                className="p-6 border-2 border-primary rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-lg">{match.player1.name}</span>
                      {match.status === "COMPLETED" && match.winnerId === match.player1Id && (
                        <Badge variant="default" className="text-lg">🏆 Winner</Badge>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-lg">{match.player2.name}</span>
                      {match.status === "COMPLETED" && match.winnerId === match.player2Id && (
                        <Badge variant="default" className="text-lg">🏆 Winner</Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    {match.status === "COMPLETED" ? (
                      <>
                        <span className="font-bold text-2xl">{match.player1Score}</span>
                        <span className="text-muted-foreground text-xl">-</span>
                        <span className="font-bold text-2xl">{match.player2Score}</span>
                        <Trophy className="h-6 w-6 text-yellow-500" />
                      </>
                    ) : (
                      <Badge variant="outline" className="text-lg">Pending</Badge>
                    )}
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
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

