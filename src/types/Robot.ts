import { GeoPoint } from "@/protos/generated/sbai_geographic_protos/geo_point";

export type Robot = {
  robotId: string;
  heading: number;
  battery: number;
  gpsCoordinates: GeoPoint | null;
  platformType: string;
  speed: number;
  ipAddress: string;
  vpnIpAddress: string;
  status: string;
  mode: number;
  lastSeen: Date;
  parkingBrakeState: number;
  controllingTakId: string;

  // Additional telemetry fields from aggregated system data
  boomButtonStatus?: number;
  ecuStatus?: number;
  emergencyStopStatus?: number;
  canStatus?: number;
  cameraStatus?: number;
  stateChangeResult?: number;
};
