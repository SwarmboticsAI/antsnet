import { useMemo } from "react";
import { ScatterplotLayer, PathLayer, PolygonLayer } from "@deck.gl/layers";
import { Behavior } from "@/protos/generated/sbai_behavior_protos/sbai_behavior_protos/behavior_request";
import { useBehaviors } from "@/providers/behavior-provider";
import { useRobots } from "@/providers/robot-provider";
import { BehaviorInfo, BehaviorStatusUI } from "@/reducers/behavior-reducer";

type DeckLayer = ScatterplotLayer | PathLayer | PolygonLayer;

export function useBehaviorLayers(): DeckLayer[] {
  const { behaviors } = useBehaviors();
  const { robotList } = useRobots();

  return useMemo(() => {
    // Get active behaviors
    const activeBehaviors = Object.values(behaviors).filter(
      (b) =>
        b.status === BehaviorStatusUI.ACTIVE ||
        b.status === BehaviorStatusUI.ACCEPTED
    );

    return activeBehaviors.flatMap((behavior: BehaviorInfo): DeckLayer[] => {
      // For now, use the original parameters to visualize the intent
      const { behaviorType, behaviorId, params = {} } = behavior;
      const geoPoints = params.geoPoints || [];

      if (!geoPoints.length) return [];

      // Style based on behavior type
      switch (behaviorType) {
        case Behavior.BEHAVIOR_MULTI_WAYPOINT_NAVIGATION:
          return [
            // Points for waypoints plus initial robot position
            new ScatterplotLayer({
              id: `waypoint-${behaviorId}`,
              data: geoPoints,
              getPosition: (d: any) => [d[1], d[0]],
              getFillColor: () => [255, 165, 0, 200], // Orange for waypoints
              getRadius: () => 6,
              radiusUnits: "pixels",
              pickable: true,
            }),
            // Lines between all points including the initial robot position
            new PathLayer({
              id: `path-${behaviorId}`,
              data: [{ path: geoPoints.map((p: any) => [p[1], p[0]]) }],
              getPath: (d: any) => d.path,
              getColor: [255, 165, 0, 180],
              getWidth: 3,
              widthUnits: "pixels",
              getDashArray: [3, 2], // Dashed line for planned path
            }),
          ];

        case Behavior.BEHAVIOR_SURROUND:
        case Behavior.BEHAVIOR_RALLY:
        case Behavior.BEHAVIOR_DEFEND:
          // Rally or defend - point + radius circle
          const radiusM =
            params.rallyRadiusM ||
            params.defendRadiusM ||
            params.surroundRadiusM ||
            15;
          const center = geoPoints[0];

          if (!center) return [];

          // Generate circle points (approximate with polygon)
          const circlePoints = generateCirclePoints(center, radiusM);

          return [
            // Center point
            new ScatterplotLayer({
              id: `point-${behaviorId}`,
              data: [center],
              getPosition: (d: any) => [d[1], d[0]],
              getFillColor: [255, 165, 0, 200], // Orange
              radiusUnits: "pixels",
              getRadius: 3,
              pickable: true,
            }),
            // Circle for radius
            new PathLayer({
              id: `circle-${behaviorId}`,
              data: [{ path: circlePoints.map((p: any) => [p[1], p[0]]) }],
              getPath: (d: any) => d.path,
              getColor: [255, 165, 0, 180],
              getWidth: 2,
              widthUnits: "pixels",
              getDashArray: [3, 2], // Dashed line
            }),
          ];

        case Behavior.BEHAVIOR_PATROL:
        case Behavior.BEHAVIOR_AREA_COVERAGE:
          // Polygon for the area boundary
          return [
            new PolygonLayer({
              id: `area-${behaviorId}`,
              data: [{ polygon: geoPoints.map((p: any) => [p[1], p[0]]) }],
              getPolygon: (d: any) => d.polygon,
              getFillColor: [255, 165, 0, 50], // Translucent orange
              getLineColor: [255, 165, 0],
              getLineWidth: 2,
              lineWidthUnits: "pixels",
              pickable: true,
            }),
          ];

        // Add other behavior types as needed
        default:
          return [];
      }
    });
  }, [behaviors, robotList]); // Added robotList to dependencies
}

/**
 * Helper function to generate circle points from center and radius
 * @param center Center point as [lat, lng]
 * @param radiusM Radius in meters
 * @returns Array of [lat, lng] points forming a circle
 */
function generateCirclePoints(
  center: [number, number],
  radiusM: number
): [number, number][] {
  const [lat, lng] = center;
  const points: [number, number][] = [];
  const numPoints = 64; // More points = smoother circle

  // Approximate conversion from meters to degrees
  // This is a rough approximation and will be distorted at higher latitudes
  const radiusLat = radiusM / 111000; // 1 degree lat ≈ 111 km
  const radiusLng = radiusM / (111000 * Math.cos((lat * Math.PI) / 180));

  for (let i = 0; i < numPoints; i++) {
    const angle = (i / numPoints) * 2 * Math.PI;
    const ptLat = lat + radiusLat * Math.sin(angle);
    const ptLng = lng + radiusLng * Math.cos(angle);
    points.push([ptLat, ptLng]);
  }

  // Close the circle
  points.push(points[0]);

  return points;
}
