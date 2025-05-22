import { Router } from "express";
import { EventEmitter } from "events";
import { robotRegistryService } from "@/services/robots/robot-registry";
import { grpcServiceDirectory } from "@/services/grpc/grpc-service-directory";
import { Empty } from "@swarmbotics/protos/google/protobuf/empty.ts";

// Import network table protos
import { StarlinkStatus } from "@swarmbotics/protos/ros2_interfaces/sbai_network_protos/sbai_network_protos/starlink_status.ts";
import { CellMetrics } from "@swarmbotics/protos/ros2_interfaces/sbai_network_protos/sbai_network_protos/cell_metrics.ts";
import { FullPathMetrics } from "@swarmbotics/protos/ros2_interfaces/sbai_network_protos/sbai_network_protos/full_path_metrics.ts";
import { SatelliteMetrics } from "@swarmbotics/protos/ros2_interfaces/sbai_network_protos/sbai_network_protos/satellite_metrics.ts";
import {
  ZerotierConnection,
  ZerotierBackupPath,
} from "@swarmbotics/protos/ros2_interfaces/sbai_network_protos/sbai_network_protos/zerotier_connection.ts";

// Import system table protos
import { OakStatus } from "@swarmbotics/protos/ros2_interfaces/sbai_perception_protos/sbai_perception_protos/oak_status.ts";
import { CanStatus } from "@swarmbotics/protos/ros2_interfaces/sbai_control_protos/sbai_control_protos/can_status.ts";
import { EcuStatus } from "@swarmbotics/protos/ros2_interfaces/sbai_control_protos/sbai_control_protos/ecu_status.ts";
import { EmergencyStopStatus } from "@swarmbotics/protos/ros2_interfaces/sbai_control_protos/sbai_control_protos/emergency_stop_status.ts";
import { BoomButtonStatus } from "@swarmbotics/protos/ros2_interfaces/sbai_control_protos/sbai_control_protos/boom_button_status.ts";
import { StateChangeResult } from "@swarmbotics/protos/ros2_interfaces/sbai_cortex_protos/sbai_cortex_protos/state_change_result.ts";
import { TerrainMapStatus } from "@swarmbotics/protos/ros2_interfaces/sbai_perception_protos/sbai_perception_protos/terrain_map_status.ts";

// Import task table protos
import { GeoPath } from "@swarmbotics/protos/ros2_interfaces/sbai_geographic_protos/sbai_geographic_protos/geo_path.ts";
import { BehaviorExecutionState } from "@swarmbotics/protos/ros2_interfaces/sbai_behavior_protos/sbai_behavior_protos/behavior_execution_state.ts";

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
};

export type TaskTableData = {
  geo_path?: GeoPath;
  behavior_execution_state?: BehaviorExecutionState;
};

const router = Router();

router.post("/", (req: any, res: any) => {
  const { robotId, vpnIpAddress } = req.body;

  if (!robotId || !vpnIpAddress) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  if (robotId !== "fa005") {
    return res.status(400).json({ error: "Invalid robot ID" });
  }

  robotRegistryService.addRobot(robotId, vpnIpAddress);
  console.log(`✅ Robot registered: ${robotId} (${vpnIpAddress})`);

  grpcServiceDirectory.registerRobot(robotId);
  const client = grpcServiceDirectory.getDataStreamClient(robotId);
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
        robotId,
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
        robotId,
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
        robotId,
        table: "task",
        data: decodedData,
        timestamp: Date.now(),
      });
    });
  }, 1000);
  intervals.push(taskInterval);

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
