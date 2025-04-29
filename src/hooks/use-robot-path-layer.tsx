// use-robot-path-layer.tsx
import { useMemo } from "react";
import { PathLayer } from "@deck.gl/layers";
import { useRobotPaths } from "@/providers/robot-path-provider";
import { useBehaviors } from "@/providers/behavior-provider";
import { BehaviorStatusUI } from "@/reducers/behavior-reducer";

interface RobotPathLayerOptions {
  id?: string;
  width?: number;
  color?: [number, number, number, number];
  pickable?: boolean;
  opacity?: number;
  dashed?: boolean;
}

export function useRobotPathLayer(
  options: RobotPathLayerOptions = {}
): PathLayer {
  const { robotPaths } = useRobotPaths();
  const { behaviors } = useBehaviors();

  // Default options
  const {
    id = "robot-path-layer",
    width = 3,
    color = [0, 255, 180, 100],
    pickable = true,
    opacity = 1.0,
    dashed = true,
  } = options;

  return useMemo(() => {
    // Get active/busy robots
    const busyRobotIds = new Set<string>();

    // Check all behaviors to find which robots are busy
    Object.values(behaviors).forEach((behavior) => {
      behavior.robotIds.forEach((robotId) => {
        const status = behavior.robotStatuses?.[robotId]?.status;

        if (
          status === BehaviorStatusUI.ACTIVE ||
          status === BehaviorStatusUI.ACCEPTED
        ) {
          busyRobotIds.add(robotId);
        }
      });
    });

    console.log(`Busy robots: ${Array.from(busyRobotIds).join(", ")}`);

    // Filter robot paths to only include busy robots
    const filteredPaths = Object.entries(robotPaths)
      .filter(([robotId]) => busyRobotIds.has(robotId))
      .map(([robotId, coordinates]) => ({
        id: robotId,
        path: coordinates,
      }));

    console.log(`Showing paths for ${filteredPaths.length} busy robots`);

    // Create the layer with filtered data
    return new PathLayer({
      id,
      data: filteredPaths,
      pickable,
      visible: true,
      opacity,
      widthUnits: "pixels",
      widthMinPixels: width,
      getPath: (d: any) => d.path,
      getColor: color,
      getWidth: width,
      getDashArray: dashed ? [3, 2] : null,
    });
  }, [
    robotPaths,
    behaviors, // Now we also depend on the behaviors state
    id,
    width,
    color.join(","),
    pickable,
    opacity,
    dashed,
  ]);
}
