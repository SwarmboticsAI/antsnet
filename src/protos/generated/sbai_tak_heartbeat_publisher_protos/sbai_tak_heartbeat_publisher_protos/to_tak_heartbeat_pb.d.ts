// package: sbai_tak_heartbeat_publisher_protos
// file: sbai_tak_heartbeat_publisher_protos/sbai_tak_heartbeat_publisher_protos/to_tak_heartbeat.proto

import * as jspb from "google-protobuf";
import * as sbai_cortex_protos_cortex_state_update_pb from "../../sbai_cortex_protos/cortex_state_update_pb";
import * as sbai_geographic_protos_geo_point_pb from "../../sbai_geographic_protos/geo_point_pb";

export class ToTakHeartbeat extends jspb.Message {
  getRobotId(): string;
  setRobotId(value: string): void;

  getPlatformType(): string;
  setPlatformType(value: string): void;

  getIpAddress(): string;
  setIpAddress(value: string): void;

  getVpnIpAddress(): string;
  setVpnIpAddress(value: string): void;

  hasState(): boolean;
  clearState(): void;
  getState(): sbai_cortex_protos_cortex_state_update_pb.CortexStateUpdate | undefined;
  setState(value?: sbai_cortex_protos_cortex_state_update_pb.CortexStateUpdate): void;

  hasGpsCoordinate(): boolean;
  clearGpsCoordinate(): void;
  getGpsCoordinate(): sbai_geographic_protos_geo_point_pb.GeoPoint | undefined;
  setGpsCoordinate(value?: sbai_geographic_protos_geo_point_pb.GeoPoint): void;

  getMagneticHeadingDeg(): number;
  setMagneticHeadingDeg(value: number): void;

  getBatteryPercentage(): number;
  setBatteryPercentage(value: number): void;

  getBodySpeedMPerS(): number;
  setBodySpeedMPerS(value: number): void;

  getParkingBrakeState(): ParkingBrakeStateMap[keyof ParkingBrakeStateMap];
  setParkingBrakeState(value: ParkingBrakeStateMap[keyof ParkingBrakeStateMap]): void;

  hasControllingTakId(): boolean;
  clearControllingTakId(): void;
  getControllingTakId(): string;
  setControllingTakId(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ToTakHeartbeat.AsObject;
  static toObject(includeInstance: boolean, msg: ToTakHeartbeat): ToTakHeartbeat.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ToTakHeartbeat, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ToTakHeartbeat;
  static deserializeBinaryFromReader(message: ToTakHeartbeat, reader: jspb.BinaryReader): ToTakHeartbeat;
}

export namespace ToTakHeartbeat {
  export type AsObject = {
    robotId: string,
    platformType: string,
    ipAddress: string,
    vpnIpAddress: string,
    state?: sbai_cortex_protos_cortex_state_update_pb.CortexStateUpdate.AsObject,
    gpsCoordinate?: sbai_geographic_protos_geo_point_pb.GeoPoint.AsObject,
    magneticHeadingDeg: number,
    batteryPercentage: number,
    bodySpeedMPerS: number,
    parkingBrakeState: ParkingBrakeStateMap[keyof ParkingBrakeStateMap],
    controllingTakId: string,
  }
}

export interface ParkingBrakeStateMap {
  PARKING_BRAKE_STATE_UNSPECIFIED: 0;
  PARKING_BRAKE_STATE_ERROR: 1;
  PARKING_BRAKE_STATE_CALIBRATING: 2;
  PARKING_BRAKE_STATE_IN_PROGRESS: 3;
  PARKING_BRAKE_STATE_ENGAGED: 4;
  PARKING_BRAKE_STATE_DISENGAGED: 5;
}

export const ParkingBrakeState: ParkingBrakeStateMap;

