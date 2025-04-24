/**
 * Utility function to decode heartbeat messages from Zenoh
 */

import { ToTakHeartbeat } from "@/protos/generated/sbai_tak_heartbeat_publisher_protos/sbai_tak_heartbeat_publisher_protos/to_tak_heartbeat";

/**
 * Decodes a binary heartbeat message into a strongly typed protobuf object
 * @param data Binary data (Uint8Array) containing the protobuf message
 * @returns Decoded ToTakHeartbeat message
 */
export function decodeHeartbeatMessage(data: Uint8Array): ToTakHeartbeat {
  try {
    // Parse the binary data into a ToTakHeartbeat message
    return ToTakHeartbeat.decode(data);
  } catch (error) {
    console.error("❌ Failed to decode heartbeat message:", error);
    // Return an empty heartbeat message to avoid null references
    return ToTakHeartbeat.fromPartial({});
  }
}

/**
 * Validates if a heartbeat message contains the required fields
 * @param heartbeat Heartbeat message to validate
 * @returns True if the heartbeat is valid, false otherwise
 */
export function isValidHeartbeat(heartbeat: ToTakHeartbeat): boolean {
  return !!heartbeat && !!heartbeat.robotId;
}

/**
 * Converts a heartbeat message to a plain JavaScript object
 * @param heartbeat Heartbeat message to convert
 * @returns Plain object representation of the heartbeat
 */
export function heartbeatToObject(
  heartbeat: ToTakHeartbeat
): Record<string, unknown> {
  // In ts-proto, the message is already a plain object
  // Just return a copy to ensure immutability
  return { ...heartbeat };
}
