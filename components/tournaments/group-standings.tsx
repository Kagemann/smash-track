"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { GroupStanding } from "@/types"

interface GroupStandingsProps {
  groupName: string
  standings: GroupStanding[]
}

export function GroupStandings({ groupName, standings }: GroupStandingsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{groupName}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2">Rank</th>
                <th className="text-left p-2">Player</th>
                <th className="text-center p-2">W</th>
                <th className="text-center p-2">L</th>
                <th className="text-center p-2">D</th>
                <th className="text-center p-2">GF</th>
                <th className="text-center p-2">GA</th>
                <th className="text-center p-2">GD</th>
                <th className="text-center p-2 font-semibold">Pts</th>
              </tr>
            </thead>
            <tbody>
              {standings.map((standing) => {
                const isTopTwo = standing.rank <= 2
                return (
                  <tr
                    key={standing.participantId}
                    className={`border-b ${
                      isTopTwo ? "bg-primary/5" : ""
                    }`}
                  >
                    <td className="p-2">
                      <Badge variant={isTopTwo ? "default" : "secondary"}>
                        {standing.rank}
                      </Badge>
                    </td>
                    <td className="p-2 font-medium">{standing.participantName}</td>
                    <td className="text-center p-2">{standing.wins}</td>
                    <td className="text-center p-2">{standing.losses}</td>
                    <td className="text-center p-2">{standing.draws}</td>
                    <td className="text-center p-2">{standing.goalsFor}</td>
                    <td className="text-center p-2">{standing.goalsAgainst}</td>
                    <td className={`text-center p-2 ${
                      standing.goalDifference > 0 ? "text-green-600" :
                      standing.goalDifference < 0 ? "text-red-600" : ""
                    }`}>
                      {standing.goalDifference > 0 ? "+" : ""}{standing.goalDifference}
                    </td>
                    <td className="text-center p-2 font-semibold">{standing.points}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}

