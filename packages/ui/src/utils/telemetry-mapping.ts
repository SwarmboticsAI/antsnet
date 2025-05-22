import { StateChangeResult } from "@swarmbotics/protos/ros2_interfaces/sbai_cortex_protos/sbai_cortex_protos/state_change_result";
import { BoomButtonStatus } from "@swarmbotics/protos/ros2_interfaces/sbai_control_protos/sbai_control_protos/boom_button_status";
import { EcuStatus } from "@swarmbotics/protos/ros2_interfaces/sbai_control_protos/sbai_control_protos/ecu_status";
import { EmergencyStopStatus } from "@swarmbotics/protos/ros2_interfaces/sbai_control_protos/sbai_control_protos/emergency_stop_status";
import { CanStatus } from "@swarmbotics/protos/ros2_interfaces/sbai_control_protos/sbai_control_protos/can_status";
import { OakStatus } from "@swarmbotics/protos/ros2_interfaces/sbai_perception_protos/sbai_perception_protos/oak_status";
import { TerrainMapStatus } from "@swarmbotics/protos/ros2_interfaces/sbai_perception_protos/sbai_perception_protos/terrain_map_status";

import { StarlinkStatus } from "@swarmbotics/protos/ros2_interfaces/sbai_network_protos/sbai_network_protos/starlink_status";
import { ZerotierConnection } from "@swarmbotics/protos/ros2_interfaces/sbai_network_protos/sbai_network_protos/zerotier_connection";
import { SatelliteMetrics } from "@swarmbotics/protos/ros2_interfaces/sbai_network_protos/sbai_network_protos/satellite_metrics";
import { FullPathMetrics } from "@swarmbotics/protos/ros2_interfaces/sbai_network_protos/sbai_network_protos/full_path_metrics";
import { CellMetrics } from "@swarmbotics/protos/ros2_interfaces/sbai_network_protos/sbai_network_protos/cell_metrics";
import { GpsStatus } from "@swarmbotics/protos/localization/ublox/ublox_protos/ublox_protos/gps_status";
import { FixStatus } from "@swarmbotics/protos/localization/ublox/ublox_protos/ublox_protos/fix_status";

export const networkTableTypeMap = {
  starlink_status: StarlinkStatus,
  zerotier_connection: ZerotierConnection,
  satellite_metrics: SatelliteMetrics,
  full_path_metrics: FullPathMetrics,
  cell_metrics: CellMetrics,
};

export const systemMessageTypeMap = {
  state_change_result: StateChangeResult,
  boom_button_status: BoomButtonStatus,
  ecu_status: EcuStatus,
  emergency_stop_status: EmergencyStopStatus,
  can_status: CanStatus,
  oak_status: OakStatus,
  terrain_map_status: TerrainMapStatus,
  gps_status: GpsStatus,
  fix_status: FixStatus,
};

export const keyConversionMap = {
  boom_button_status: {
    convertedKey: "boomButtonStatus",
    valueKey: "boomButtonState",
  },
  ecu_status: { convertedKey: "ecuStatus", valueKey: "ecuState" },
  emergency_stop_status: {
    convertedKey: "emergencyStopStatus",
    valueKey: "emergencyStopState",
  },
  can_status: { convertedKey: "canStatus", valueKey: "canState" },
  oak_status: { convertedKey: "oakStatus", valueKey: "oakState" },
  gps_status: { convertedKey: "gpsStatus", valueKey: "gpsState" },
  // Update the fix_status mapping
  fix_status: { convertedKey: "fixStatus", valueKey: "fixState" },
  terrain_map_status: {
    convertedKey: "terrainMapStatus",
    valueKey: "healthStatus",
  },
  starlink_status: {
    convertedKey: "starlinkStatus",
    valueKey: "starlinkState",
  },
  zerotier_connection: {
    convertedKey: "zerotierConnection",
    valueKey: "peerId",
  },
  state_change_result: {
    convertedKey: "stateChangeResult",
    valueKey: "newState",
  },
  satellite_metrics: {
    convertedKey: "satelliteMetrics",
    valueKey: "testInternetIp",
  },
  full_path_metrics: {
    convertedKey: "fullPathMetrics",
    valueKey: "linksMetrics",
  },
  cell_metrics: {
    convertedKey: "cellMetrics",
    valueKey: "testInternetIp",
  },
};
