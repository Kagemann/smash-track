"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { GroupStandings } from "@/components/tournaments/group-standings"
import { MatchSchedule } from "@/components/tournaments/match-schedule"
import { BracketView } from "@/components/tournaments/bracket-view"
import { MatchDialog } from "@/components/tournaments/match-dialog"
import { ManualGroupAssignment } from "@/components/tournaments/manual-group-assignment"
import { useTournamentStore } from "@/lib/store/tournament-store"
import { useUIStore } from "@/lib/store/ui-store"
import { tournamentService } from "@/lib/services"
import { Trophy, Users, Calendar, ArrowLeft, Shuffle, Hand } from "lucide-react"
import type { GroupStanding, Match } from "@/types"
import Link from "next/link"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export default function TournamentDetailPage() {
  const params = useParams()
  const router = useRouter()
  const tournamentId = params.id as string
  const { currentTournament, loading, fetchTournament, drawGroups, generateSchedule, advanceToKnockout } = useTournamentStore()
  const { showToast } = useUIStore()
  const [groupStandings, setGroupStandings] = useState<Array<{ group: any; standings: GroupStanding[] }>>([])
  const [knockoutBracket, setKnockoutBracket] = useState<{ semifinals: any[]; finals: any[] } | null>(null)
  const [activeTab, setActiveTab] = useState("overview")
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null)
  const [matchDialogOpen, setMatchDialogOpen] = useState(false)
  const [showManualAssignment, setShowManualAssignment] = useState(false)
  const [assigningGroups, setAssigningGroups] = useState(false)

  useEffect(() => {
    if (tournamentId) {
      loadTournament()
    }
  }, [tournamentId])

  useEffect(() => {
    if (currentTournament) {
      if (currentTournament.phase === "GROUP_STAGE" || currentTournament.phase === "KNOCKOUT") {
        loadGroupStandings()
      }
      if (currentTournament.phase === "KNOCKOUT" || currentTournament.phase === "COMPLETED") {
        loadKnockoutBracket()
      }
    }
  }, [currentTournament])

  const loadTournament = async () => {
    await fetchTournament(tournamentId)
  }

  const loadGroupStandings = async () => {
    try {
      const standings = await tournamentService.getGroupStandings(tournamentId)
      // Convert to expected format
      if (currentTournament?.groups) {
        const formatted = currentTournament.groups.map((group, index) => ({
          group: { id: group.id, name: group.name },
          standings: standings[index] || []
        }))
        setGroupStandings(formatted)
      }
    } catch (error) {
      showToast("Failed to load group standings", "error")
    }
  }

  const loadKnockoutBracket = async () => {
    try {
      const bracket = await tournamentService.getKnockoutBracket(tournamentId)
      setKnockoutBracket(bracket)
    } catch (error) {
      showToast("Failed to load knockout bracket", "error")
    }
  }

  const handleDrawGroups = async () => {
    const success = await drawGroups(tournamentId)
    if (success) {
      showToast("Groups drawn successfully!", "success")
      await loadTournament()
      setActiveTab("groups")
    } else {
      showToast("Failed to draw groups", "error")
    }
  }

  const handleManualAssignment = async (assignments: Record<string, number>) => {
    if (!currentTournament) return

    setAssigningGroups(true)
    try {
      const success = await drawGroups(tournamentId, assignments)
      if (success) {
        showToast("Groups assigned successfully!", "success")
        setShowManualAssignment(false)
        await loadTournament()
        setActiveTab("groups")
      } else {
        showToast("Failed to assign groups", "error")
      }
    } catch (error: any) {
      showToast(error.message || "Failed to assign groups", "error")
    } finally {
      setAssigningGroups(false)
    }
  }

  const handleGenerateSchedule = async () => {
    const success = await generateSchedule(tournamentId)
    if (success) {
      showToast("Schedule generated successfully!", "success")
      await loadTournament()
    } else {
      showToast("Failed to generate schedule", "error")
    }
  }

  const handleAdvanceToKnockout = async () => {
    const success = await advanceToKnockout(tournamentId)
    if (success) {
      showToast("Advanced to knockout stage!", "success")
      await loadTournament()
      await loadKnockoutBracket()
    } else {
      showToast("Failed to advance to knockout", "error")
    }
  }

  const handleMatchClick = (match: Match) => {
    setSelectedMatch(match)
    setMatchDialogOpen(true)
  }

  const handleStartMatch = async (matchId: string) => {
    try {
      // Use PUT to update match status to IN_PROGRESS
      const response = await fetch(`/api/matches/${matchId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'IN_PROGRESS',
        }),
      })
      
      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to start match')
      }
      
      showToast("Match started!", "success")
      await loadTournament()
    } catch (error: any) {
      showToast(error?.message || "Failed to start match", "error")
      throw error
    }
  }

  const handleCompleteMatch = async (matchId: string, player1Score: number, player2Score: number) => {
    try {
      // Use PUT with action=complete for tournament matches
      const response = await fetch(`/api/matches/${matchId}?action=complete`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          player1Score,
          player2Score,
          customScores: {},
        }),
      })
      
      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to complete match')
      }
      
      showToast("Match completed!", "success")
      await loadTournament()
      if (currentTournament?.phase === "GROUP_STAGE") {
        await loadGroupStandings()
      }
    } catch (error: any) {
      showToast(error?.message || "Failed to complete match", "error")
      throw error
    }
  }

  if (loading || !currentTournament) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading tournament...</p>
        </div>
      </div>
    )
  }

  const allGroupMatchesComplete = currentTournament.groups.every((group) =>
    group.matches.every((match) => match.status === "COMPLETED")
  )

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <Link href={`/boards/${currentTournament.boardId}/admin`}>
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Board
          </Button>
        </Link>
        
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Trophy className="h-6 w-6" />
              {currentTournament.name}
            </h1>
            {currentTournament.description && (
              <p className="text-muted-foreground mt-2">{currentTournament.description}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline">{currentTournament.status}</Badge>
            <Badge>{currentTournament.phase.replace("_", " ")}</Badge>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          {currentTournament.phase !== "SETUP" && (
            <TabsTrigger value="groups">Groups</TabsTrigger>
          )}
          {currentTournament.phase === "GROUP_STAGE" && (
            <TabsTrigger value="schedule">Schedule</TabsTrigger>
          )}
          {(currentTournament.phase === "KNOCKOUT" || currentTournament.phase === "COMPLETED") && (
            <TabsTrigger value="knockout">Knockout</TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Tournament Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Players</p>
                  <p className="text-lg font-semibold flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    {currentTournament.participants.length}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Created</p>
                  <p className="text-lg font-semibold flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {new Date(currentTournament.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {currentTournament.phase === "SETUP" && (
                <div className="pt-4 border-t space-y-2">
                  <p className="text-sm text-muted-foreground mb-2">
                    Add players, then draw or manually assign groups to continue
                  </p>
                  {currentTournament.participants.length > 0 && (
                    <div className="flex gap-2">
                      <Button 
                        onClick={handleDrawGroups} 
                        variant="outline"
                        className="flex-1"
                      >
                        <Shuffle className="h-4 w-4 mr-2" />
                        Random Draw
                      </Button>
                      <Button 
                        onClick={() => setShowManualAssignment(true)} 
                        variant="outline"
                        className="flex-1"
                      >
                        <Hand className="h-4 w-4 mr-2" />
                        Manual Assign
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {currentTournament.phase === "GROUP_DRAW" && (
                <div className="pt-4 border-t">
                  <Button onClick={handleGenerateSchedule} className="w-full">
                    Generate Match Schedule
                  </Button>
                </div>
              )}

              {currentTournament.phase === "GROUP_STAGE" && allGroupMatchesComplete && (
                <div className="pt-4 border-t">
                  <Button onClick={handleAdvanceToKnockout} className="w-full">
                    Advance to Knockout Stage
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="groups" className="space-y-4">
          {groupStandings.length > 0 ? (
            groupStandings.map((groupData) => (
              <GroupStandings
                key={groupData.group.id}
                groupName={groupData.group.name}
                standings={groupData.standings}
              />
            ))
          ) : (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                No group standings available yet
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="schedule">
          {currentTournament.groups.length > 0 ? (
            <MatchSchedule 
              groups={currentTournament.groups} 
              onMatchClick={handleMatchClick}
              boardId={currentTournament.boardId}
            />
          ) : (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                No matches scheduled yet
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="knockout">
          {knockoutBracket ? (
            <BracketView
              semifinals={knockoutBracket.semifinals}
              finals={knockoutBracket.finals}
              onMatchClick={handleMatchClick}
            />
          ) : (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                Knockout bracket not available yet
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Match Dialog */}
      <MatchDialog
        match={selectedMatch}
        open={matchDialogOpen}
        onOpenChange={setMatchDialogOpen}
        onStart={handleStartMatch}
        onComplete={handleCompleteMatch}
      />

      {/* Manual Group Assignment Dialog */}
      {currentTournament && currentTournament.phase === "SETUP" && (
        <Dialog open={showManualAssignment} onOpenChange={setShowManualAssignment}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Manual Group Assignment</DialogTitle>
            </DialogHeader>
            <ManualGroupAssignment
              participants={currentTournament.participants}
              groupSizes={(currentTournament.groupConfig as { groupSizes: number[] }).groupSizes}
              onAssign={handleManualAssignment}
              onCancel={() => setShowManualAssignment(false)}
              loading={assigningGroups}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

