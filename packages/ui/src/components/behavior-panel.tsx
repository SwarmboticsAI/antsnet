import React, { useEffect, useMemo, useState } from "react";
import { PlayCircle, ArrowLeft, ArrowRight } from "lucide-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader } from "@/components/loader";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { BehaviorQueue } from "@/components/behavior-queue";
import { useCreateBehaviorRequest } from "@/hooks/use-create-behavior-request";
import {
  useBehaviorCreator,
  convertBehaviorTypeToReadable,
} from "@/providers/behavior-creator-provider";
import { useTheme } from "@/providers/theme-provider";
import { useRobotStore } from "@/stores/robot-store";
import { useRobotSelection } from "@/providers/robot-selection-provider";
import { Behavior } from "@swarmbotics/protos/ros2_interfaces/sbai_behavior_protos/sbai_behavior_protos/behavior_request";
import { type Robot } from "@/types/robot";
import { cn } from "@/lib/utils";

export function BehaviorCreatorPanel({
  selectedRobotId,
}: {
  selectedRobotId?: string;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const { theme } = useTheme();
  const { sortedRobots: robots } = useRobotStore();

  const { sendBehaviorRequest, loading, error } =
    useCreateBehaviorRequest(selectedRobotId);
  const {
    state,
    dispatch,
    drawState,
    clearDrawing,
    removeLastPoint,
    currentFields,
  } = useBehaviorCreator();
  const {
    selectedRobotIds,
    toggleRobotSelection,
    selectAllRobots,
    clearSelection,
  } = useRobotSelection();

  useEffect(() => {
    dispatch({
      type: "SET_BEHAVIOR_TYPE",
      value: selectedRobotId
        ? Behavior.BEHAVIOR_MULTI_WAYPOINT_NAVIGATION
        : Behavior.BEHAVIOR_RALLY,
    });
  }, [selectedRobotId]);

  const behaviorOptions = useMemo(() => {
    const isSingleNavOnly = selectedRobotId != null;
    const list = isSingleNavOnly
      ? [Behavior.BEHAVIOR_MULTI_WAYPOINT_NAVIGATION]
      : Object.values(Behavior)
          .filter((v) => typeof v === "number")
          .filter(
            (v) =>
              ![
                Behavior.BEHAVIOR_UNSPECIFIED,
                Behavior.UNRECOGNIZED,
                Behavior.BEHAVIOR_RAPTOR,
                Behavior.BEHAVIOR_MULTI_WAYPOINT_NAVIGATION,
              ].includes(v as Behavior)
          );

    return list.map((value) => (
      <SelectItem key={value} value={value.toString()}>
        {convertBehaviorTypeToReadable(value as Behavior)}
      </SelectItem>
    ));
  }, [selectedRobotId]);

  const handleToggleAll = () => {
    if (selectedRobotId) return;
    if (selectedRobotIds.length === robots.length) {
      clearSelection();
    } else {
      selectAllRobots(robots.map((r: Robot) => r.robotId));
    }
  };

  if (!robots.length) return null;

  return (
    <div className="absolute right-0 top-15">
      {error && (
        <div className="bg-red-500 text-white p-2 rounded mb-4">{error}</div>
      )}
      <div className="flex">
        <Button
          className={cn(
            "h-12 w-8 absolute -left-8 top-1/2 -translate-y-1/2 flex items-center justify-center bg-background hover:bg-muted z-10",
            "rounded-l-md rounded-r-none",
            theme === "dark"
              ? "bg-yellow-600 hover:bg-yellow-700"
              : "bg-yellow-600 hover:bg-yellow-700"
          )}
          variant="default"
          onClick={() => setCollapsed(!collapsed)}
          title={collapsed ? "Show Panel" : "Hide Panel"}
        >
          {collapsed ? (
            <ArrowLeft className="text-white h-4 w-4" />
          ) : (
            <ArrowRight className="text-white h-4 w-4" />
          )}
        </Button>

        <div
          className={cn(
            "transition-all duration-300 ease-in-out relative overflow-hidden",
            collapsed ? "w-0" : "w-88"
          )}
        >
          <div
            className={cn(
              "h-[calc(100vh-60px)] w-full bg-background border-l shadow-lg flex flex-col z-30",
              theme === "dark" ? "bg-zinc-950/95" : "bg-zinc-100/95"
            )}
          >
            <div className="px-4 py-3 border-b">
              <h2 className="text-lg font-semibold">Swarm Control</h2>
            </div>

            <div className="flex flex-col flex-1 justify-between">
              <div className="flex flex-col h-full">
                <div className="space-y-4 px-4 py-4 overflow-y-auto">
                  <div className="space-y-2">
                    <Label>Type</Label>
                    <Select
                      value={state.selectedBehavior.toString()}
                      onValueChange={(v) =>
                        dispatch({
                          type: "SET_BEHAVIOR_TYPE",
                          value: parseInt(v),
                        })
                      }
                    >
                      <SelectTrigger className="w-full bg-white dark:bg-zinc-900">
                        <SelectValue placeholder="Select behavior type" />
                      </SelectTrigger>
                      <SelectContent>{behaviorOptions}</SelectContent>
                    </Select>
                  </div>

                  {!selectedRobotId && (
                    <div className="space-y-2">
                      <Label>Select Robots</Label>
                      <div className="flex flex-wrap gap-2">
                        {robots.length ? (
                          robots.map((robot: Robot) => (
                            <Button
                              key={robot.robotId}
                              variant="outline"
                              className={cn(
                                "h-8",
                                selectedRobotIds.includes(robot.robotId)
                                  ? "bg-yellow-600!"
                                  : ""
                              )}
                              size="sm"
                              onClick={() =>
                                toggleRobotSelection(robot.robotId)
                              }
                            >
                              {robot.robotId.toUpperCase()}
                            </Button>
                          ))
                        ) : (
                          <p className="text-sm text-gray-500">
                            You don't have a session with any robots.
                          </p>
                        )}
                      </div>
                      {robots.length > 1 ? (
                        <Button
                          onClick={handleToggleAll}
                          size="sm"
                          variant="outline"
                        >
                          Toggle All
                        </Button>
                      ) : null}
                    </div>
                  )}

                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={state.useDraw}
                      onCheckedChange={(val) =>
                        dispatch({ type: "TOGGLE_USE_DRAW", value: val })
                      }
                      id="use-draw"
                    />
                    <Label htmlFor="use-draw">
                      Use Map Clicks for Location
                    </Label>
                  </div>

                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      if (state.useDraw) {
                        if (drawState.geoPoints.length > 0) {
                          removeLastPoint();
                        }
                      }
                    }}
                  >
                    Remove Last Point
                  </Button>

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
                        value={
                          (state.params as Record<string, any>)[field.name] ??
                          field.default
                        }
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
                    onClick={async () => {
                      try {
                        await sendBehaviorRequest();
                        clearDrawing();
                      } catch (error) {
                        console.error("Error sending behavior request:", error);
                      }
                    }}
                    disabled={
                      (state.useDraw && drawState.geoPoints.length === 0) ||
                      selectedRobotIds.length === 0 ||
                      loading
                    }
                  >
                    {loading ? (
                      <Loader color={theme === "dark" ? "black" : "white"} />
                    ) : (
                      <>
                        Run Play <PlayCircle className="h-4 w-4" />
                      </>
                    )}
                  </Button>
                </div>
                <BehaviorQueue />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
