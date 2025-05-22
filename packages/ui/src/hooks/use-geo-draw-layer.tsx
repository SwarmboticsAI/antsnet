import { useMemo } from "react";
import {
  LineLayer,
  PolygonLayer,
  ScatterplotLayer,
  PathLayer,
} from "@deck.gl/layers";
import { useGeoDrawing } from "@/providers/geo-drawing-provider";
import { Behavior } from "@swarmbotics/protos/ros2_interfaces/sbai_behavior_protos/sbai_behavior_protos/behavior_request";

type DeckLayer = ScatterplotLayer | PathLayer | PolygonLayer | LineLayer;

function generateCirclePoints(
  center: [number, number],
  radiusM: number
): [number, number][] {
  const [lng, lat] = center;
  const points: [number, number][] = [];
  const numPoints = 64;

  const radiusLat = radiusM / 111000; // 1 degree lat ≈ 111 km
  const radiusLng = radiusM / (111000 * Math.cos((lat * Math.PI) / 180));

  for (let i = 0; i < numPoints; i++) {
    const angle = (i / numPoints) * 2 * Math.PI;
    const ptLat = lat + radiusLat * Math.sin(angle);
    const ptLng = lng + radiusLng * Math.cos(angle);
    points.push([ptLng, ptLat]);
  }

  if (points.length > 0) {
    points.push(points[0] as [number, number]);
  }

  return points;
}

function getBehaviorRadius(
  behaviorType: Behavior | undefined,
  params: Record<string, any> = {}
): number {
  switch (behaviorType) {
    case Behavior.BEHAVIOR_RALLY:
      return params.rallyRadiusM || 15;
    case Behavior.BEHAVIOR_SURROUND:
      return params.surroundRadiusM || 15;
    case Behavior.BEHAVIOR_DEFEND:
      return params.defendRadiusM || 15;
    default:
      return 15; // Default radius
  }
}

export function useGeoDrawLayer(): DeckLayer[] {
  const { state } = useGeoDrawing();

  return useMemo(() => {
    if (
      state.mode !== "drawing" ||
      !Array.isArray(state.geoPoints) ||
      state.geoPoints.length === 0
    )
      return [];

    // Defensive parsing and reordering
    const coords = state.geoPoints
      .filter(
        (pt): pt is [number, number] =>
          Array.isArray(pt) &&
          pt.length === 2 &&
          typeof pt[0] === "number" &&
          typeof pt[1] === "number"
      )
      .map(([lat, lng]) => [lng, lat]);

    const isPoint = state.geometryType === "point";
    const isPolygon = state.geometryType === "polygon";

    // Use blue color for "about to do" state (enforcing type safety)
    const blueColor: [number, number, number, number] = [237, 237, 237, 200]; // Cornflower blue, similar opacity to behavior orange
    const blueColorFill: [number, number, number, number] = [237, 237, 237, 50]; // Translucent fill

    const meta = state.metadata;
    const behaviorType = meta?.behaviorType;
    const radiusM = getBehaviorRadius(behaviorType, meta?.params || {});

    const result: DeckLayer[] = [];

    const polygonCoords =
      isPolygon && coords.length > 2 ? [...coords, coords[0]] : coords;

    // Handle radius behaviors in the same way as useBehaviorLayers
    if (isPoint && coords.length === 1 && radiusM > 0) {
      const center = coords[0];

      // Generate circle points for the radius instead of using ScatterplotLayer
      const circlePoints = generateCirclePoints(
        center as [number, number],
        radiusM
      );

      // Add center point
      result.push(
        new ScatterplotLayer({
          id: `geo-draw-point-${behaviorType || "unknown"}`,
          data: [center],
          getPosition: (d) => d,
          getFillColor: [
            blueColor[0],
            blueColor[1],
            blueColor[2],
            blueColor[3],
          ] as [number, number, number, number],
          getRadius: 3, // Same size as in useBehaviorLayers
          radiusUnits: "pixels",
          pickable: false,
        })
      );

      // Add circle for radius with dashed line, matching behavior layer style
      result.push(
        new PathLayer({
          id: `geo-draw-circle-${behaviorType || "unknown"}`,
          data: [{ path: circlePoints }],
          getPath: (d) => d.path,
          getColor: [
            blueColor[0],
            blueColor[1],
            blueColor[2],
            blueColor[3],
          ] as [number, number, number, number],
          getWidth: 2,
          widthUnits: "pixels",
          getDashArray: [3, 2], // Dashed line matching behavior layer
          pickable: false,
        })
      );
    } else {
      // Standard points for all other cases
      result.push(
        new ScatterplotLayer({
          id: "geo-draw-points",
          data: coords,
          getPosition: (d) => d,
          getFillColor: [250, 250, 250, 200] as [
            number,
            number,
            number,
            number
          ],
          getRadius: 6, // Match size used in behavior layer
          radiusUnits: "pixels",
          pickable: false,
        })
      );
    }

    // Draw polygon fill if valid
    if (isPolygon && polygonCoords.length > 2) {
      result.push(
        new PolygonLayer({
          id: "geo-draw-polygon",
          data: [{ polygon: polygonCoords }],
          getPolygon: (d) => d.polygon,
          getFillColor: [
            blueColorFill[0],
            blueColorFill[1],
            blueColorFill[2],
            blueColorFill[3],
          ] as [number, number, number, number],
          getLineColor: [
            blueColor[0],
            blueColor[1],
            blueColor[2],
            blueColor[3],
          ] as [number, number, number, number],
          getLineWidth: 2,
          lineWidthUnits: "pixels",
          stroked: true,
          filled: true,
          pickable: false,
        })
      );
    }

    // Draw line segments for lines/polygons with matching style
    if (!isPoint && polygonCoords.length > 1) {
      result.push(
        new PathLayer({
          id: "geo-draw-path",
          data: [{ path: polygonCoords }],
          getPath: (d) => d.path,
          getColor: [220, 220, 220, 200] as [number, number, number, number],
          getWidth: 3, // Match width from behavior layer
          widthUnits: "pixels",
          getDashArray: [3, 2], // Dashed line matching behavior style
          pickable: false,
        })
      );
    }

    return result;
  }, [
    state.mode,
    state.geoPoints,
    state.geometryType,
    state.metadata?.behaviorType,
    state.metadata?.params?.rallyRadiusM,
    state.metadata?.params?.surroundRadiusM,
    state.metadata?.params?.defendRadiusM,
  ]);
}
