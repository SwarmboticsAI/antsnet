import { MapFeature } from "@/types/MapFeature";

export function getCoordinatesFromFeature(
  feature: MapFeature
): [number, number][] {
  const geometry = feature.geometry;

  switch (geometry.type) {
    case "Polygon":
      return (geometry.coordinates[0] as [number, number][]).map(
        ([lng, lat]) => [lng, lat]
      );
    case "LineString":
      return (geometry.coordinates as [number, number][]).map(([lng, lat]) => [
        lng,
        lat,
      ]);
    case "Point":
      return [[...geometry.coordinates.slice(0, 2)] as [number, number]];
    default:
      return [];
  }
}
