import { useMemo } from "react";
import {
  LineLayer,
  PolygonLayer,
  ScatterplotLayer,
  TextLayer,
} from "@deck.gl/layers";
import { useMapFeatureContext } from "@/providers/map-feature-provider";

function hexToRgba(hex: string, opacity = 1): [number, number, number, number] {
  const sanitized = hex.replace("#", "");
  const bigint = parseInt(sanitized, 16);
  return [
    (bigint >> 16) & 255,
    (bigint >> 8) & 255,
    bigint & 255,
    opacity * 255,
  ];
}

export function useDraftFeatureLayer() {
  const { drawState } = useMapFeatureContext();
  const featureLayer = useMemo(() => {
    if (!drawState) return [];

    const coords = drawState.points.map(([lat, lng]) => [lng, lat]);
    const isBeacon = drawState.featureType === "beacon";
    const isPolygon = drawState.featureType === "polygon";

    const {
      fillColor = "#c8c8c8",
      strokeColor = "#141414",
      opacity = 1,
    } = drawState.metadata || {};

    const fillRGBA = hexToRgba(fillColor, opacity);
    const strokeRGBA = hexToRgba(strokeColor, opacity);

    const layers = [];

    // Polygon layer
    if (isPolygon && coords.length > 2) {
      layers.push(
        new PolygonLayer({
          id: `polygon-fill-${drawState.featureType}`,
          data: [{ polygon: coords }],
          getPolygon: (d) => d.polygon,
          getFillColor: fillRGBA,
          getLineColor: strokeRGBA,
          lineWidthMinPixels: 2,
          stroked: true,
          filled: true,
          pickable: true,
        })
      );
    }

    // Points
    layers.push(
      new ScatterplotLayer<[number, number]>({
        id: `scatter-${drawState.featureType}`,
        data: coords,
        getPosition: (d) => d,
        getFillColor: isBeacon ? fillRGBA : [200, 200, 200, 100],
        getLineColor: strokeRGBA,
        getRadius: isBeacon ? drawState.metadata.radius : 5,
        radiusUnits: isBeacon ? "meters" : "pixels",

        stroked: true,
        lineWidthMinPixels: 2,
        lineWidthMaxPixels: 2,
        pickable: true,
      })
    );

    // Lines (if not beacon or polygon)
    if (!isBeacon && !isPolygon && coords.length > 1) {
      const lineSegments = coords.slice(1).map((p, i) => [coords[i], p]);

      layers.push(
        new LineLayer<[number, number][]>({
          id: `line-${drawState.featureType}`,
          data: lineSegments,
          getSourcePosition: (d) => d[0],
          getTargetPosition: (d) => d[1],
          getColor: strokeRGBA,
          getWidth: 3,
        })
      );
    }

    // Optional: Add a "Draft" label
    if (coords.length > 0) {
      layers.push(
        new TextLayer({
          id: "draft-label",
          data: [coords[0]],
          getPosition: (d) => d,
          getText: () => drawState.metadata.label ?? "Draft",
          getSize: 14,
          getColor: [255, 255, 255],
          getBackgroundColor: [0, 0, 0, 80],
          background: true,
          getTextAnchor: "start",
          getAlignmentBaseline: "center",
          parameters: {
            depthTest: false,
          } as any,
        })
      );
    }

    return layers;
  }, [drawState]);

  return featureLayer;
}
