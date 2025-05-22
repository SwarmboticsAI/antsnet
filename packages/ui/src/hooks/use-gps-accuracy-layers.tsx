import { useMemo } from "react";
import { ScatterplotLayer } from "@deck.gl/layers";
import { useRobotStore } from "@/stores/robot-store";
import { type Robot } from "@/types/robot";

export function useGpsAccuracyLayers() {
  const { sortedRobots: robots } = useRobotStore();

  return useMemo(() => {
    const robotsWithAccuracy = robots.filter(
      (robot) =>
        (robot.fixStatus?.horizontalAccuracyM &&
          robot.fixStatus?.horizontalAccuracyM > 1.5) ||
        (robot.fixStatus?.verticalAccuracyM &&
          robot.fixStatus?.verticalAccuracyM > 1.5)
    );

    if (robotsWithAccuracy.length === 0) {
      return [];
    }

    return [
      new ScatterplotLayer({
        id: "gps-accuracy-circles",
        data: robotsWithAccuracy,
        pickable: false,
        opacity: 0.3,
        stroked: true,
        filled: true,
        radiusScale: 1,
        radiusUnits: "meters",
        getPosition: (robot) => [
          robot.gpsCoordinates?.longitude || 0,
          robot.gpsCoordinates?.latitude || 0,
        ],
        getRadius: (robot: Robot) =>
          Math.max(
            robot.fixStatus?.horizontalAccuracyM || 0,
            robot.fixStatus?.verticalAccuracyM || 0
          ),
        getFillColor: [0, 140, 255, 20],
        getLineColor: [0, 140, 255, 150],
        getLineWidth: 4,
        lineWidthUnits: "pixels",
        updateTriggers: {
          getPosition: robots.map(
            (robot) =>
              `${robot.robotId}-${robot.gpsCoordinates?.longitude}-${robot.gpsCoordinates?.latitude}`
          ),
          getRadius: robots.map(
            (robot) =>
              `${robot.robotId}-${robot.fixStatus?.horizontalAccuracyM}-${robot.fixStatus?.verticalAccuracyM}`
          ),
        },
      }),
    ];
  }, [robots]);
}
