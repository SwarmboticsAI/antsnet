import { useMemo } from "react";
import { ScatterplotLayer, PathLayer, PolygonLayer } from "@deck.gl/layers";
import { Behavior } from "@swarmbotics/protos/ros2_interfaces/sbai_behavior_protos/sbai_behavior_protos/behavior_request";

import { useBehaviors } from "@/hooks/use-behaviors";
import { unpackBehaviorParams } from "@/utils/unpack-behavior-params";
import { BehaviorStatusUI } from "@/types/behavior";

type DeckLayer = ScatterplotLayer | PathLayer | PolygonLayer;

export function useBehaviorLayers(): DeckLayer[] {
  const { behaviorsByStatus } = useBehaviors();

  const displayableBehaviors = useMemo(() => {
    return [
      ...behaviorsByStatus[BehaviorStatusUI.ACTIVE],
      ...behaviorsByStatus[BehaviorStatusUI.ACCEPTED],
      ...behaviorsByStatus[BehaviorStatusUI.PAUSED],
      ...behaviorsByStatus[BehaviorStatusUI.NEEDS_INTERVENTION],
      ...behaviorsByStatus[BehaviorStatusUI.QUEUED],
    ];
  }, [behaviorsByStatus]);

  return useMemo(() => {
    return displayableBehaviors.flatMap((behavior): DeckLayer[] => {
      const { behaviorId, status, request } = behavior;
      if (!request?.geoPoints) return [];

      const geoPoints = request.geoPoints;
      const params = request.behaviorParams
        ? unpackBehaviorParams(request.behaviorParams)
        : undefined;

      const type = request.requestedBehavior;

      if (!geoPoints.length) return [];

      switch (type) {
        case Behavior.BEHAVIOR_MULTI_WAYPOINT_NAVIGATION:
          return [
            new ScatterplotLayer({
              id: `waypoint-${behaviorId}`,
              data: geoPoints.map((coord) => ({ coord, status })),
              getPosition: (d) => [d.coord[1], d.coord[0]],
              getFillColor: (d) =>
                d.status === BehaviorStatusUI.QUEUED
                  ? [0, 165, 255, 200]
                  : [255, 165, 0, 200],
              getRadius: 6,
              radiusUnits: "pixels",
              pickable: true,
            }),
            new PathLayer({
              id: `path-${behaviorId}`,
              data: [{ path: geoPoints.map((p) => [p.longitude, p.latitude]) }],
              getPath: (d) => d.path,
              getColor:
                status === BehaviorStatusUI.QUEUED
                  ? [0, 165, 255, 200]
                  : [255, 165, 0, 200],
              getWidth: 3,
              widthUnits: "pixels",
              getDashArray: [3, 2],
            }),
          ];

        case Behavior.BEHAVIOR_SURROUND:
        case Behavior.BEHAVIOR_RALLY:
        case Behavior.BEHAVIOR_DEFEND: {
          let radiusM = 15; // default

          if (!params) return [];
          if ("rallyRadiusM" in params) {
            radiusM = params.rallyRadiusM;
          } else if ("defendRadiusM" in params) {
            radiusM = params.defendRadiusM;
          } else if ("surroundRadiusM" in params) {
            radiusM = params.surroundRadiusM;
          }

          const center = geoPoints[0];
          if (!center) return [];

          const centerTuple: [number, number] = [
            center.latitude,
            center.longitude,
          ];
          const circlePoints = generateCirclePoints(centerTuple, radiusM);

          return [
            new ScatterplotLayer({
              id: `point-${behaviorId}`,
              data: [centerTuple],
              getPosition: (d) => [d[1], d[0]],
              getFillColor:
                status === BehaviorStatusUI.QUEUED
                  ? [0, 165, 255, 200]
                  : [255, 165, 0, 200],
              getRadius: 3,
              radiusUnits: "pixels",
              pickable: true,
            }),
            new PathLayer({
              id: `circle-${behaviorId}`,
              data: [{ path: circlePoints.map((p) => [p[1], p[0]]) }],
              getPath: (d) => d.path,
              getColor:
                status === BehaviorStatusUI.QUEUED
                  ? [0, 165, 255, 200]
                  : [255, 165, 0, 200],
              getWidth: 2,
              widthUnits: "pixels",
              getDashArray: [3, 2],
            }),
          ];
        }

        case Behavior.BEHAVIOR_PATROL:
        case Behavior.BEHAVIOR_AREA_COVERAGE:
          return [
            new PolygonLayer({
              id: `area-${behaviorId}`,
              data: [
                { polygon: geoPoints.map((p) => [p.longitude, p.latitude]) },
              ],
              getPolygon: (d) => d.polygon,
              getFillColor:
                status === BehaviorStatusUI.QUEUED
                  ? [0, 165, 255, 50]
                  : [255, 165, 0, 50],
              getLineColor:
                status === BehaviorStatusUI.QUEUED
                  ? [0, 165, 255, 200]
                  : [255, 165, 0, 200],
              getLineWidth: 2,
              lineWidthUnits: "pixels",
              pickable: true,
            }),
          ];

        default:
          return [];
      }
    });
  }, [displayableBehaviors]);
}

// helper
function generateCirclePoints(
  center: [number, number],
  radiusM: number
): [number, number][] {
  const [lat, lng] = center;
  const points: [number, number][] = [];
  const numPoints = 64;

  const radiusLat = radiusM / 111000;
  const radiusLng = radiusM / (111000 * Math.cos((lat * Math.PI) / 180));

  for (let i = 0; i < numPoints; i++) {
    const angle = (i / numPoints) * 2 * Math.PI;
    const ptLat = lat + radiusLat * Math.sin(angle);
    const ptLng = lng + radiusLng * Math.cos(angle);
    points.push([ptLat, ptLng]);
  }

  if (points.length > 0 && points[0] !== undefined) {
    points.push(points[0] as [number, number]); // close the loop
  }
  return points;
}
