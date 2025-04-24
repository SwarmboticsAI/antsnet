// package: sbai_control_protos
// file: sbai_control_protos/sbai_control_protos/emergency_stop_status.proto

import * as jspb from "google-protobuf";

export class EmergencyStopStatus extends jspb.Message {
  getEmergencyStopState(): EmergencyStopStateMap[keyof EmergencyStopStateMap];
  setEmergencyStopState(value: EmergencyStopStateMap[keyof EmergencyStopStateMap]): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): EmergencyStopStatus.AsObject;
  static toObject(includeInstance: boolean, msg: EmergencyStopStatus): EmergencyStopStatus.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: EmergencyStopStatus, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): EmergencyStopStatus;
  static deserializeBinaryFromReader(message: EmergencyStopStatus, reader: jspb.BinaryReader): EmergencyStopStatus;
}

export namespace EmergencyStopStatus {
  export type AsObject = {
    emergencyStopState: EmergencyStopStateMap[keyof EmergencyStopStateMap],
  }
}

export interface EmergencyStopStateMap {
  EMERGENCY_STOP_STATE_UNSPECIFIED: 0;
  EMERGENCY_STOP_STATE_ENGAGED: 1;
  EMERGENCY_STOP_STATE_DISENGAGED: 2;
}

export const EmergencyStopState: EmergencyStopStateMap;

