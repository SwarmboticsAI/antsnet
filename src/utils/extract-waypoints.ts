import { GeoPath } from "@/protos/generated/sbai_geographic_protos/sbai_geographic_protos/geo_path";

/**
 * Extracts an array of [longitude, latitude] points from a GeoPath object
 * @param {Object} geoPath - The decoded GeoPath protobuf message
 * @returns {Array} Array of [longitude, latitude] coordinates
 */
export function extractWaypoints(geoPath: GeoPath) {
  if (!geoPath?.poses || !Array.isArray(geoPath.poses)) {
    return [];
  }

  return geoPath.poses
    .filter((pose) => pose.pose?.position)
    .map((pose) => [
      pose.pose?.position?.longitude ?? 0,
      pose.pose?.position?.latitude ?? 0,
    ]);
}
