import { useMemo } from "react";
import {
  LineLayer,
  ScatterplotLayer,
  TextLayer,
  PolygonLayer,
} from "@deck.gl/layers";
import { Layer } from "@deck.gl/core";

import { useMapFeatureContext } from "@/providers/map-feature-provider";
import { getCoordinatesFromFeature } from "@/utils/get-coordinates-from-feature";
import type { MapFeature } from "@/types/MapFeature";

// Utility to convert #hex color to [r, g, b, a]
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

export function useStandardLayers(): Layer[] {
  const { features } = useMapFeatureContext();

  return useMemo(() => {
    if (!features) return [];

    return features.flatMap((feature: MapFeature) => {
      const coords = getCoordinatesFromFeature(feature);
      const isBeacon = feature.featureType === "beacon";
      const isPolygon = feature.featureType === "polygon";

      const {
        fillColor = "#c8c8c8",
        strokeColor = "#141414",
        opacity = 1,
      } = feature.style || {};

      const fillRGBA = hexToRgba(fillColor, opacity);
      const strokeRGBA = hexToRgba(strokeColor, opacity);

      const layers: Layer[] = [];

      // Polygon fill layer
      if (isPolygon && coords.length > 2) {
        layers.push(
          new PolygonLayer({
            id: `polygon-fill-${feature._id}`,
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

      // Waypoint markers (dots)
      layers.push(
        new ScatterplotLayer<[number, number]>({
          id: `scatter-${feature._id}`,
          data: coords,
          getPosition: (d) => d,
          getFillColor: isBeacon ? fillRGBA : [200, 200, 200, 200],
          getLineColor: strokeRGBA,
          radiusUnits: isBeacon ? "meters" : "pixels",
          radiusScale: 1,
          getRadius: isBeacon ? feature.style?.radius ?? 20 : 5,
          stroked: true,
          lineWidthMinPixels: 2,
          lineWidthMaxPixels: 2,
          pickable: true,
        })
      );

      // Connector lines (if not a beacon or polygon)
      if (!isBeacon && coords.length > 1) {
        const lineSegments = coords.slice(1).map((p, i) => [coords[i], p]);

        layers.push(
          new LineLayer<[number, number][]>({
            id: `line-${feature._id}`,
            data: lineSegments,
            getSourcePosition: (d) => d[0],
            getTargetPosition: (d) => d[1],
            getColor: strokeRGBA,
            getWidth: 3,
          })
        );
      }

      // Text labels
      if (feature.name || "") {
        layers.push(
          new TextLayer({
            id: `label-${feature._id}`,
            data: [coords[0]],
            getPosition: (d) => d,
            getText: () => feature.name,
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
    });
  }, [features]);
}
