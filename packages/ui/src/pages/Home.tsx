import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertCircleIcon } from "lucide-react";

import { BehaviorCreatorPanel } from "@/components/behavior-panel";
import { RobotMap } from "@/components/map";
import { Sidebar } from "@/components/sidebar";
import { Button } from "@/components/ui/button";
import { useBehaviorLayers } from "@/hooks/use-active-behavior-layer";
import { useGeoDrawLayer } from "@/hooks/use-geo-draw-layer";
import { useRobotPathLayer } from "@/hooks/use-robot-path-layer";
import { useGpsAccuracyLayers } from "@/hooks/use-gps-accuracy-layers";
import { useBehaviors } from "@/hooks/use-behaviors";
import { useGeoDrawing } from "@/providers/geo-drawing-provider";
import { useRobotSelection } from "@/providers/robot-selection-provider";
import { useRobotStore } from "@/stores/robot-store";
import type { Robot } from "@/types/robot";

export function Home() {
  const navigate = useNavigate();
  const [selectedRobotId, setSelectedRobotId] = useState<string>();
  const { state, addPoint, resetDrawing, startDrawing } = useGeoDrawing();
  const { sortedRobots: robots } = useRobotStore();
  const geoDrawLayer = useGeoDrawLayer();
  const activeBehaviorLayers = useBehaviorLayers();
  const robotPathLayer = useRobotPathLayer();
  const gpsAccuracyLayers = useGpsAccuracyLayers();
  const { selectedRobotIds, setSelectedRobotIds, clearSelection } =
    useRobotSelection();
  const { behaviorsByStatus, getBehaviorsThatNeedIntervention } =
    useBehaviors();

  const behaviorsThatNeedIntervention = getBehaviorsThatNeedIntervention();
  const robotsThatNeedIntervention = useMemo(() => {
    return Array.from(
      new Set(behaviorsThatNeedIntervention.map((b) => b.robotId))
    );
  }, [behaviorsThatNeedIntervention]);

  useEffect(() => {
    if (selectedRobotId) {
      setSelectedRobotIds([selectedRobotId]);
    } else {
      clearSelection();
    }
  }, [selectedRobotId]);

  return (
    <div className="flex flex-col h-full w-full absolute">
      {behaviorsThatNeedIntervention.length > 0 && (
        <div className="flex rounded-t-md justify-between items-center absolute bottom-0 w-150 left-1/2 -translate-x-1/2 z-50 bg-red-500 text-white p-4">
          <div className="flex items-center">
            <AlertCircleIcon className="h-5 w-5 mr-2 text-white" />
            <p>
              {robotsThatNeedIntervention.length} robot
              {robotsThatNeedIntervention.length > 1 ? "s" : ""} need
              {robotsThatNeedIntervention.length === 1 ? "s" : ""} intervention.
            </p>
          </div>
          <div className="flex items-center">
            <Button
              size="sm"
              onClick={() => {
                const first = behaviorsThatNeedIntervention[0];
                if (first?.robotId && first?.behaviorId) {
                  navigate(
                    `/teleop?robot_id=${first.robotId}&intervention=true&behavior_id=${first.behaviorId}`
                  );
                }
              }}
              className="mr-2 !bg-white text-red-500"
            >
              Go to Teleop
            </Button>
          </div>
        </div>
      )}

      <Sidebar
        selectedRobotId={selectedRobotId}
        setSelectedRobotId={setSelectedRobotId}
      />

      <RobotMap
        robots={robots}
        selectedRobotId={selectedRobotId}
        layers={[
          ...geoDrawLayer,
          ...activeBehaviorLayers,
          ...gpsAccuracyLayers,
          ...(robotPathLayer ? [robotPathLayer] : []),
        ]}
        onDeckClick={(info) => {
          if (state.mode === "drawing" && selectedRobotIds.length > 0) {
            if (info?.coordinate) {
              const [longitude, latitude] = info.coordinate;

              if (state.geometryType === "point") {
                resetDrawing();
                setTimeout(() => {
                  startDrawing("point", state.interactionMode, state.metadata);
                  if (latitude !== undefined && longitude !== undefined) {
                    addPoint([latitude, longitude]);
                  }
                }, 10);
              } else {
                if (
                  state.geometryType === "line" &&
                  state.geoPoints.length === 0
                ) {
                  const initialRobot = robots.find(
                    (robot: Robot) => robot.robotId === selectedRobotId
                  );

                  const hasActive = behaviorsByStatus.active.some(
                    (b) => b.robotId === initialRobot?.robotId
                  );

                  if (initialRobot && !hasActive) {
                    const pos = initialRobot.gpsCoordinates;
                    if (pos) {
                      addPoint([pos.latitude, pos.longitude]);
                    }
                  }
                }

                if (latitude !== undefined && longitude !== undefined) {
                  addPoint([latitude, longitude]);
                }
              }
            }
          }
        }}
      />

      <BehaviorCreatorPanel selectedRobotId={selectedRobotId} />
    </div>
  );
}
