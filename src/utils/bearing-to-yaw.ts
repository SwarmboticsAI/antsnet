/**
 * Converts a Turf.js bearing (degrees from north, clockwise) to a standard yaw angle
 * (radians from east, counterclockwise)
 *
 * @param bearingDegrees Bearing in degrees from north (clockwise)
 * @returns Yaw angle in radians from east (counterclockwise)
 */
export function bearingToYaw(bearingDegrees: number): number {
  // Step 1: Convert to radians
  const bearingRadians = (bearingDegrees * Math.PI) / 180;

  // Step 2 & 3: Adjust reference direction and change direction
  // North (0°) -> East (0 rad)
  // East (90°) -> North (π/2 rad)
  // South (180° or -180°) -> West (π rad)
  // West (-90°) -> South (3π/2 rad)

  // Formula: yaw = (π/2 - bearing) % (2π)
  let yaw = (Math.PI / 2 - bearingRadians) % (2 * Math.PI);

  // Ensure yaw is in the range [0, 2π)
  if (yaw < 0) {
    yaw += 2 * Math.PI;
  }

  return yaw;
}
