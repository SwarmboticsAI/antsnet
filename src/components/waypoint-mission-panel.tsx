"use client";

import { useEffect, useState } from "react";
import { point as turfPoint } from "@turf/helpers";
import distance from "@turf/distance";
import bearing from "@turf/bearing";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { useBehaviorDrawing } from "@/providers/behavior-drawing-provider";
import { useGeoDrawing } from "@/providers/geo-drawing-provider";
import { useRobotSelection } from "@/providers/robot-selection-provider";
import { useBehaviorCreator } from "@/providers/behavior-creator-provider";
import { Behavior } from "@/protos/generated/sbai_behavior_protos/sbai_behavior_protos/behavior_request";

interface WaypointMissionPanelProps {
  robotId: string;
  manualInit?: boolean;
  onCancel?: () => void;
}

export function WaypointMissionPanel({
  robotId,
  manualInit = false,
  onCancel,
}: WaypointMissionPanelProps) {
  // Get behavior drawing state for behavior-specific actions
  const { currentBehaviorType } = useBehaviorDrawing();

  // Get core drawing state and operations
  const { state: drawingState, removeLastPoint } = useGeoDrawing();

  // Get behavior creator context for creating behaviors
  const { dispatch, createBehavior } = useBehaviorCreator();

  // Get robot selection context to set the selected robot
  const { setSelectedRobotIds } = useRobotSelection();

  // Only show the panel for multi-waypoint navigation behaviors in drawing mode
  const isWaypointNavigation =
    currentBehaviorType === Behavior.BEHAVIOR_MULTI_WAYPOINT_NAVIGATION;
  const isDrawing = drawingState.mode === "drawing";

  useEffect(() => {
    const geoPoints = drawingState.geoPoints;

    if (geoPoints.length >= 2) {
      const len = geoPoints.length;
      const from = turfPoint([geoPoints[len - 2][1], geoPoints[len - 2][0]]);
      const to = turfPoint([geoPoints[len - 1][1], geoPoints[len - 1][0]]);
      const yaw = bearing(from, to);

      console.log("geoPoints", geoPoints);
      console.log("yaw", yaw);

      dispatch({
        type: "SET_PARAM",
        key: "desiredFinalYawDeg",
        value: yaw ?? undefined,
      });
    } else {
      dispatch({
        type: "SET_PARAM",
        key: "desiredFinalYawDeg",
        value: undefined,
      });
    }
  }, [drawingState.geoPoints]);

  // When the component loads, set the selected robot ID
  useEffect(() => {
    if (robotId) {
      // Always select the robot
      setSelectedRobotIds([robotId]);

      // Only initialize behavior type if not manually initialized
      if (!manualInit) {
        // Set the behavior type to waypoint navigation
        dispatch({
          type: "SET_BEHAVIOR_TYPE",
          value: Behavior.BEHAVIOR_MULTI_WAYPOINT_NAVIGATION,
        });

        // Enable drawing mode
        dispatch({ type: "TOGGLE_USE_DRAW", value: true });
      }
    }
  }, [robotId, manualInit, setSelectedRobotIds, dispatch]);

  if (
    !isDrawing ||
    !isWaypointNavigation ||
    drawingState.geoPoints.length === 0
  ) {
    return null;
  }

  interface Point extends Array<number> {
    0: number; // Latitude
    1: number; // Longitude
  }

  // Calculate total distance between all points
  const totalDistance: number = drawingState.geoPoints.reduce(
    (acc: number, curr: Point, i: number, arr: Point[]) => {
      if (i === arr.length - 1) return acc; // skip last point
      const from = turfPoint([curr[1], curr[0]]); // Convert to [lng, lat] for turf
      const to = turfPoint([arr[i + 1][1], arr[i + 1][0]]);
      const dist = distance(from, to, { units: "meters" });
      return acc + dist;
    },
    0
  );

  // Get actual waypoints (all points except the first one)
  const actualWaypoints = drawingState.geoPoints.slice(1);
  const hasActualWaypoints = actualWaypoints.length > 0;

  const executeWaypointMission = async () => {
    if (!hasActualWaypoints) return;

    // Create the behavior
    const result = await createBehavior();

    if (result.success && result.behaviorId) {
      console.log(`Waypoint mission created with ID: ${result.behaviorId}`);

      onCancel?.();
    } else if (
      result.conflictingRobots &&
      result.conflictingRobots.length > 0
    ) {
      console.warn(`Robot ${robotId} is already in an active behavior`);
    } else {
      console.error("Failed to create waypoint mission", result.error);
    }
  };

  return (
    <Card className="bg-background gap-0 p-0 pt-2 absolute top-20 right-4 z-[2] rounded-lg shadow-lg pointer-events-auto max-w-md">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg text-center">
          Waypoint Nav Panel
        </CardTitle>
      </CardHeader>

      <CardContent className="px-0">
        <div className="space-y-2 text-sm text-muted-foreground max-h-72 px-6 overflow-y-auto pb-6">
          {drawingState.geoPoints.map(
            (point: [number, number], index: number) => {
              const curr = turfPoint([point[1], point[0]]); // Convert to [lng, lat] for turf
              const next = drawingState.geoPoints[index + 1]
                ? turfPoint([
                    drawingState.geoPoints[index + 1][1],
                    drawingState.geoPoints[index + 1][0],
                  ])
                : null;

              const dist =
                next !== null
                  ? distance(curr, next, { units: "meters" })
                  : null;

              return (
                <div key={index} className="relative pl-6">
                  <div className="absolute left-0 top-[6px] w-2 h-2 bg-orange-500 rounded-full" />
                  <div className="font-medium text-foreground">
                    {index === 0 ? (
                      <span className="text-muted-foreground">
                        Start Position
                      </span>
                    ) : (
                      <>Waypoint {index}</>
                    )}
                    {" — "}
                    <span className="text-xs font-normal text-muted-foreground">
                      {point[0].toFixed(4)}, {point[1].toFixed(4)}
                    </span>
                  </div>
                  {dist !== null && (
                    <div className="text-xs pl-1 text-gray-500">
                      ↳ {dist.toFixed(1)} m
                    </div>
                  )}
                </div>
              );
            }
          )}

          {!hasActualWaypoints && (
            <div className="text-center mt-4 text-muted-foreground">
              <p>Click on the map to add waypoints</p>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="flex flex-col gap-4 border-t pb-4">
        <div className="w-full flex gap-2 justify-between items-center">
          <div className="font-medium">Total Distance:</div>
          <div className="font-bold">{totalDistance.toFixed(1)} meters</div>
        </div>

        <div className="flex flex-col w-full gap-2">
          <Button
            variant="outline"
            onClick={() => {
              if (drawingState.geoPoints.length > 1) {
                removeLastPoint();
              }
            }}
            className="w-full"
            disabled={drawingState.geoPoints.length <= 1}
          >
            Remove Last Waypoint
          </Button>
          <div className="flex gap-2">
            <Button
              onClick={executeWaypointMission}
              className="flex-1"
              disabled={!hasActualWaypoints}
            >
              {hasActualWaypoints ? "Start Navigation" : "Add waypoints first"}
            </Button>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
