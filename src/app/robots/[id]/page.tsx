"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { LineLayer, ScatterplotLayer } from "@deck.gl/layers";
import {
  AlertCircle,
  ArrowDownToLine,
  ChevronLeft,
  CircleAlert,
  Target,
  Waypoints,
  X,
} from "lucide-react";

import { Sidebar } from "@/components/sidebar";
import { Button } from "@/components/ui/button";
import { SidebarProvider } from "@/components/ui/sidebar";
import { RobotMap } from "@/components/map";
import { WaypointMissionPanel } from "@/components/waypoint-mission-panel";
import VideoStreamPlayer from "@/components/video-player";

import { useStandardLayers } from "@/hooks/use-standard-layers";
import { useRobots } from "@/providers/robot-provider";
import { useSessions } from "@/providers/session-provider";
import { useBehaviors } from "@/providers/behavior-provider";
import { useBehaviorDrawing } from "@/providers/behavior-drawing-provider";
import { useGeoDrawing } from "@/providers/geo-drawing-provider";
import { useMapContext } from "@/providers/map-provider";
import { cortexStateLookup } from "@/utils/cortex-state-lookup";
import { Behavior } from "@/protos/generated/sbai_behavior_protos/sbai_behavior_protos/behavior_request";
import { Robot } from "@/types/Robot";
import { BehaviorInfo, BehaviorStatusUI } from "@/reducers/behavior-reducer";
import { useBehaviorLayers } from "@/hooks/use-active-behavior-layer";
import { useProfile } from "@/providers/profile-provider";

