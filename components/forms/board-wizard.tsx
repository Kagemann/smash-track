"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ArrowLeft, ArrowRight, Plus, X, Trophy, BarChart3 } from "lucide-react"
import { useBoardStore } from "@/lib/store/board-store"
import { useUIStore } from "@/lib/store/ui-store"
import { Board } from "@/types"

interface BoardWizardProps {
  onClose: () => void
}

type WizardStep = "type" | "details" | "participants" | "columns" | "complete"

interface BoardData {
  name: string
  type: 'LEADERBOARD' | 'MULTISCORE'
  participants: string[]
  columns: Array<{
    name: string
    type: "number" | "text" | "time"
  }>
}

export function BoardWizard({ onClose }: BoardWizardProps) {
  const router = useRouter()
  const { createBoard } = useBoardStore()
  const { showToast } = useUIStore()
  
  const [currentStep, setCurrentStep] = useState<WizardStep>("type")
  const [boardData, setBoardData] = useState<BoardData>({
    name: "",
    type: "LEADERBOARD",
    participants: [],
    columns: []
  })
  const [loading, setLoading] = useState(false)
  const [showParticipantDialog, setShowParticipantDialog] = useState(false)
  const [showColumnDialog, setShowColumnDialog] = useState(false)
  const [participantName, setParticipantName] = useState("")
  const [columnName, setColumnName] = useState("")

  const steps = [
    { id: "type", title: "Board Type", description: "Choose your board type" },
    { id: "details", title: "Board Details", description: "Set board name and settings" },
    { id: "participants", title: "Participants", description: "Add participants" },
    { id: "columns", title: "Columns", description: "Configure columns (Multiscore only)" },
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

  const handleCreateBoard = async () => {
    if (!boardData.name.trim()) {
      showToast("Please enter a board name", "error")
      return
    }

    if (boardData.participants.length === 0) {
      showToast("Please add at least one participant", "error")
      return
    }

    if (boardData.type === "MULTISCORE" && boardData.columns.length === 0) {
      showToast("Please add at least one column for multiscore boards", "error")
      return
    }

    setLoading(true)
    try {
      const newBoard = await createBoard({
        name: boardData.name,
        type: boardData.type,
        participants: boardData.participants,
        columns: boardData.columns
      })

      showToast("Board created successfully!", "success")
      onClose()
      if (newBoard) {
        router.push(`/boards/${newBoard.id}/admin`)
      }
    } catch (error) {
      showToast("Failed to create board", "error")
    } finally {
      setLoading(false)
    }
  }

  const handleAddParticipant = () => {
    if (participantName?.trim()) {
      setBoardData(prev => ({
        ...prev,
        participants: [...prev.participants, participantName.trim()]
      }))
      setParticipantName("")
      setShowParticipantDialog(false)
    }
  }

  const removeParticipant = (index: number) => {
    setBoardData(prev => ({
      ...prev,
      participants: prev.participants.filter((_, i) => i !== index)
    }))
  }

  const handleAddColumn = () => {
    if (columnName?.trim()) {
      setBoardData(prev => ({
        ...prev,
        columns: [...prev.columns, { name: columnName.trim(), type: "number" }]
      }))
      setColumnName("")
      setShowColumnDialog(false)
    }
  }

  const removeColumn = (index: number) => {
    setBoardData(prev => ({
      ...prev,
      columns: prev.columns.filter((_, i) => i !== index)
    }))
  }

  const renderStep = () => {
    switch (currentStep) {
      case "type":
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card 
                className={`cursor-pointer transition-all hover:shadow-md ${
                  boardData.type === "LEADERBOARD" ? "ring-2 ring-primary" : ""
                }`}
                onClick={() => setBoardData(prev => ({ ...prev, type: "LEADERBOARD" }))}
              >
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <Trophy className="h-6 w-6 text-primary" />
                    <CardTitle>Leaderboard</CardTitle>
                  </div>
                  <CardDescription>
                    Track scores with automatic ranking and sorting
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Automatic ranking</li>
                    <li>• Score sorting</li>
                    <li>• Rank chips</li>
                    <li>• +/- buttons</li>
                  </ul>
                </CardContent>
              </Card>

              <Card 
                className={`cursor-pointer transition-all hover:shadow-md ${
                  boardData.type === "MULTISCORE" ? "ring-2 ring-primary" : ""
                }`}
                onClick={() => setBoardData(prev => ({ ...prev, type: "MULTISCORE" }))}
              >
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <BarChart3 className="h-6 w-6 text-primary" />
                    <CardTitle>Multiscore</CardTitle>
                  </div>
                  <CardDescription>
                    Custom columns with different data types
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Custom columns</li>
                    <li>• Multiple data types</li>
                    <li>• Column reordering</li>
                    <li>• Type validation</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        )

      case "details":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="board-name">Board Name</Label>
              <Input
                id="board-name"
                placeholder="Enter board name..."
                value={boardData.name}
                onChange={(e) => setBoardData(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Board Type</Label>
              <Badge variant="secondary">
                {boardData.type === "LEADERBOARD" ? "Leaderboard" : "Multiscore"}
              </Badge>
            </div>
          </div>
        )

      case "participants":
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Participants</Label>
              <Button onClick={() => setShowParticipantDialog(true)} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Participant
              </Button>
            </div>
            
            {boardData.participants.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No participants added yet
              </div>
            ) : (
              <div className="space-y-2">
                {boardData.participants.map((participant, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <span>{participant}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeParticipant(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )

      case "columns":
        return (
          <div className="space-y-4">
            {boardData.type === "LEADERBOARD" ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>Leaderboard boards don't need custom columns.</p>
                <p className="text-sm">Scores will be tracked automatically.</p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <Label>Columns</Label>
                  <Button onClick={() => setShowColumnDialog(true)} size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Column
                  </Button>
                </div>
                
                {boardData.columns.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No columns added yet
                  </div>
                ) : (
                  <div className="space-y-2">
                    {boardData.columns.map((column, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <span>{column.name}</span>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline">{column.type}</Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeColumn(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )

      case "complete":
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Board Summary</h3>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="font-medium">Name:</span>
                  <span>{boardData.name}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="font-medium">Type:</span>
                  <Badge variant="secondary">
                    {boardData.type === "LEADERBOARD" ? "Leaderboard" : "Multiscore"}
                  </Badge>
                </div>
                
                <div className="flex justify-between">
                  <span className="font-medium">Participants:</span>
                  <span>{boardData.participants.length}</span>
                </div>
                
                {boardData.type === "MULTISCORE" && (
                  <div className="flex justify-between">
                    <span className="font-medium">Columns:</span>
                    <span>{boardData.columns.length}</span>
                  </div>
                )}
              </div>
            </div>
            
            <Separator />
            
            <div className="text-sm text-muted-foreground">
              <p>After creation, you'll get:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Admin link for managing the board</li>
                <li>Public link for viewing scores</li>
                <li>Real-time updates across all clients</li>
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
      case "type":
        return boardData.type !== null
      case "details":
        return boardData.name.trim().length > 0
      case "participants":
        return boardData.participants.length > 0
      case "columns":
        return boardData.type === "LEADERBOARD" || boardData.columns.length > 0
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
              <CardTitle>Create New Board</CardTitle>
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
              disabled={currentStep === "type"}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            
            {isLastStep ? (
              <Button
                onClick={handleCreateBoard}
                disabled={loading}
              >
                {loading ? "Creating..." : "Create Board"}
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

      {/* Add Participant Dialog */}
      <Dialog open={showParticipantDialog} onOpenChange={setShowParticipantDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Participant</DialogTitle>
            <DialogDescription>
              Enter the name of the participant to add to this board.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="participant-name">Participant Name</Label>
              <Input
                id="participant-name"
                placeholder="Enter participant name..."
                value={participantName}
                onChange={(e) => setParticipantName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleAddParticipant()
                  }
                }}
                autoFocus
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowParticipantDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddParticipant} disabled={!participantName.trim()}>
              Add
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Column Dialog */}
      <Dialog open={showColumnDialog} onOpenChange={setShowColumnDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Column</DialogTitle>
            <DialogDescription>
              Enter the name of the column to add to this multiscore board.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="column-name">Column Name</Label>
              <Input
                id="column-name"
                placeholder="Enter column name..."
                value={columnName}
                onChange={(e) => setColumnName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleAddColumn()
                  }
                }}
                autoFocus
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowColumnDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddColumn} disabled={!columnName.trim()}>
              Add
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
