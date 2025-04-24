// package: sbai_control_protos
// file: sbai_control_protos/sbai_control_protos/can_status.proto

import * as jspb from "google-protobuf";

export class CanStatus extends jspb.Message {
  getCanState(): CanStateMap[keyof CanStateMap];
  setCanState(value: CanStateMap[keyof CanStateMap]): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): CanStatus.AsObject;
  static toObject(includeInstance: boolean, msg: CanStatus): CanStatus.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: CanStatus, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): CanStatus;
  static deserializeBinaryFromReader(message: CanStatus, reader: jspb.BinaryReader): CanStatus;
}

export namespace CanStatus {
  export type AsObject = {
    canState: CanStateMap[keyof CanStateMap],
  }
}

export interface CanStateMap {
  CAN_STATE_UNSPECIFIED: 0;
  CAN_STATE_NORMAL: 1;
  CAN_STATE_ERROR: 2;
}

export const CanState: CanStateMap;

