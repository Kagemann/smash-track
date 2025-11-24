"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Trophy, Users, Calendar } from "lucide-react"
import type { Tournament } from "@/types"
import { TOURNAMENT_PHASE, TOURNAMENT_STATUS } from "@/lib/constants"
import Link from "next/link"

interface TournamentCardProps {
  tournament: Tournament
}

export function TournamentCard({ tournament }: TournamentCardProps) {
  const getPhaseColor = (phase: string) => {
    switch (phase) {
      case "SETUP":
        return "secondary"
      case "GROUP_DRAW":
        return "outline"
      case "GROUP_STAGE":
        return "default"
      case "KNOCKOUT":
        return "default"
      case "COMPLETED":
        return "default"
      default:
        return "outline"
    }
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              {tournament.name}
            </CardTitle>
            {tournament.description && (
              <CardDescription className="mt-1">{tournament.description}</CardDescription>
            )}
          </div>
          <Badge variant={getPhaseColor(tournament.phase)}>
            {tournament.phase.replace("_", " ")}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>{tournament.participants.length} players</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>{new Date(tournament.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between pt-2">
            <Badge variant="outline">{tournament.status}</Badge>
            <Link href={`/tournaments/${tournament.id}`}>
              <Button variant="outline" size="sm">
                View Tournament
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

