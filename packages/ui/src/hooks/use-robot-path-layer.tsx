import { useMemo } from "react";
import { PathLayer } from "@deck.gl/layers";
import { useRobotPathStore } from "@/stores/robot-path-store";
import { useBehaviors } from "@/hooks/use-behaviors";

export interface RobotPathLayerOptions {
  id?: string;
  width?: number;
  color?: [number, number, number, number];
  pickable?: boolean;
  opacity?: number;
  dashed?: boolean;
}

export function useRobotPathLayer(
  options: RobotPathLayerOptions = {}
): PathLayer | null {
  const { robotPaths } = useRobotPathStore();
  const { behaviorsByStatus } = useBehaviors();

  const currentBehaviors = behaviorsByStatus.active
    .concat(behaviorsByStatus.paused)
    .concat(behaviorsByStatus.accepted);

  const {
    id = "robot-path-layer",
    width = 3,
    color = [255, 255, 255, 150],
    pickable = true,
    opacity = 1.0,
    dashed = true,
  } = options;

  return useMemo(() => {
    const data = Object.entries(robotPaths)
      .map(([robotId, path]) => {
        if (!currentBehaviors.some((b) => b.robotId === robotId)) {
          return null;
        }
        if (!path?.poses?.length) return null;

        const coords = path.poses
          .map((pose) => {
            const pos = pose?.position;
            if (
              typeof pos?.longitude === "number" &&
              typeof pos?.latitude === "number"
            ) {
              return [pos.longitude, pos.latitude];
            }
            return null;
          })
          .filter((p): p is [number, number] => p !== null);

        if (coords.length < 2) return null;

        return {
          id: robotId,
          path: coords,
        };
      })
      .filter(Boolean);

    if (data.length === 0) return null;

    return new PathLayer({
      id,
      data,
      pickable,
      visible: true,
      opacity,
      widthUnits: "pixels",
      widthMinPixels: width,
      getPath: (d) => d.path,
      getColor: color,
      getWidth: width,
      getDashArray: dashed ? [3, 2] : null,
    });
  }, [
    robotPaths,
    behaviorsByStatus,
    id,
    width,
    color.join(","),
    pickable,
    opacity,
    dashed,
  ]);
}
