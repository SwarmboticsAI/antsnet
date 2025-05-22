import { AggregatedTable } from "@swarmbotics/protos/ros2_interfaces/sbai_system_alert_protos/sbai_system_alert_protos/aggregated_table";
import {
  systemMessageTypeMap,
  keyConversionMap,
  networkTableTypeMap,
} from "@/utils/telemetry-mapping";
import { ZerotierConnection } from "@swarmbotics/protos/ros2_interfaces/sbai_network_protos/sbai_network_protos/zerotier_connection";
import { StarlinkStatus } from "@swarmbotics/protos/ros2_interfaces/sbai_network_protos/sbai_network_protos/starlink_status";
import { SatelliteMetrics } from "@swarmbotics/protos/ros2_interfaces/sbai_network_protos/sbai_network_protos/satellite_metrics";
import { FullPathMetrics } from "@swarmbotics/protos/ros2_interfaces/sbai_network_protos/sbai_network_protos/full_path_metrics";
import { CellMetrics } from "@swarmbotics/protos/ros2_interfaces/sbai_network_protos/sbai_network_protos/cell_metrics";
import { GpsStatus } from "@swarmbotics/protos/localization/ublox/ublox_protos/ublox_protos/gps_status";
import { FixStatus } from "@swarmbotics/protos/localization/ublox/ublox_protos/ublox_protos/fix_status";
import { type Robot } from "@/types/robot";

const pendingSystemUpdates = {
  updates: {} as Record<string, Partial<Robot>>,
  timer: null as NodeJS.Timeout | null,
};

const processBatchSystemUpdate = (dispatch: React.Dispatch<any>) => {
  if (Object.keys(pendingSystemUpdates.updates).length > 0) {
    dispatch({
      type: "BATCH_SYSTEM_UPDATE",
      payload: { ...pendingSystemUpdates.updates },
    });
    pendingSystemUpdates.updates = {};
  }
  pendingSystemUpdates.timer = null;
};

