"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, ArrowRight, Plus, X, Trophy } from "lucide-react"
import { useTournamentStore } from "@/lib/store/tournament-store"
import { useUIStore } from "@/lib/store/ui-store"
import { Board, Participant } from "@/types"
import { boardApi } from "@/lib/services"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface TournamentWizardProps {
  onClose: () => void
  boardId?: string
}

type WizardStep = "details" | "groups" | "players" | "complete"

interface TournamentData {
  name: string
  description: string
  boardId: string
  groupSizes: number[]
  participantIds: string[]
}

export function TournamentWizard({ onClose, boardId }: TournamentWizardProps) {
  const router = useRouter()
  const { createTournament } = useTournamentStore()
  const { showToast } = useUIStore()
  
  const [currentStep, setCurrentStep] = useState<WizardStep>("details")
  const [tournamentData, setTournamentData] = useState<TournamentData>({
    name: "",
    description: "",
    boardId: boardId || "",
    groupSizes: [6, 5],
    participantIds: []
  })
  const [loading, setLoading] = useState(false)
  const [boards, setBoards] = useState<Board[]>([])
  const [participants, setParticipants] = useState<Participant[]>([])
  const [showAddParticipantDialog, setShowAddParticipantDialog] = useState(false)
  const [newParticipantName, setNewParticipantName] = useState("")
  const [addingParticipant, setAddingParticipant] = useState(false)

  useEffect(() => {
    if (boardId) {
      loadBoardParticipants(boardId)
    } else {
      loadBoards()
    }
  }, [boardId])

  const loadBoards = async () => {
    try {
      const allBoards = await boardApi.boards.getAll()
      setBoards(allBoards)
    } catch (error) {
      showToast("Failed to load boards", "error")
    }
  }

  const loadBoardParticipants = async (id: string) => {
    try {
      const board = await boardApi.boards.getById(id)
      setParticipants(board.participants || [])
    } catch (error) {
      showToast("Failed to load participants", "error")
    }
  }

  const handleAddNewParticipant = async () => {
    if (!newParticipantName.trim() || !tournamentData.boardId) {
      showToast("Please enter a participant name", "error")
      return
    }

    setAddingParticipant(true)
    try {
      const newParticipant = await boardApi.participants.create({
        name: newParticipantName.trim(),
        boardId: tournamentData.boardId,
      })
      
      // Add to participants list
      setParticipants(prev => [...prev, newParticipant])
      
      // Automatically select the new participant
      setTournamentData(prev => ({
        ...prev,
        participantIds: [...prev.participantIds, newParticipant.id]
      }))
      
      setNewParticipantName("")
      setShowAddParticipantDialog(false)
      showToast("Participant added successfully!", "success")
    } catch (error: any) {
      console.error("Error adding participant:", error)
      showToast(error?.message || "Failed to add participant", "error")
    } finally {
      setAddingParticipant(false)
    }
  }

  const steps = [
    { id: "details", title: "Tournament Details", description: "Set tournament name and board" },
    { id: "groups", title: "Group Configuration", description: "Configure groups" },
    { id: "players", title: "Add Players", description: "Select participants" },
    { id: "complete", title: "Complete", description: "Review and create" }
  ]

  const handleNext = () => {
    const currentIndex = steps.findIndex(step => step.id === currentStep)
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1].id as WizardStep)
    }
  }

  const handleBack = () => {
    const currentIndex = steps.findIndex(step => step.id === currentStep)
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1].id as WizardStep)
    }
  }

  const handleCreateTournament = async () => {
    if (!tournamentData.name.trim()) {
      showToast("Please enter a tournament name", "error")
      return
    }

    if (!tournamentData.boardId) {
      showToast("Please select a board", "error")
      return
    }

    if (tournamentData.groupSizes.length === 0) {
      showToast("Please configure at least one group", "error")
      return
    }

    if (tournamentData.participantIds.length === 0) {
      showToast("Please add at least one player", "error")
      return
    }

    const totalGroupSize = tournamentData.groupSizes.reduce((a, b) => a + b, 0)
    if (totalGroupSize !== tournamentData.participantIds.length) {
      showToast(`Player count (${tournamentData.participantIds.length}) must match group sizes sum (${totalGroupSize})`, "error")
      return
    }

    setLoading(true)
    try {
      const newTournament = await createTournament({
        name: tournamentData.name,
        description: tournamentData.description || undefined,
        boardId: tournamentData.boardId,
        groupSizes: tournamentData.groupSizes
      })

      if (newTournament) {
        // Add players
        const playersAdded = await useTournamentStore.getState().addPlayers(newTournament.id, tournamentData.participantIds)
        
        if (!playersAdded) {
          const error = useTournamentStore.getState().error
          showToast(error || "Failed to add players to tournament", "error")
          return
        }
        
        showToast("Tournament created successfully!", "success")
        onClose()
        router.push(`/tournaments/${newTournament.id}`)
      }
    } catch (error: any) {
      console.error("Error creating tournament:", error)
      const errorMessage = error?.message || error?.error || "Failed to create tournament"
      showToast(errorMessage, "error")
    } finally {
      setLoading(false)
    }
  }

  const addGroup = () => {
    setTournamentData(prev => ({
      ...prev,
      groupSizes: [...prev.groupSizes, 1]
    }))
  }

  const removeGroup = (index: number) => {
    setTournamentData(prev => ({
      ...prev,
      groupSizes: prev.groupSizes.filter((_, i) => i !== index)
    }))
  }

  const updateGroupSize = (index: number, size: number) => {
    setTournamentData(prev => ({
      ...prev,
      groupSizes: prev.groupSizes.map((s, i) => i === index ? Math.max(1, size) : s)
    }))
  }

  const toggleParticipant = (participantId: string) => {
    setTournamentData(prev => ({
      ...prev,
      participantIds: prev.participantIds.includes(participantId)
        ? prev.participantIds.filter(id => id !== participantId)
        : [...prev.participantIds, participantId]
    }))
  }

  const renderStep = () => {
    switch (currentStep) {
      case "details":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="tournament-name">Tournament Name</Label>
              <Input
                id="tournament-name"
                placeholder="Enter tournament name..."
                value={tournamentData.name}
                onChange={(e) => setTournamentData(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="tournament-description">Description (Optional)</Label>
              <Input
                id="tournament-description"
                placeholder="Enter description..."
                value={tournamentData.description}
                onChange={(e) => setTournamentData(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>

            {!boardId && (
              <div className="space-y-2">
                <Label htmlFor="board-select">Board</Label>
                <select
                  id="board-select"
                  className="w-full p-2 border rounded-md"
                  value={tournamentData.boardId}
                  onChange={(e) => {
                    const boardId = e.target.value
                    setTournamentData(prev => ({ ...prev, boardId }))
                    loadBoardParticipants(boardId)
                  }}
                >
                  <option value="">Select a board...</option>
                  {boards.map(board => (
                    <option key={board.id} value={board.id}>{board.name}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        )

      case "groups":
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Group Sizes</Label>
              <Button onClick={addGroup} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Group
              </Button>
            </div>
            
            {tournamentData.groupSizes.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No groups configured yet
              </div>
            ) : (
              <div className="space-y-2">
                {tournamentData.groupSizes.map((size, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <span className="font-medium">Group {String.fromCharCode(65 + index)}</span>
                    <div className="flex items-center space-x-2">
                      <Input
                        type="number"
                        min="1"
                        value={size}
                        onChange={(e) => updateGroupSize(index, parseInt(e.target.value) || 1)}
                        className="w-20"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeGroup(index)}
                        disabled={tournamentData.groupSizes.length === 1}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="text-sm text-muted-foreground">
              Total players needed: {tournamentData.groupSizes.reduce((a, b) => a + b, 0)}
            </div>
          </div>
        )

      case "players":
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Select Players ({tournamentData.participantIds.length} selected)</Label>
              {tournamentData.boardId && (
                <Button 
                  onClick={() => setShowAddParticipantDialog(true)} 
                  size="sm" 
                  variant="outline"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Player
                </Button>
              )}
            </div>
            
            {participants.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {tournamentData.boardId ? (
                  <div className="space-y-2">
                    <p>No participants in this board</p>
                    <Button 
                      onClick={() => setShowAddParticipantDialog(true)} 
                      size="sm" 
                      variant="outline"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add First Player
                    </Button>
                  </div>
                ) : (
                  "Select a board first"
                )}
              </div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {participants.map((participant) => (
                  <div
                    key={participant.id}
                    className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-colors ${
                      tournamentData.participantIds.includes(participant.id)
                        ? "bg-primary/10 border-primary"
                        : "hover:bg-muted"
                    }`}
                    onClick={() => toggleParticipant(participant.id)}
                  >
                    <span>{participant.name}</span>
                    {tournamentData.participantIds.includes(participant.id) && (
                      <Badge variant="default">Selected</Badge>
                    )}
                  </div>
                ))}
              </div>
            )}

            <div className="text-sm text-muted-foreground">
              Selected: {tournamentData.participantIds.length} / {tournamentData.groupSizes.reduce((a, b) => a + b, 0)} required
            </div>
          </div>
        )

      case "complete":
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Tournament Summary</h3>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="font-medium">Name:</span>
                  <span>{tournamentData.name}</span>
                </div>
                
                {tournamentData.description && (
                  <div className="flex justify-between">
                    <span className="font-medium">Description:</span>
                    <span>{tournamentData.description}</span>
                  </div>
                )}
                
                <div className="flex justify-between">
                  <span className="font-medium">Groups:</span>
                  <span>{tournamentData.groupSizes.length} ({tournamentData.groupSizes.join(", ")})</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="font-medium">Players:</span>
                  <span>{tournamentData.participantIds.length}</span>
                </div>
              </div>
            </div>
            
            <Separator />
            
            <div className="text-sm text-muted-foreground">
              <p>After creation, you'll be able to:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Draw players into groups</li>
                <li>Generate match schedule</li>
                <li>Track group standings</li>
                <li>Advance to knockout stage</li>
              </ul>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  const canProceed = () => {
    switch (currentStep) {
      case "details":
        return tournamentData.name.trim().length > 0 && tournamentData.boardId.length > 0
      case "groups":
        return tournamentData.groupSizes.length > 0
      case "players":
        return tournamentData.participantIds.length > 0
      case "complete":
        return true
      default:
        return false
    }
  }

  const isLastStep = currentStep === "complete"

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                Create Tournament
              </CardTitle>
              <CardDescription>
                {steps.find(step => step.id === currentStep)?.description}
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Progress Steps */}
          <div className="flex items-center space-x-2 mt-4">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  steps.findIndex(s => s.id === currentStep) >= index
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}>
                  {index + 1}
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-8 h-0.5 mx-2 ${
                    steps.findIndex(s => s.id === currentStep) > index
                      ? "bg-primary"
                      : "bg-muted"
                  }`} />
                )}
              </div>
            ))}
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {renderStep()}
          
          <div className="flex justify-between pt-4">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === "details"}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            
            {isLastStep ? (
              <Button
                onClick={handleCreateTournament}
                disabled={loading}
              >
                {loading ? "Creating..." : "Create Tournament"}
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                disabled={!canProceed()}
              >
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Add New Participant Dialog */}
      <Dialog open={showAddParticipantDialog} onOpenChange={setShowAddParticipantDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Player</DialogTitle>
            <DialogDescription>
              Add a new participant to the board who can participate in this tournament.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="new-participant-name">Player Name</Label>
              <Input
                id="new-participant-name"
                placeholder="Enter player name..."
                value={newParticipantName}
                onChange={(e) => setNewParticipantName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && newParticipantName.trim()) {
                    handleAddNewParticipant()
                  }
                }}
                autoFocus
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setShowAddParticipantDialog(false)
                setNewParticipantName("")
              }}
              disabled={addingParticipant}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleAddNewParticipant} 
              disabled={!newParticipantName.trim() || addingParticipant}
            >
              {addingParticipant ? "Adding..." : "Add Player"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

