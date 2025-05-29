import { Router } from "express";
import { EventEmitter } from "events";
import { robotRegistryService } from "@/services/robots/robot-registry";
import { grpcServiceDirectory } from "@/services/grpc/grpc-service-directory";
import { Empty } from "@swarmbotics/protos/google/protobuf/empty.ts";

// Import network table protos
import { StarlinkStatus } from "@swarmbotics/protos/ros2_interfaces/sbai_protos/sbai_protos/starlink_status.ts";
import { CellMetrics } from "@swarmbotics/protos/ros2_interfaces/sbai_protos/sbai_protos/cell_metrics.ts";
import { FullPathMetrics } from "@swarmbotics/protos/ros2_interfaces/sbai_protos/sbai_protos/full_path_metrics.ts";
import { SatelliteMetrics } from "@swarmbotics/protos/ros2_interfaces/sbai_protos/sbai_protos/satellite_metrics.ts";
import {
  ZerotierConnection,
  ZerotierBackupPath,
} from "@swarmbotics/protos/ros2_interfaces/sbai_protos/sbai_protos/zerotier_connection.ts";

// Import system table protos
import { OakStatus } from "@swarmbotics/protos/ros2_interfaces/sbai_protos/sbai_protos/oak_status.ts";
import { CanStatus } from "@swarmbotics/protos/ros2_interfaces/sbai_protos/sbai_protos/can_status.ts";
import { EcuStatus } from "@swarmbotics/protos/ros2_interfaces/sbai_protos/sbai_protos/ecu_status.ts";
import { EmergencyStopStatus } from "@swarmbotics/protos/ros2_interfaces/sbai_protos/sbai_protos/emergency_stop_status.ts";
import { BoomButtonStatus } from "@swarmbotics/protos/ros2_interfaces/sbai_protos/sbai_protos/boom_button_status.ts";
import { StateChangeResult } from "@swarmbotics/protos/ros2_interfaces/sbai_protos/sbai_protos/state_change_result.ts";
import { TerrainMapStatus } from "@swarmbotics/protos/ros2_interfaces/sbai_protos/sbai_protos/terrain_map_status.ts";
import { GpsStatus } from "@swarmbotics/protos/ros2_interfaces/sbai_protos/sbai_protos/gps_status.ts";
import { FixStatus } from "@swarmbotics/protos/ros2_interfaces/sbai_protos/sbai_protos/fix_status.ts";
import { ControllingDeviceIdentity } from "@swarmbotics/protos/ros2_interfaces/sbai_protos/sbai_protos/controlling_device_identity.ts";
import { BatteryPercentage } from "@swarmbotics/protos/ros2_interfaces/sbai_protos/sbai_protos/battery_percentage.ts";
import { ParkingBrakeStatus } from "@swarmbotics/protos/ros2_interfaces/sbai_protos/sbai_protos/parking_brake_status.ts";

// Import task table protos
import { GeoPath } from "@swarmbotics/protos/ros2_interfaces/sbai_protos/sbai_protos/geo_path.ts";
import { BehaviorExecutionState } from "@swarmbotics/protos/ros2_interfaces/sbai_protos/sbai_protos/behavior_execution_state.ts";

// Import localization table protos
import { LocalizationData } from "@swarmbotics/protos/ros2_interfaces/sbai_protos/sbai_protos/localization_data.ts";

// Create the EventEmitter instance
const emitter = new EventEmitter();
emitter.setMaxListeners(20);
export { emitter };

// Type definitions
export type NetworkTableData = {
  starlink_status?: StarlinkStatus;
  cell_metrics?: CellMetrics;
  full_path_metrics?: FullPathMetrics;
  satellite_metrics?: SatelliteMetrics;
  zerotier_connection?: ZerotierConnection;
  zerotier_backup_path?: ZerotierBackupPath;
};

export type SystemTableData = {
  oak_status?: OakStatus;
  can_status?: CanStatus;
  ecu_status?: EcuStatus;
  emergency_stop_status?: EmergencyStopStatus;
  boom_button_status?: BoomButtonStatus;
  state_change_result?: StateChangeResult;
  terrain_map_status?: TerrainMapStatus;
  gps_status?: GpsStatus;
  fix_status?: FixStatus;
  controlling_device_id?: ControllingDeviceIdentity;
  battery_percentage?: BatteryPercentage;
  parking_brake_status?: ParkingBrakeStatus;
};

