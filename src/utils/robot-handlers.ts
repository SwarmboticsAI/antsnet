// src/providers/robot-handlers.ts

import { AggregatedTable } from "@/protos/generated/sbai_system_alert_protos/sbai_system_alert_protos/aggregated_table";
import {
  decodeHeartbeatMessage,
  isValidHeartbeat,
} from "@/utils/decode-heartbeat-message";
import {
  systemMessageTypeMap,
  keyConversionMap,
} from "@/utils/telemetry-mapping";
import { Robot } from "@/types/Robot";

export const handleHeartbeatSample = (
  sample: any,
  dispatch: React.Dispatch<any>,
  heartbeatTimesRef: React.MutableRefObject<Record<string, number>>
) => {
  try {
    const rawData = new Uint8Array(Object.values(sample._payload._buffer));
    const heartbeat = decodeHeartbeatMessage(rawData);
    if (!isValidHeartbeat(heartbeat)) return;

    const robotId = heartbeat.robotId;
    if (!robotId) return;

    heartbeatTimesRef.current[robotId] = Date.now();

    dispatch({
      type: "HEARTBEAT",
      robot: {
        robotId,
        heading: heartbeat.magneticHeadingDeg || 0,
        battery: heartbeat.batteryPercentage || 0,
        gpsCoordinates: heartbeat.gpsCoordinate || null,
        platformType: heartbeat.platformType || "",
        speed: heartbeat.bodySpeedMPerS || 0,
        ipAddress: heartbeat.ipAddress || "",
        vpnIpAddress: heartbeat.vpnIpAddress || "",
        status: "online",
        mode: heartbeat.state?.newState || 0,
        lastSeen: new Date(),
        parkingBrakeState: heartbeat.parkingBrakeState || 0,
        controllingTakId: heartbeat.controllingTakId || "",
      },
    });
  } catch (err) {
    console.error("Heartbeat decode error:", err);
  }
};

export const handleSystemSample = (
  sample: any,
  dispatch: React.Dispatch<any>
) => {
  try {
    const rawData = new Uint8Array(Object.values(sample._payload._buffer));
    const decoded = AggregatedTable.decode(rawData);

    const robotId = decoded.robotId;
    if (!robotId || !decoded.table) return;

    const updates: Partial<Robot> = {};
    Object.entries(decoded.table).forEach(([key, value]) => {
      if (!value || !(key in systemMessageTypeMap)) return;

      const Decoder =
        systemMessageTypeMap[key as keyof typeof systemMessageTypeMap];
      if (key in keyConversionMap) {
        const { convertedKey, valueKey } =
          keyConversionMap[key as keyof typeof keyConversionMap];
        const decodedMsg = Decoder.decode(
          value instanceof Uint8Array ? value : new Uint8Array(value)
        );

        updates[convertedKey as keyof Robot] =
          decodedMsg[valueKey as keyof typeof decodedMsg];
      }
    });

    dispatch({ type: "SYSTEM_TELEMETRY", robotId, updates });
  } catch (err) {
    console.error("System telemetry decode error:", err);
  }
};