export const handleNetworkSample = (
  sample: any,
  dispatch: React.Dispatch<any>
) => {
  try {
    const rawData = new Uint8Array(Object.values(sample._payload._buffer));
    const decoded = AggregatedTable.decode(rawData);

    const robotId = decoded.robotId;
    if (!robotId || !decoded.table) return;

    const updates: Partial<Robot> = {};
    const missingDecoders: string[] = [];
    const missingMappings: string[] = [];
    const decodeErrors: string[] = [];
    const fieldErrors: string[] = [];

    Object.entries(decoded.table).forEach(([key, value]) => {
      if (!value) return;

      if (!(key in networkTableTypeMap)) {
        missingDecoders.push(key);
        return;
      }
      if (!(key in keyConversionMap)) {
        missingMappings.push(key);
        return;
      }
      try {
        const Decoder =
          networkTableTypeMap[key as keyof typeof networkTableTypeMap];
        const { convertedKey, valueKey } =
          keyConversionMap[key as keyof typeof keyConversionMap];
        const decodedMsg = Decoder.decode(
          value instanceof Uint8Array ? value : new Uint8Array(value)
        );
        if (!(valueKey in decodedMsg)) {
          fieldErrors.push(`Field '${valueKey}' not found in decoded ${key}`);
          console.error(
            `[NetworkTelemetryDebug] Field '${valueKey}' not found in decoded message:`,
            decodedMsg
          );
          return;
        }

        if (key === "zerotier_connection") {
          const zerotierData = decodedMsg as ZerotierConnection;
          updates[convertedKey as keyof Robot] = {
            peerId: zerotierData.peerId,
            isBonded: zerotierData.isBonded,
            isRelayed: zerotierData.isRelayed,
            activeInternetType: zerotierData.activeInternetType,
            activeGatewayOwner: zerotierData.activeGatewayOwner,
            activeEligible: zerotierData.activeEligible,
            backupPaths: zerotierData.backupPaths,
          } as any;
        } else if (key === "starlink_status") {
          const starlinkData = decodedMsg as StarlinkStatus;
          updates[convertedKey as keyof Robot] = {
            state: starlinkData.starlinkState,
            alertInfo: starlinkData.alertInfo,
            popPingDropRate: starlinkData.popPingDropRate,
            popPingLatencyMs: starlinkData.popPingLatencyMs,
            fractionObstructed: starlinkData.fractionObstructed,
          } as any;
        } else if (key === "satellite_metrics") {
          const satelliteMetricsData = decodedMsg as SatelliteMetrics;
          updates[convertedKey as keyof Robot] = {
            testInternetIp: satelliteMetricsData.testInternetIp,
            minRttMs: satelliteMetricsData.minRttMs,
            maxRttMs: satelliteMetricsData.maxRttMs,
            avgRttMs: satelliteMetricsData.avgRttMs,
            stdDevRttMs: satelliteMetricsData.stdDevRttMs,
            packetLossPercent: satelliteMetricsData.packetLossPercent,
            isLinkDetected: satelliteMetricsData.isLinkDetected,
          } as any;
        } else if (key === "full_path_metrics") {
          const fullPathMetricsData = decodedMsg as FullPathMetrics;
          updates[convertedKey as keyof Robot] = {
            linksMetrics: fullPathMetricsData.linksMetrics,
          } as any;
        } else if (key === "cell_metrics") {
          const cellMetricsData = decodedMsg as CellMetrics;
          updates[convertedKey as keyof Robot] = {
            testInternetIp: cellMetricsData.testInternetIp,
            minRttMs: cellMetricsData.minRttMs,
            maxRttMs: cellMetricsData.maxRttMs,
            avgRttMs: cellMetricsData.avgRttMs,
            stdDevRttMs: cellMetricsData.stdDevRttMs,
            packetLossPercent: cellMetricsData.packetLossPercent,
            isLinkDetected: cellMetricsData.isLinkDetected,
          } as any;
        }
      } catch (error) {
        decodeErrors.push(`${key}: ${(error as Error).message}`);
        console.error(`[NetworkTelemetryDebug] Error decoding ${key}:`, error);
      }
    });

    if (missingDecoders.length > 0) {
      console.warn(
        `[NetworkTelemetryDebug] Missing decoders for keys:`,
        missingDecoders.join(", ")
      );
    }
    if (missingMappings.length > 0) {
      console.warn(
        `[NetworkTelemetryDebug] Missing mappings for keys:`,
        missingMappings.join(", ")
      );
    }
    if (decodeErrors.length > 0) {
      console.error(
        `[NetworkTelemetryDebug] Decode errors:`,
        decodeErrors.join("; ")
      );
    }
    if (fieldErrors.length > 0) {
      console.error(
        `[NetworkTelemetryDebug] Field errors:`,
        fieldErrors.join("; ")
      );
    }
    if (Object.keys(updates).length > 0) {
      if (!pendingSystemUpdates.updates[robotId]) {
        pendingSystemUpdates.updates[robotId] = {};
      }

      pendingSystemUpdates.updates[robotId] = {
        ...pendingSystemUpdates.updates[robotId],
        ...updates,
      };

      if (!pendingSystemUpdates.timer) {
        pendingSystemUpdates.timer = setTimeout(() => {
          processBatchSystemUpdate(dispatch);
        }, 150);
      }

      dispatch({
        type: "SYSTEM_TELEMETRY",
        robotId,
        updates,
      });
    }
  } catch (err) {
    console.error("System telemetry decode error:", err);
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
    const missingDecoders: string[] = [];
    const missingMappings: string[] = [];
    const decodeErrors: string[] = [];
    const fieldErrors: string[] = [];

    Object.entries(decoded.table).forEach(([key, value]) => {
      if (!value) return;

      if (!(key in systemMessageTypeMap)) {
        missingDecoders.push(key);
        return;
      }

      if (!(key in keyConversionMap)) {
        missingMappings.push(key);
        return;
      }

      try {
        const Decoder =
          systemMessageTypeMap[key as keyof typeof systemMessageTypeMap];
        const { convertedKey, valueKey } =
          keyConversionMap[key as keyof typeof keyConversionMap];

        const decodedMsg = Decoder.decode(
          value instanceof Uint8Array ? value : new Uint8Array(value)
        );

        if (key === "gps_status") {
          const gpsData = decodedMsg as GpsStatus;
          updates[convertedKey as keyof Robot] = {
            gpsState: gpsData.gpsState,
          } as any;
        } else if (key === "fix_status") {
          const fixData = decodedMsg as FixStatus;
          updates[convertedKey as keyof Robot] = {
            fixState: fixData.fixState,
            numSatellites: fixData.numSatellites,
            horizontalAccuracyM: fixData.horizontalAccuracyM,
            verticalAccuracyM: fixData.verticalAccuracyM,
          } as any;
        } else if (key === "state_change_result") {
          const stateChangeData = decodedMsg as any;
          updates[convertedKey as keyof Robot] =
            stateChangeData.newState as any;
        } else {
          // Standard handling for messages with a single field
          if (!(valueKey in decodedMsg)) {
            fieldErrors.push(`Field '${valueKey}' not found in decoded ${key}`);
            console.error(
              `[SystemTelemetryDebug] Field '${valueKey}' not found in decoded message:`,
              decodedMsg
            );
            return;
          }
          updates[convertedKey as keyof Robot] =
            decodedMsg[valueKey as keyof typeof decodedMsg];
        }
      } catch (error) {
        decodeErrors.push(`${key}: ${(error as Error).message}`);
        console.error(`[SystelemetryDebug] Error decoding ${key}:`, error);
      }
    });

    if (missingDecoders.length > 0) {
      console.warn(
        `[SystelemetryDebug] Missing decoders for keys:`,
        missingDecoders.join(", ")
      );
    }
    if (missingMappings.length > 0) {
      console.warn(
        `[SystelemetryDebug] Missing mappings for keys:`,
        missingMappings.join(", ")
      );
    }
    if (decodeErrors.length > 0) {
      console.error(
        `[SystelemetryDebug] Decode errors:`,
        decodeErrors.join("; ")
      );
    }
    if (fieldErrors.length > 0) {
      console.error(
        `[SystelemetryDebug] Field errors:`,
        fieldErrors.join("; ")
      );
    }

    if (Object.keys(updates).length > 0) {
      if (!pendingSystemUpdates.updates[robotId]) {
        pendingSystemUpdates.updates[robotId] = {};
      }

      pendingSystemUpdates.updates[robotId] = {
        ...pendingSystemUpdates.updates[robotId],
        ...updates,
      };

      if (!pendingSystemUpdates.timer) {
        pendingSystemUpdates.timer = setTimeout(() => {
          processBatchSystemUpdate(dispatch);
        }, 150);
      }

      dispatch({
        type: "SYSTEM_TELEMETRY",
        robotId,
        updates,
      });
    }
  } catch (err) {
    console.error("System telemetry decode error:", err);
  }
};
