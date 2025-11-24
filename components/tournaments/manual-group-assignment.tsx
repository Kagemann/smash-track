"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Participant, TournamentParticipant } from "@/types"
import { Users, X, Check } from "lucide-react"

interface ManualGroupAssignmentProps {
  participants: TournamentParticipant[]
  groupSizes: number[]
  onAssign: (assignments: Record<string, number>) => void // participantId -> groupIndex
  onCancel: () => void
  loading?: boolean
}

export function ManualGroupAssignment({
  participants,
  groupSizes,
  onAssign,
  onCancel,
  loading = false,
}: ManualGroupAssignmentProps) {
  // Map of participantId -> groupIndex (0-based, -1 means unassigned)
  const [assignments, setAssignments] = useState<Map<string, number>>(new Map())
  const [groups, setGroups] = useState<Array<{ id: string; name: string; maxSize: number }>>([])

  useEffect(() => {
    // Initialize groups
    const initialGroups = groupSizes.map((size, index) => ({
      id: `group-${index}`,
      name: `Group ${String.fromCharCode(65 + index)}`,
      maxSize: size,
    }))
    setGroups(initialGroups)
    
    // Initialize all participants as unassigned
    const initialAssignments = new Map<string, number>()
    participants.forEach((tp) => {
      initialAssignments.set(tp.participantId, -1)
    })
    setAssignments(initialAssignments)
  }, [participants, groupSizes])

  const assignToGroup = (participantId: string, groupIndex: number) => {
    setAssignments((prev) => {
      const newAssignments = new Map(prev)
      newAssignments.set(participantId, groupIndex)
      return newAssignments
    })
  }

  const removeFromGroup = (participantId: string) => {
    setAssignments((prev) => {
      const newAssignments = new Map(prev)
      newAssignments.set(participantId, -1)
      return newAssignments
    })
  }

  const getParticipantsInGroup = (groupIndex: number) => {
    return participants.filter((tp) => assignments.get(tp.participantId) === groupIndex)
  }

  const getUnassignedParticipants = () => {
    return participants.filter((tp) => {
      const assignment = assignments.get(tp.participantId)
      return assignment === undefined || assignment === -1
    })
  }

  const isGroupFull = (groupIndex: number) => {
    return getParticipantsInGroup(groupIndex).length >= groups[groupIndex]?.maxSize
  }

  const canAssign = () => {
    // Check if all participants are assigned
    const allAssigned = participants.every((tp) => {
      const assignment = assignments.get(tp.participantId)
      return assignment !== undefined && assignment !== -1
    })

    // Check if all groups are filled to capacity
    const allGroupsFilled = groups.every((group, index) => {
      return getParticipantsInGroup(index).length === group.maxSize
    })

    return allAssigned && allGroupsFilled
  }

  const handleConfirm = () => {
    // Convert assignments to Record<participantId, groupIndex>
    const assignmentRecord: Record<string, number> = {}
    assignments.forEach((groupIndex, participantId) => {
      if (groupIndex !== -1) {
        assignmentRecord[participantId] = groupIndex
      }
    })
    onAssign(assignmentRecord)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Manual Group Assignment</h3>
          <p className="text-sm text-muted-foreground">
            Drag or click to assign players to groups
          </p>
        </div>
        <Button variant="outline" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
      </div>

      {/* Groups */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {groups.map((group, groupIndex) => {
          const groupParticipants = getParticipantsInGroup(groupIndex)
          const isFull = isGroupFull(groupIndex)
          
          return (
            <Card
              key={group.id}
              className={`${isFull ? "border-green-500" : ""} ${
                groupParticipants.length > group.maxSize ? "border-red-500" : ""
              }`}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{group.name}</CardTitle>
                  <Badge variant={isFull ? "default" : "secondary"}>
                    {groupParticipants.length} / {group.maxSize}
                  </Badge>
                </div>
                <CardDescription>
                  {isFull ? "Group is full" : `${group.maxSize - groupParticipants.length} spots remaining`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 min-h-[200px]">
                  {groupParticipants.map((tp) => (
                    <div
                      key={tp.participantId}
                      className="flex items-center justify-between p-2 border rounded-lg bg-muted/50"
                    >
                      <span className="text-sm font-medium">
                        {tp.participant.name}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFromGroup(tp.participantId)}
                        disabled={loading}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  {groupParticipants.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground text-sm">
                      No players assigned
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Unassigned Participants */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="h-4 w-4" />
            Unassigned Players
          </CardTitle>
          <CardDescription>
            Click a player to assign them to a group
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {getUnassignedParticipants().map((tp) => (
              <div
                key={tp.participantId}
                className="p-3 border rounded-lg hover:bg-muted cursor-pointer transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium truncate">
                    {tp.participant.name}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {groups.map((group, groupIndex) => {
                    const canAdd = !isGroupFull(groupIndex)
                    return (
                      <Button
                        key={group.id}
                        variant="outline"
                        size="sm"
                        className="text-xs"
                        disabled={!canAdd || loading}
                        onClick={() => assignToGroup(tp.participantId, groupIndex)}
                      >
                        {group.name}
                      </Button>
                    )
                  })}
                </div>
              </div>
            ))}
            {getUnassignedParticipants().length === 0 && (
              <div className="col-span-full text-center py-8 text-muted-foreground text-sm">
                All players assigned
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Confirm Button */}
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleConfirm}
          disabled={!canAssign() || loading}
        >
          {loading ? "Assigning..." : "Confirm Assignment"}
          <Check className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  )
}

