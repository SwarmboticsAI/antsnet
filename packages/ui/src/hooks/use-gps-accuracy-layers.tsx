import { useMemo } from "react";
import { ScatterplotLayer } from "@deck.gl/layers";
import { useRobotSystemStore } from "@/stores/system-store";
import { useRobotStore } from "@/stores/robot-store";
import { useRobotLocalizationStore } from "@/stores/localization-store";

export function useGpsAccuracyLayers() {
  const { sortedRobots: robots } = useRobotStore();
  const { systemTables } = useRobotSystemStore();
  const { localizationTables } = useRobotLocalizationStore();

  return useMemo(() => {
    const robotSystemTablesWithAccuracy = Object.entries(systemTables).filter(
      ([, systemTable]) =>
        (systemTable.fix_status?.horizontalAccuracyM !== undefined &&
          systemTable.fix_status.horizontalAccuracyM > 1.5) ||
        (systemTable.fix_status?.verticalAccuracyM !== undefined &&
          systemTable.fix_status?.verticalAccuracyM > 1.5)
    );

    if (robotSystemTablesWithAccuracy.length === 0) {
      return [];
    }

    return [
      new ScatterplotLayer({
        id: "gps-accuracy-circles",
        data: robotSystemTablesWithAccuracy,
        pickable: false,
        opacity: 0.3,
        stroked: true,
        filled: true,
        radiusScale: 1,
        radiusUnits: "meters",
        getPosition: ([robotId]) => [
          localizationTables[robotId]?.localization_data?.gpsCoordinate
            ?.longitude || 0,
          localizationTables[robotId]?.localization_data?.gpsCoordinate
            ?.latitude || 0,
        ],
        getRadius: ([, systemTable]) =>
          Math.max(
            systemTable.fix_status?.horizontalAccuracyM || 0,
            systemTable.fix_status?.verticalAccuracyM || 0
          ),
        getFillColor: [0, 140, 255, 20],
        getLineColor: [0, 140, 255, 150],
        getLineWidth: 4,
        lineWidthUnits: "pixels",
        updateTriggers: {
          getPosition: robots.map(
            (robot) =>
              `${robot.robotId}-${
                localizationTables[robot.robotId]?.localization_data
                  ?.gpsCoordinate?.longitude
              }-${
                localizationTables[robot.robotId]?.localization_data
                  ?.gpsCoordinate?.latitude
              }`
          ),
          getRadius: robotSystemTablesWithAccuracy.map(
            ([robotId, systemTable]) =>
              `${robotId}-${systemTable.fix_status?.horizontalAccuracyM}-${systemTable.fix_status?.verticalAccuracyM}`
          ),
        },
      }),
    ];
  }, [robots]);
}
