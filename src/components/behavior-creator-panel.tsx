"use client";

import React from "react";
import { useRobots } from "@/providers/robot-provider";
import { Behavior } from "@/protos/generated/sbai_behavior_protos/behavior_request";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { CheckCircle, XCircle, PlayCircle } from "lucide-react";
import { Robot } from "@/types/Robot";
import { cn } from "@/lib/utils";
import { useSessions } from "@/providers/session-provider";
import { useRobotSelection } from "@/providers/robot-selection-provider";
import {
  useBehaviorCreator,
  convertBehaviorTypeToReadable,
} from "@/providers/behavior-creator-provider";

export function BehaviorCreatorPanel() {
  const {
    state,
    dispatch,
    drawState,
    behaviors,
    createBehavior,
    cancelAllBehaviors,
    cancelSingleBehavior,
    currentFields,
  } = useBehaviorCreator();

  const { robotList } = useRobots();
  const { hasActiveSession } = useSessions();

  // Use the shared robot selection context
  const {
    selectedRobotIds,
    toggleRobotSelection,
    selectAllRobots,
    clearSelection,
  } = useRobotSelection();

  const activeRobots = robotList.filter((r: Robot) =>
    hasActiveSession(r.robotId)
  );

  const handleCreateBehavior = async () => {
    if (selectedRobotIds.length === 0) {
      // toast({
      //   title: "No robots selected",
      //   description: "Please select at least one robot to create a behavior",
      //   variant: "destructive",
      // });
      return;
    }

    const result = await createBehavior();

    if (result.success) {
      // toast({
      //   title: "Behavior created",
      //   description: `${convertBehaviorTypeToReadable(
      //     state.selectedBehavior
      //   )} behavior started`,
      // });
    } else if (
      result.conflictingRobots &&
      result.conflictingRobots.length > 0
    ) {
      // toast({
      //   title: "Robot conflict",
      //   description: `${result.conflictingRobots.length} robots are already in active behaviors`,
      //   variant: "destructive",
      // });
    }
  };

  const handleToggleAll = () => {
    // If all robots are already selected, clear the selection
    // Otherwise, select all robots
    if (selectedRobotIds.length === activeRobots.length) {
      clearSelection();
    } else {
      selectAllRobots(activeRobots.map((r: Robot) => r.robotId));
    }
  };

  return (
    <aside className="fixed top-15 right-0 w-88 h-[calc(100vh-60px)] overflow-hidden bg-background border-l shadow-lg flex flex-col z-30">
      <div className="px-4 py-3 border-b">
        <h2 className="text-lg font-semibold">Play Creator</h2>
      </div>

      <div className="flex flex-col h-full flex-1 overflow-y-auto justify-between">
        <div>
          <div className="space-y-4 px-4 py-4">
            <div className="space-y-2">
              <Label>Play Type</Label>
              <Select
                value={state.selectedBehavior.toString()}
                onValueChange={(v) =>
                  dispatch({ type: "SET_BEHAVIOR_TYPE", value: parseInt(v) })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select behavior type" />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(Behavior)
                    .filter((v) => v !== Behavior.BEHAVIOR_UNSPECIFIED)
                    .filter((v) => v !== Behavior.UNRECOGNIZED)
                    .filter(
                      (v) => v !== Behavior.BEHAVIOR_MULTI_WAYPOINT_NAVIGATION
                    )
                    .filter((v) => typeof v === "number")
                    .map((value) => (
                      <SelectItem key={value} value={value.toString()}>
                        {convertBehaviorTypeToReadable(value as Behavior)}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>
                Select Robots ({selectedRobotIds.length}/{activeRobots.length})
              </Label>
              <div className="flex flex-wrap gap-2">
                {activeRobots.map((robot: Robot) => (
                  <Button
                    key={robot.robotId}
                    variant="outline"
                    className={cn(
                      "h-8",
                      selectedRobotIds.includes(robot.robotId)
                        ? "bg-blue-500!"
                        : ""
                    )}
                    size="sm"
                    onClick={() => toggleRobotSelection(robot.robotId)}
                  >
                    {robot.robotId.split("-").pop()}
                  </Button>
                ))}
              </div>
              <Button onClick={handleToggleAll} size="sm" variant="outline">
                Toggle All
              </Button>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                checked={state.useDraw}
                onCheckedChange={(val) =>
                  dispatch({ type: "TOGGLE_USE_DRAW", value: val })
                }
                id="use-draw"
              />
              <Label htmlFor="use-draw">Use Map Drawing</Label>
            </div>

            {!state.useDraw && (
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label>Latitude</Label>
                  <Input
                    type="number"
                    value={state.manualLatLng.lat}
                    onChange={(e) =>
                      dispatch({
                        type: "SET_MANUAL_LATLNG",
                        key: "lat",
                        value: parseFloat(e.target.value),
                      })
                    }
                  />
                </div>
                <div>
                  <Label>Longitude</Label>
                  <Input
                    type="number"
                    value={state.manualLatLng.lng}
                    onChange={(e) =>
                      dispatch({
                        type: "SET_MANUAL_LATLNG",
                        key: "lng",
                        value: parseFloat(e.target.value),
                      })
                    }
                  />
                </div>
              </div>
            )}

            {currentFields.map((field) => (
              <div key={field.name} className="space-y-1 h-[50px]">
                <Label>{field.label}</Label>
                <Input
                  type={field.type}
                  value={state.params[field.name] ?? field.default}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    dispatch({
                      type: "SET_PARAM",
                      key: field.name,
                      value:
                        field.type === "number"
                          ? parseFloat(e.target.value)
                          : e.target.value,
                    })
                  }
                />
              </div>
            ))}

            <Button
              className="w-full"
              onClick={handleCreateBehavior}
              disabled={
                (state.useDraw && drawState.geoPoints.length === 0) ||
                selectedRobotIds.length === 0
              }
            >
              Run Play <PlayCircle className="h-4 w-4" />
            </Button>
          </div>

          {state.currentBehaviorIds.length > 0 && (
            <div className="border-t px-4 pt-4 pb-8 space-y-2">
              <div className="flex justify-between items-center">
                <Label>Active Plays</Label>
                <Button
                  onClick={() => {
                    state.currentBehaviorIds.forEach((id) => {
                      if (
                        !["active", "accepted"].includes(behaviors[id]?.status)
                      ) {
                        dispatch({ type: "REMOVE_BEHAVIOR_ID", id });
                      }
                    });
                  }}
                  disabled={
                    !state.currentBehaviorIds.some((id) =>
                      ["completed", "cancelled", "failed"].includes(
                        behaviors[id]?.status
                      )
                    )
                  }
                  size="sm"
                  variant="outline"
                >
                  Clear
                </Button>
              </div>

              <div className="space-y-2 pr-1">
                {state.currentBehaviorIds.map((id: string) => (
                  <div
                    key={id}
                    className="flex justify-between items-center p-2 border rounded"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={cn(
                          "w-2 h-2 rounded-full",
                          behaviors[id]?.status === "active" && "bg-green-500",
                          behaviors[id]?.status === "accepted" &&
                            "bg-orange-500",
                          behaviors[id]?.status === "completed" &&
                            "bg-gray-500",
                          behaviors[id]?.status === "cancelled" && "bg-red-500",
                          behaviors[id]?.status === "failed" && "bg-red-500",
                          behaviors[id]?.status === "unspecified" &&
                            "bg-gray-500"
                        )}
                      />

                      <span className="text-sm">
                        {convertBehaviorTypeToReadable(
                          behaviors[id]?.behaviorType
                        )}
                      </span>
                      <span className="text-xs text-gray-500">
                        {behaviors[id]?.status || "unknown"}
                      </span>
                    </div>
                    {behaviors[id]?.status === "active" ||
                    behaviors[id]?.status === "accepted" ? (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => cancelSingleBehavior(id)}
                      >
                        Cancel <XCircle className="h-4 w-4" />
                      </Button>
                    ) : (
                      <div className="flex items-center gap-1">
                        {behaviors[id]?.status === "completed" ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : behaviors[id]?.status === "cancelled" ||
                          behaviors[id]?.status === "failed" ? (
                          <XCircle className="h-4 w-4 text-red-500" />
                        ) : (
                          <span className="text-gray-500">Waiting...</span>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="px-4 py-2">
          <Button
            onClick={cancelAllBehaviors}
            variant="destructive"
            className="w-full"
          >
            Cancel All Plays
          </Button>
        </div>
      </div>
    </aside>
  );
}
