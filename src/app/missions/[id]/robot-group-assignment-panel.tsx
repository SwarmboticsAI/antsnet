"use client";

import { useMemo } from "react";

import { useRobotAssignment } from "@/providers/robot-assignment-provider";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useRobots } from "@/providers/robot-provider";
import { Robot } from "@/types/Robot";
import { MissionDraft, RobotGroup } from "@/providers/mission-draft-provider";
import { Button } from "@/components/ui/button";

export function RobotGroupAssignmentPanel({
  mission,
}: {
  mission: MissionDraft;
}) {
  const { robotList } = useRobots();
  const { state, dispatch } = useRobotAssignment();

  const robotGroups = mission.robotGroups;

  const groupedRobots = useMemo(() => {
    const groupToRobots: Record<string, string[]> = {};
    for (const [robotId, groupId] of Object.entries(state.assignments)) {
      if (!groupToRobots[groupId]) groupToRobots[groupId] = [];
      groupToRobots[groupId].push(robotId);
    }
    return groupToRobots;
  }, [state.assignments]);

  // Calculate which robots are currently unassigned
  const unassignedRobots = useMemo(() => {
    const assignedRobotIds = new Set(Object.keys(state.assignments));
    return robotList.filter(
      (robot: Robot) => !assignedRobotIds.has(robot.robotId)
    );
  }, [robotList, state.assignments]);

  // Calculate which group slots are empty
  const emptySlots = useMemo(() => {
    const slots: Array<{ groupId: string; index: number }> = [];

    robotGroups.forEach((group) => {
      const assignedCount = groupedRobots[group.id]?.length || 0;

      // Add all empty slots in this group
      for (let i = assignedCount; i < group.size; i++) {
        slots.push({ groupId: group.id, index: i });
      }
    });

    return slots;
  }, [robotGroups, groupedRobots]);

  // Auto-assign available robots to empty slots
  const handleAutoAssign = () => {
    // Clear existing assignments first (optional - remove if you want to preserve existing assignments)
    // dispatch({ type: "CLEAR_ASSIGNMENTS" });

    // Get current unassigned robots
    const availableRobots = [...unassignedRobots];
    const slotsToFill = [...emptySlots];

    // Assign robots until we run out of robots or slots
    while (availableRobots.length > 0 && slotsToFill.length > 0) {
      const robot = availableRobots.shift()!;
      const slot = slotsToFill.shift()!;

      dispatch({
        type: "ASSIGN_ROBOT",
        robotId: robot.robotId,
        groupId: slot.groupId,
      });
    }
  };

  return (
    <div className="space-y-4">
      {robotGroups.map((group: RobotGroup) => (
        <Card key={group.id}>
          <CardHeader className="mb-2">
            <CardTitle>
              {group.name} ({group.size} robots)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {Array.from({ length: group.size }).map((_, idx) => {
              const assignedRobotId = groupedRobots[group.id]?.[idx] ?? "";

              return (
                <div key={idx} className="flex items-center gap-2">
                  <Label className="w-24">Slot {idx + 1}</Label>
                  <Select
                    value={assignedRobotId || "__none__"}
                    onValueChange={(value) => {
                      if (value === "__none__") {
                        dispatch({
                          type: "UNASSIGN_ROBOT",
                          robotId: assignedRobotId,
                        });
                      } else {
                        dispatch({
                          type: "ASSIGN_ROBOT",
                          robotId: value,
                          groupId: group.id,
                        });
                      }
                    }}
                  >
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Select robot" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">Unassigned</SelectItem>
                      {robotList.map((robot: Robot) => (
                        <SelectItem key={robot.robotId} value={robot.robotId}>
                          {robot.robotId}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              );
            })}
          </CardContent>
          <CardFooter>
            <div className="text-xs text-gray-500">
              {groupedRobots[group.id]?.length || 0} of {group.size} slots
              filled
            </div>
          </CardFooter>
        </Card>
      ))}
      <Button
        onClick={handleAutoAssign}
        disabled={unassignedRobots.length === 0 || emptySlots.length === 0}
      >
        Auto-Assign ({unassignedRobots.length} available)
      </Button>
    </div>
  );
}
