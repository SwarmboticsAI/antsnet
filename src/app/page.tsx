"use client";
export const dynamic = "force-dynamic";

import { useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ArrowDownToLine, Joystick, Locate, ParkingCircle } from "lucide-react";

import { BehaviorCreatorPanel } from "@/components/behavior-creator-panel";
import { RobotMap } from "@/components/map";
import { Sidebar } from "@/components/sidebar";
import { Button } from "@/components/ui/button";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useBehaviorLayers } from "@/hooks/use-active-behavior-layer";
import { useGeoDrawLayer } from "@/hooks/use-geo-draw-layer";
import { useStandardLayers } from "@/hooks/use-standard-layers";
import { useGeoDrawing } from "@/providers/geo-drawing-provider";
import { useMapContext } from "@/providers/map-provider";
import { useProfile } from "@/providers/profile-provider";
import { useRobots } from "@/providers/robot-provider";
import { useRobotSelection } from "@/providers/robot-selection-provider";
import { useSessions } from "@/providers/session-provider";
import { getBatteryIcon } from "@/utils/get-battery-icon";
import { Robot } from "@/types/Robot";
import { cn } from "@/lib/utils";

export default function Home() {
  const { state, addPoint, resetDrawing, startDrawing } = useGeoDrawing();
  const { clearSelection, toggleRobotSelection, selectedRobotIds } =
    useRobotSelection();
  const { robotList: robots } = useRobots();
  const { profile } = useProfile();
  const { flyToRobot } = useMapContext();
  const router = useRouter();
  const geoDrawLayer = useGeoDrawLayer();
  const standardLayers = useStandardLayers();
  const activeBehaviorLayers = useBehaviorLayers();
  const {
    hasActiveSession,
    terminateSession,
    terminateMultipleSessions,
    requestSession,
    requestMultipleSessions,
  } = useSessions();

  const takId = useMemo(() => {
    if (!profile || !profile.takId) {
      console.warn(
        "No TAK ID found in profile, using default 'default-tak-id'"
      );
      return "default-tak-id";
    }
    return profile.takId;
  }, [profile]);

  const handleStartAll = async () => {
    if (robots.length === 0) return;
    // Check if all robots are already in session
    if (robots.every((robot: Robot) => hasActiveSession(robot.robotId))) {
      await terminateMultipleSessions(
        robots.map((robot: Robot) => robot.robotId)
      );
      clearSelection();
      return;
    }
    // Request sessions for all robots
    const result = await requestMultipleSessions(
      robots
        .filter((r: Robot) => !hasActiveSession(r.robotId))
        .map((robot: Robot) => robot.robotId)
    );
    console.log("Start results:", result);
  };

  const handleTakeControl = useCallback(
    async (e: React.MouseEvent, robot: Robot) => {
      e.stopPropagation();
      if (hasActiveSession(robot.robotId)) {
        await terminateSession(robot.robotId);
        if (selectedRobotIds.includes(robot.robotId)) {
          toggleRobotSelection(robot.robotId);
        }
      } else {
        await requestSession(robot.robotId, takId);
      }
    },
    [hasActiveSession, terminateSession, requestSession]
  );

  return (
    <div className="overflow-hidden">
      <SidebarProvider>
        <Sidebar>
          <div className="flex items-center justify-between p-2 pb-0">
            <h2 className="text-lg font-semibold">Robots</h2>

            {robots.length ? (
              <Button
                size="icon"
                variant="outline"
                onClick={() => {
                  handleStartAll();
                }}
                className={cn(
                  "h-8 w-8 hover:bg-primary/10",
                  robots.every((robot: Robot) =>
                    hasActiveSession(robot.robotId)
                  )
                    ? "bg-blue-500! hover:bg-blue-600!"
                    : ""
                )}
                title={
                  robots.every((robot: Robot) =>
                    hasActiveSession(robot.robotId)
                  )
                    ? "Release all robots"
                    : "Control all robots"
                }
              >
                <ArrowDownToLine className="h-3 w-3" />
              </Button>
            ) : null}
          </div>
          <div>
            {robots.map((robot: Robot) => (
              <div
                key={robot.robotId}
                className="flex flex-col gap-2 mb-2 border p-3 rounded-xs hover:bg-accent/10 cursor-pointer transition-colors"
                onClick={() => {
                  router.push(`/robots/${robot.robotId}`);
                }}
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-medium flex items-center gap-4">
                    {robot.robotId?.toUpperCase()}{" "}
                    {robot.emergencyStopStatus === 1 && (
                      <ParkingCircle className="w-4 h-4" />
                    )}
                  </h3>
                  <div className="flex items-center gap-1">
                    {getBatteryIcon(robot.battery ?? 0)}
                    <span className="text-xs">
                      {robot.battery?.toFixed(0)}%
                    </span>
                  </div>
                </div>

                <div className="flex items-end justify-between mt-1">
                  <div className="w-full max-w-full truncate pr-2">
                    <p className="text-xs">FireAnt</p>
                    <p className="text-sm truncate">
                      Operator:{" "}
                      {robot.controllingTakId === ""
                        ? "None"
                        : robot.controllingTakId}
                    </p>
                  </div>

                  <div className="flex gap-1">
                    {hasActiveSession(robot.robotId) && (
                      <Button
                        size="icon"
                        className="h-8 w-8"
                        variant="outline"
                        title="Teleop this robot"
                        onClick={(e) => {
                          e.stopPropagation();

                          router.push(`/teleop?robot_id=${robot.robotId}`);
                        }}
                      >
                        <Joystick className="h-3 w-3" />
                      </Button>
                    )}
                    <Button
                      size="icon"
                      className="h-8 w-8"
                      variant="outline"
                      title="Fly to robot"
                      onClick={(e) => {
                        e.stopPropagation();
                        flyToRobot(robot);
                      }}
                    >
                      <Locate className="h-3 w-3" />
                    </Button>
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={(e) => handleTakeControl(e, robot)}
                      className={cn(
                        "h-8 w-8 hover:bg-primary/10",
                        hasActiveSession(robot.robotId)
                          ? "bg-blue-500! hover:bg-blue-600!"
                          : ""
                      )}
                      title={
                        hasActiveSession(robot.robotId)
                          ? "Release control"
                          : "Take control"
                      }
                    >
                      <ArrowDownToLine className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Sidebar>
      </SidebarProvider>
      <RobotMap
        robots={robots}
        layers={[...standardLayers, ...geoDrawLayer, ...activeBehaviorLayers]}
        onDeckClick={(info) => {
          if (state.mode === "drawing" && selectedRobotIds.length > 0) {
            if (info?.coordinate) {
              // Swap longitude/latitude to latitude/longitude
              const [longitude, latitude] = info.coordinate;

              // For point geometry type, replace the existing point instead of adding
              if (state.geometryType === "point") {
                // Reset to empty array first
                resetDrawing();
                // Then add the new point
                setTimeout(() => {
                  startDrawing("point", state.interactionMode, state.metadata);
                  addPoint([latitude, longitude]);
                }, 10);
              } else {
                // For lines and polygons, keep adding points as normal
                addPoint([latitude, longitude]);
              }
            }
          }
        }}
      />
      <BehaviorCreatorPanel />
    </div>
  );
}
