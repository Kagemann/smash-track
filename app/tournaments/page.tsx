"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { TournamentCard } from "@/components/tournaments/tournament-card"
import { TournamentWizard } from "@/components/forms/tournament-wizard"
import { useTournamentStore } from "@/lib/store/tournament-store"
import { Plus } from "lucide-react"
import type { Tournament } from "@/types"

function TournamentsContent() {
  const searchParams = useSearchParams()
  const boardId = searchParams.get("boardId")
  const { tournaments, loading, fetchTournaments } = useTournamentStore()
  const [showWizard, setShowWizard] = useState(false)

  useEffect(() => {
    if (boardId) {
      fetchTournaments(boardId)
    }
  }, [boardId, fetchTournaments])

  if (!boardId) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Please select a board to view tournaments</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Tournaments</h1>
        <Button onClick={() => setShowWizard(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Tournament
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading tournaments...</p>
        </div>
      ) : tournaments.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">No tournaments yet</p>
          <Button onClick={() => setShowWizard(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Your First Tournament
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tournaments.map((tournament) => (
            <TournamentCard key={tournament.id} tournament={tournament} />
          ))}
        </div>
      )}

      {showWizard && (
        <TournamentWizard
          boardId={boardId}
          onClose={() => setShowWizard(false)}
        />
      )}
    </div>
  )
}

export default function TournamentsPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading tournaments...</p>
        </div>
      </div>
    }>
      <TournamentsContent />
    </Suspense>
  )
}

