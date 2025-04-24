import {
  LineLayer,
  PolygonLayer,
  ScatterplotLayer,
  TextLayer,
} from "@deck.gl/layers";
import { Behavior } from "@/protos/generated/sbai_behavior_protos/behavior_request";
import {
  behaviorConfigMap,
  SupportedBehavior,
} from "@/utils/behavior-config-map";
import { MissionDraft } from "@/providers/mission-draft-provider";

export function hexToRgba(
  hex: string,
  opacity = 1
): [number, number, number, number] {
  const sanitized = hex.replace("#", "");
  const bigint = parseInt(sanitized, 16);
  return [
    (bigint >> 16) & 255,
    (bigint >> 8) & 255,
    bigint & 255,
    opacity * 255,
  ];
}

export function createMissionLayers(mission: MissionDraft) {
  const fillRGBA = hexToRgba("#5f93ff", 0.2);
  const strokeRGBA = hexToRgba("#0044cc", 0.9);
  const stagingRGBA = hexToRgba("#00cc66", 0.3);
  const layers: any[] = [];

  mission.stagingAreas.forEach((area, idx) => {
    const coords: [number, number][] = area.geoPolygon.map(([lat, lng]) => [
      lng,
      lat,
    ]);

    if (coords.length > 2) {
      const polygon = [...coords, coords[0]];

      layers.push(
        new PolygonLayer({
          id: `staging-${idx}-poly`,
          data: [{ polygon }],
          getPolygon: (d) => d.polygon,
          getFillColor: stagingRGBA,
          getLineColor: [0, 200, 100],
          lineWidthMinPixels: 2,
          stroked: true,
          filled: true,
          pickable: false,
        }),
        new TextLayer({
          id: `staging-${idx}-label`,
          data: [coords[0]],
          getPosition: (d) => d,
          getText: () => area.name,
          getSize: 14,
          getColor: [255, 255, 255],
          getBackgroundColor: [0, 100, 50, 180],
          background: true,
          getTextAnchor: "start",
          getAlignmentBaseline: "center",
          parameters: { depthTest: false } as any,
        })
      );
    }
  });

  mission.phases.forEach((phase, phaseIdx) => {
    phase.behaviors.forEach((b, i) => {
      const label = `${phase.name}: ${Behavior[b.behaviorType]}`;
      const coords: [number, number][] = (b.params?.geoPoints || []).map(
        ([lat, lng]: [number, number]) => [lng, lat]
      );

      if (!coords.length) return;

      const key = `phase-${phaseIdx}-b-${i}`;
      const config = behaviorConfigMap[b.behaviorType as SupportedBehavior];
      const isPolygon = config?.geometryType === "polygon";

      const isRally = b.behaviorType === Behavior.BEHAVIOR_RALLY;
      const rallyRadius = b.params?.rallyRadiusM ?? 5;

      if (isRally && coords.length === 1) {
        layers.push(
          new ScatterplotLayer({
            id: `${key}-radius`,
            data: coords,
            getPosition: (d) => d,
            getRadius: rallyRadius,
            radiusUnits: "meters",
            getFillColor: fillRGBA,
            getLineColor: strokeRGBA,
            stroked: true,
            lineWidthMinPixels: 2,
            pickable: false,
          })
        );
      }

      layers.push(
        new ScatterplotLayer({
          id: `${key}-points`,
          data: coords,
          getPosition: (d) => d,
          getFillColor: [255, 255, 255, 200],
          getLineColor: strokeRGBA,
          getRadius: 6,
          radiusUnits: "pixels",
          stroked: true,
          lineWidthMinPixels: 2,
          pickable: false,
        })
      );

      if (isPolygon && coords.length > 2) {
        layers.push(
          new PolygonLayer({
            id: `${key}-poly`,
            data: [{ polygon: [...coords, coords[0]] }],
            getPolygon: (d) => d.polygon,
            getFillColor: fillRGBA,
            getLineColor: strokeRGBA,
            lineWidthMinPixels: 2,
            stroked: true,
            filled: true,
            pickable: false,
          })
        );
      }

      if (coords.length > 1) {
        const segments: [number, number][][] = coords
          .slice(1)
          .map(
            (
              p: [number, number],
              i: number
            ): [[number, number], [number, number]] => [coords[i], p]
          );
        layers.push(
          new LineLayer({
            id: `${key}-lines`,
            data: segments,
            getSourcePosition: (d) => d[0],
            getTargetPosition: (d) => d[1],
            getColor: strokeRGBA,
            getWidth: 3,
            pickable: false,
          })
        );
      }

      layers.push(
        new TextLayer({
          id: `${key}-label`,
          data: [coords[0]],
          getPosition: (d) => d,
          getText: () => label,
          getSize: 14,
          getColor: [255, 255, 255],
          getBackgroundColor: [0, 0, 0, 180],
          background: true,
          getTextAnchor: "start",
          getAlignmentBaseline: "center",
          parameters: { depthTest: false } as any,
        })
      );
    });
  });

  return layers;
}
