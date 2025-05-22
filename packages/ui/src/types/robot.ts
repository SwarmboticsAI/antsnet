import type { GpsState } from "@swarmbotics/protos/localization/ublox/ublox_protos/ublox_protos/gps_status";
import type { FixState } from "@swarmbotics/protos/localization/ublox/ublox_protos/ublox_protos/fix_status";
import type { ZerotierBackupPath } from "@swarmbotics/protos/ros2_interfaces/sbai_network_protos/sbai_network_protos/zerotier_connection";
import type { StarlinkState } from "@swarmbotics/protos/ros2_interfaces/sbai_network_protos/sbai_network_protos/starlink_status";
import type { TerrainMapHealthStatus } from "@swarmbotics/protos/ros2_interfaces/sbai_perception_protos/sbai_perception_protos/terrain_map_status";
import type { GeoPoint } from "@swarmbotics/protos/sbai_geographic_protos/geo_point";
import type { CortexStateUpdate } from "@swarmbotics/protos/ros2_interfaces/sbai_cortex_protos/sbai_cortex_protos/cortex_state_update";
import type { BoomButtonState } from "@swarmbotics/protos/ros2_interfaces/sbai_control_protos/sbai_control_protos/boom_button_status";
import type { EcuState } from "@swarmbotics/protos/ros2_interfaces/sbai_control_protos/sbai_control_protos/ecu_status";
import type { EmergencyStopState } from "@swarmbotics/protos/ros2_interfaces/sbai_control_protos/sbai_control_protos/emergency_stop_status";
import type { CanState } from "@swarmbotics/protos/ros2_interfaces/sbai_control_protos/sbai_control_protos/can_status";

export type RobotStatus = "online" | "offline";

export interface GpsData {
  gpsStatus: GpsState;
  fixStatus: FixState;
  numSatellites: number;
  horizontalAccuracyM: number;
  verticalAccuracyM: number;
}

export interface ZerotierConnectionData {
  peerId: string;
  isBonded: boolean;
  isRelayed: boolean;
  activeInternetType: string;
  activeGatewayOwner: string;
  activeEligible: boolean;
  backupPaths: ZerotierBackupPath[];
}

export interface StarlinkStatusData {
  state: StarlinkState;
  alertInfo: string[];
  popPingDropRate: number;
  popPingLatencyMs: number;
  fractionObstructed: number;
}

export interface LinkMetricsData {
  linkType?: string;
  testInternetIp?: string;
  minRttMs?: number;
  maxRttMs?: number;
  avgRttMs?: number;
  stdDevRttMs?: number;
  packetLossPercent?: number;
  isLinkDetected?: boolean;
}

export interface FullPathMetricsData {
  linksMetrics: LinkMetricsData[];
}

export interface NetworkMetricsData {
  testInternetIp?: string;
  minRttMs?: number;
  maxRttMs?: number;
  avgRttMs?: number;
  stdDevRttMs?: number;
  packetLossPercent?: number;
  isLinkDetected?: boolean;
}

export interface Robot {
  robotId: string;
  heading: number;
  battery: number;
  gpsCoordinates: GeoPoint | null;
  platformType: string;
  speed: number;
  ipAddress: string;
  vpnIpAddress: string;
  status: RobotStatus;
  mode: number;
  lastSeen: Date;
  parkingBrakeState: number;
  controllingTakId: string;

  // New fields from system telemetry
  stateChangeResult?: CortexStateUpdate;
  boomButtonStatus?: BoomButtonState;
  ecuStatus?: EcuState;
  emergencyStopStatus?: EmergencyStopState;
  canStatus?: CanState;
  oakStatus?: OakState;
  starlinkStatus?: StarlinkStatusData;
  terrainMapStatus?: TerrainMapHealthStatus;
  zerotierConnection?: ZerotierConnectionData;

  // Network metrics fields
  satelliteMetrics?: NetworkMetricsData;
  cellMetrics?: NetworkMetricsData;
  fullPathMetrics?: FullPathMetricsData;

  // GPS metrics fields
  fixStatus?: {
    fixState: FixState;
    numSatellites: number;
    horizontalAccuracyM: number;
    verticalAccuracyM: number;
  };

  gpsStatus: {
    gpsState: GpsState;
  };
}

export enum ParkingBrakeState {
  PARKING_BRAKE_STATE_UNSPECIFIED = 0,
  PARKING_BRAKE_STATE_ERROR = 1,
  PARKING_BRAKE_STATE_CALIBRATING = 2,
  PARKING_BRAKE_STATE_IN_PROGRESS = 3,
  PARKING_BRAKE_STATE_ENGAGED = 4,
  PARKING_BRAKE_STATE_DISENGAGED = 5,
  UNRECOGNIZED = -1,
}

export enum OakState {
  OAK_STATE_UNSPECIFIED = 0,
  OAK_STATE_NORMAL = 1,
  OAK_STATE_ERROR = 2,
  UNRECOGNIZED = -1,
}