export type TaskTableData = {
  geo_path?: GeoPath;
  behavior_execution_state?: BehaviorExecutionState;
};

export type LocalizationTableData = {
  localization_data?: LocalizationData;
};

const router = Router();

router.post("/", async (req: any, res: any) => {
  const { robotId, vpnIpAddress } = req.body;

  if (!robotId || !vpnIpAddress) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  robotRegistryService.addRobot(robotId, vpnIpAddress);
  console.log(`✅ Robot registered: ${robotId} (${vpnIpAddress})`);

  const registrationSuccess = grpcServiceDirectory.registerRobot({
    id: robotId,
    address: vpnIpAddress,
    lastSeen: new Date(),
  });

  if (!registrationSuccess) {
    return res.status(400).json({ error: "Failed to register robot" });
  }

  let client;
  try {
    client = await grpcServiceDirectory.getDataStreamClient(robotId);
  } catch (error) {
    console.error(
      `Failed to create data stream client for robot ${robotId}:`,
      error
    );
    return res.status(500).json({
      error: "Failed to connect to robot",
      details: (error as Error).message,
    });
  }

  const intervals = [];

  // Network table polling with decoding
  const networkInterval = setInterval(() => {
    client.requestNetworkTable(Empty.fromPartial({}), (err, response) => {
      if (err) {
        console.error(`Error requesting network table: ${err}`);
        return;
      }

      console.log(`Network table response received`);

      // Decode the network table data
      const decodedData: NetworkTableData = {};

      try {
        if (response.table) {
          // Decode each field in the table
          for (const [key, value] of Object.entries(response.table)) {
            if (!value || value.length === 0) continue;

            try {
              switch (key) {
                case "starlink_status":
                  decodedData.starlink_status = StarlinkStatus.decode(
                    value as Uint8Array
                  );
                  break;
                case "cell_metrics":
                  decodedData.cell_metrics = CellMetrics.decode(
                    value as Uint8Array
                  );
                  break;
                case "full_path_metrics":
                  decodedData.full_path_metrics = FullPathMetrics.decode(
                    value as Uint8Array
                  );
                  break;
                case "satellite_metrics":
                  decodedData.satellite_metrics = SatelliteMetrics.decode(
                    value as Uint8Array
                  );
                  break;
                case "zerotier_connection":
                  decodedData.zerotier_connection = ZerotierConnection.decode(
                    value as Uint8Array
                  );
                  break;
                case "zerotier_backup_path":
                  decodedData.zerotier_backup_path = ZerotierBackupPath.decode(
                    value as Uint8Array
                  );
                  break;
                default:
                  console.warn(`Unknown network table field: ${key}`);
              }
            } catch (decodeErr) {
              console.error(`Failed to decode ${key}:`, decodeErr);
            }
          }
        }
      } catch (tableErr) {
        console.error("Error processing network table:", tableErr);
      }

      // Emit the decoded data
      emitter.emit("networkUpdate", {
        robotId: robotId,
        table: "network",
        data: decodedData,
        timestamp: Date.now(),
      });
    });
  }, 1000);
  intervals.push(networkInterval);

  // System table polling with decoding
  const systemInterval = setInterval(() => {
    client.requestSystemTable(Empty.fromPartial({}), (err, response) => {
      if (err) {
        console.error(`Error requesting system table: ${err}`);
        return;
      }

      console.log(`System table response received`);

      // Decode the system table data
      const decodedData: SystemTableData = {};

      try {
        if (response.table) {
          // Decode each field in the table
          for (const [key, value] of Object.entries(response.table)) {
            if (!value || value.length === 0) continue;

            try {
              switch (key) {
                case "oak_status":
                  decodedData.oak_status = OakStatus.decode(
                    value as Uint8Array
                  );
                  break;
                case "can_status":
                  decodedData.can_status = CanStatus.decode(
                    value as Uint8Array
                  );
                  break;
                case "ecu_status":
                  decodedData.ecu_status = EcuStatus.decode(
                    value as Uint8Array
                  );
                  break;
                case "emergency_stop_status":
                  decodedData.emergency_stop_status =
                    EmergencyStopStatus.decode(value as Uint8Array);
                  break;
                case "parking_brake_status":
                  decodedData.parking_brake_status = ParkingBrakeStatus.decode(
                    value as Uint8Array
                  );
                  break;
                case "boom_button_status":
                  decodedData.boom_button_status = BoomButtonStatus.decode(
                    value as Uint8Array
                  );
                  break;
                case "state_change_result":
                  decodedData.state_change_result = StateChangeResult.decode(
                    value as Uint8Array
                  );
                  break;
                case "terrain_map_status":
                  decodedData.terrain_map_status = TerrainMapStatus.decode(
                    value as Uint8Array
                  );
                  break;
                case "gps_status":
                  decodedData.gps_status = GpsStatus.decode(
                    value as Uint8Array
                  );
                  break;
                case "fix_status":
                  decodedData.fix_status = FixStatus.decode(
                    value as Uint8Array
                  );
                  break;
                case "controlling_device_id":
                  decodedData.controlling_device_id =
                    ControllingDeviceIdentity.decode(value as Uint8Array);
                  break;
                case "battery_percentage":
                  decodedData.battery_percentage = BatteryPercentage.decode(
                    value as Uint8Array
                  );
                  break;
                default:
                  console.warn(`Unknown system table field: ${key}`);
              }
            } catch (decodeErr) {
              console.error(`Failed to decode ${key}:`, decodeErr);
            }
          }
        }
      } catch (tableErr) {
        console.error("Error processing system table:", tableErr);
      }

      // Emit the decoded data
      emitter.emit("systemUpdate", {
        robotId: robotId,
        table: "system",
        data: decodedData,
        timestamp: Date.now(),
      });
    });
  }, 1000);
  intervals.push(systemInterval);

  // Task table polling with decoding
  const taskInterval = setInterval(() => {
    client.requestTaskTable(Empty.fromPartial({}), (err, response) => {
      if (err) {
        console.error(`Error requesting task table: ${err}`);
        return;
      }

      console.log(`Task table response received`);

      // Decode the task table data
      const decodedData: TaskTableData = {};

      try {
        if (response.table) {
          // Decode each field in the table
          for (const [key, value] of Object.entries(response.table)) {
            if (!value || value.length === 0) continue;

            try {
              switch (key) {
                case "geo_path":
                  decodedData.geo_path = GeoPath.decode(value as Uint8Array);
                  break;
                case "behavior_execution_state":
                  decodedData.behavior_execution_state =
                    BehaviorExecutionState.decode(value as Uint8Array);
                  break;
                default:
                  console.warn(`Unknown task table field: ${key}`);
              }
            } catch (decodeErr) {
              console.error(`Failed to decode ${key}:`, decodeErr);
            }
          }
        }
      } catch (tableErr) {
        console.error("Error processing task table:", tableErr);
      }

      // Emit the decoded data
      emitter.emit("taskUpdate", {
        robotId: robotId,
        table: "task",
        data: decodedData,
        timestamp: Date.now(),
      });
    });
  }, 1000);
  intervals.push(taskInterval);

  const localizationInterval = setInterval(() => {
    client.requestLocalizationTable(Empty.fromPartial({}), (err, response) => {
      if (err) {
        console.error(`Error requesting localization table: ${err}`);
        return;
      }

      console.log(`Localization table response received`);

      // Decode the task table data
      const decodedData: LocalizationTableData = {};

      try {
        if (response.table) {
          // Decode each field in the table
          for (const [key, value] of Object.entries(response.table)) {
            if (!value || value.length === 0) continue;

            try {
              switch (key) {
                case "localization_data":
                  decodedData.localization_data = LocalizationData.decode(
                    value as Uint8Array
                  );
                  break;
                default:
                  console.warn(`Unknown task table field: ${key}`);
              }
            } catch (decodeErr) {
              console.error(`Failed to decode ${key}:`, decodeErr);
            }
          }
        }
      } catch (tableErr) {
        console.error("Error processing task table:", tableErr);
      }

      // Emit the localization data
      emitter.emit("localizationUpdate", {
        robotId: robotId,
        table: "localization",
        data: decodedData,
        timestamp: Date.now(),
      });
    });
  }, 200);
  intervals.push(localizationInterval);

  // Store intervals for cleanup
  if (typeof robotRegistryService.storeIntervals === "function") {
    robotRegistryService.storeIntervals(robotId, intervals);
  }

  return res.status(200).json({
    success: true,
    message: "Robot registered and streams started",
  });
});

export default router;