export default function RobotDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const standardLayers = useStandardLayers();
  const { robotList: robots } = useRobots();
  const { hasActiveSession, requestSession } = useSessions();
  const { profile } = useProfile();
  const { cancelBehavior, behaviorsByStatus } = useBehaviors();

  // Add this state to explicitly control panel visibility
  const [showWaypointPanel, setShowWaypointPanel] = useState(false);

  // Drawing providers
  const { state: drawingState, addPoint, resetDrawing } = useGeoDrawing();
  const {
    startNewBehavior,
    currentBehaviorType,
    cancelBehavior: cancelDrawing,
  } = useBehaviorDrawing();

  const { flyToRobot } = useMapContext();
  const initializationRef = useRef(false);

  // Initialize component by resetting drawing state
  useEffect(() => {
    if (initializationRef.current) return;

    // Reset drawing state on first render
    resetDrawing();
    cancelDrawing();

    initializationRef.current = true;

    return () => {
      cancelDrawing();
      resetDrawing();
      initializationRef.current = false;
      setShowWaypointPanel(false);
    };
  }, [resetDrawing, cancelDrawing]);

  // Find the current robot
  const robot: Robot | undefined = useMemo(() => {
    return robots.find((r: Robot) => r.robotId === id);
  }, [robots, id]);

  // Get TAK ID from profile
  const takId = useMemo(() => {
    if (!profile || !profile.takId) {
      return "default-tak-id";
    }
    return profile.takId;
  }, [profile]);

  // Fly to robot when it changes
  useEffect(() => {
    if (robot?.robotId) {
      flyToRobot(robot);
    }
  }, [robot?.robotId, flyToRobot]);

  // Determine robot status
  const robotStatus = useMemo(() => {
    const robotId = robot?.robotId ?? "";

    const isBusy = (behavior: BehaviorInfo) => {
      const status = behavior.robotStatuses?.[robotId]?.status;
      return (
        status === BehaviorStatusUI.ACTIVE ||
        status === BehaviorStatusUI.ACCEPTED
      );
    };

    const activeOrAccepted = Object.values(behaviorsByStatus)
      .flat()
      .filter((behavior) => behavior.robotIds.includes(robotId));

    return {
      isBusy: activeOrAccepted.some(isBusy),
      activeBehavior:
        activeOrAccepted.find((b) => b.status === BehaviorStatusUI.ACTIVE)
          ?.behaviorId ?? null,
    };
  }, [robot, behaviorsByStatus]);

  // Auto-add robot position as first waypoint when waypoint mode is activated
  useEffect(() => {
    if (
      showWaypointPanel &&
      drawingState.mode === "drawing" &&
      currentBehaviorType === Behavior.BEHAVIOR_MULTI_WAYPOINT_NAVIGATION &&
      drawingState.geoPoints.length === 0 &&
      robot?.gpsCoordinates
    ) {
      addPoint([
        robot.gpsCoordinates.latitude || 0,
        robot.gpsCoordinates.longitude || 0,
      ]);
    }
  }, [
    showWaypointPanel,
    drawingState.mode,
    currentBehaviorType,
    drawingState.geoPoints.length,
    robot,
    addPoint,
  ]);

  // Determine if we're in drawing mode
  const isDrawing = drawingState.mode === "drawing";
  const activeBehaviorLayers = useBehaviorLayers();

  // Handle starting waypoint mission
  const handleStartWaypointMission = useCallback(async () => {
    if (robotStatus.isBusy) return;

    // Cancel any existing drawing
    await cancelDrawing();
    resetDrawing();

    // Start new behavior
    startNewBehavior(Behavior.BEHAVIOR_MULTI_WAYPOINT_NAVIGATION);

    // Show the panel
    setShowWaypointPanel(true);
  }, [robotStatus.isBusy, cancelDrawing, resetDrawing, startNewBehavior]);

  // Handle cancelling waypoint mission
  const handleCancelWaypointMission = useCallback(async () => {
    await cancelDrawing();
    setShowWaypointPanel(false);
  }, [cancelDrawing]);

  // Create map layers for drawing points
  const behaviorLayers = useMemo(() => {
    if (!isDrawing || drawingState.geoPoints.length === 0) return [];

    interface Point {
      [index: number]: number; // Represents [lat, lng]
    }

    interface LineData {
      sourcePosition: [number, number];
      targetPosition: [number, number];
    }

    return [
      // Points
      new ScatterplotLayer<Point>({
        id: "points-layer",
        data: drawingState.geoPoints as Point[],
        pickable: true,
        stroked: false,
        filled: true,
        radiusUnits: "pixels",
        getPosition: (d: Point) => [d[1], d[0]], // [lng, lat] from [lat, lng]
        getRadius: 6,
        getFillColor: [250, 250, 250, 200],
        getLineColor: [200, 200, 200, 200],
        getLineWidth: 4,
      }),

      // Lines connecting points
      ...(drawingState.geoPoints.length > 1
        ? drawingState.geoPoints.slice(0, -1).map(
            (point: Point, i: number) =>
              new LineLayer<LineData>({
                id: `line-layer-${i}`,
                data: [
                  {
                    sourcePosition: [point[1], point[0]],
                    targetPosition: [
                      drawingState.geoPoints[i + 1][1],
                      drawingState.geoPoints[i + 1][0],
                    ],
                  },
                ] as LineData[],
                getWidth: 3,
                getColor: [240, 240, 240, 200],
              })
          )
        : []),
    ];
  }, [drawingState, isDrawing]);

  return (
    <div className="overflow-hidden">
      <SidebarProvider>
        <Sidebar>
          <div className="flex items-center justify-between p-2 pb-0">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                router.push("/");
              }}
              className="h-8 w-8"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h2 className="text-lg font-semibold uppercase w-full ml-2">
              {robot?.robotId}
            </h2>
          </div>
          <div className="flex flex-col h-full relative">
            <div className="flex-1 overflow-y-auto relative">
              <div className="flex flex-col justify-between h-full relative">
                <div className="flex-1 overflow-y-auto relative">
                  <div className="relative h-48">
                    {robot?.cameraStatus === 1 ? (
                      <VideoStreamPlayer ipAddress={robot?.vpnIpAddress} />
                    ) : (
                      <div className="flex flex-col h-full items-center justify-center bg-muted rounded-sm">
                        <CircleAlert className="text-yellow-500 h-8 w-8 mb-2" />
                        <h2>Camera not operable</h2>
                      </div>
                    )}
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <div className="border rounded-sm p-4">
                      <h4 className="text-xs font-semibold uppercase">Mode</h4>
                      {cortexStateLookup[robot?.mode ?? 0]}
                    </div>
                    <div className="border rounded-sm p-4">
                      <h4 className="text-xs font-semibold uppercase">Speed</h4>
                      {robot?.speed.toFixed(0).toString()} m/s
                    </div>
                    <div className="border rounded-sm p-4">
                      <h4 className="text-xs font-semibold uppercase">
                        Heading
                      </h4>
                      {robot?.heading.toFixed(0).toString()} deg
                    </div>
                    <div className="border rounded-sm p-4">
                      <h4 className="text-xs font-semibold uppercase">
                        Battery
                      </h4>
                      {robot?.battery?.toFixed(0).toString()}%
                    </div>
                  </div>
                </div>
                <div className="p-2 w-full">
                  <Button
                    size="icon"
                    variant="outline"
                    className="w-full mb-2"
                    onClick={async () => {
                      if (!robot) return;
                      flyToRobot(robot);
                    }}
                  >
                    Fly to robot
                    <Target className="h-4 w-4" />
                  </Button>

                  {hasActiveSession(robot?.robotId ?? "") ? (
                    robotStatus.isBusy ? (
                      <Button
                        size="icon"
                        variant="destructive"
                        className="w-full"
                        onClick={async () => {
                          await cancelBehavior(
                            robotStatus.activeBehavior ?? ""
                          );

                          cancelDrawing();
                          setShowWaypointPanel(false);
                        }}
                      >
                        Cancel behavior
                        <AlertCircle className="h-4 w-4" />
                      </Button>
                    ) : showWaypointPanel ? (
                      <Button
                        size="icon"
                        variant="outline"
                        className="w-full"
                        onClick={handleCancelWaypointMission}
                      >
                        Cancel waypoint mission
                        <X className="h-4 w-4" />
                      </Button>
                    ) : (
                      <Button
                        size="icon"
                        variant="outline"
                        className="w-full"
                        onClick={handleStartWaypointMission}
                      >
                        Start waypoint mission
                        <Waypoints className="h-4 w-4" />
                      </Button>
                    )
                  ) : (
                    <Button
                      size="icon"
                      variant="outline"
                      className="w-full"
                      onClick={async () => {
                        await requestSession(robot?.robotId ?? "", takId);
                      }}
                    >
                      Take control
                      <ArrowDownToLine className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Sidebar>
      </SidebarProvider>
      <RobotMap
        onDeckClick={(info) => {
          if (isDrawing && info.coordinate) {
            addPoint([info.coordinate[1], info.coordinate[0]]);
          }
        }}
        layers={[...behaviorLayers, ...standardLayers, ...activeBehaviorLayers]}
        robots={robots}
      />

      {/* Show waypoint panel purely based on our local state */}
      {showWaypointPanel && (
        <WaypointMissionPanel
          robotId={robot?.robotId ?? ""}
          onCancel={() => {
            cancelDrawing();
            setShowWaypointPanel(false);
          }}
        />
      )}
    </div>
  );
}
