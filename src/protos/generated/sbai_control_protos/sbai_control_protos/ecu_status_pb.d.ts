// package: sbai_control_protos
// file: sbai_control_protos/sbai_control_protos/ecu_status.proto

import * as jspb from "google-protobuf";

export class EcuStatus extends jspb.Message {
  getEcuState(): EcuStateMap[keyof EcuStateMap];
  setEcuState(value: EcuStateMap[keyof EcuStateMap]): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): EcuStatus.AsObject;
  static toObject(includeInstance: boolean, msg: EcuStatus): EcuStatus.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: EcuStatus, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): EcuStatus;
  static deserializeBinaryFromReader(message: EcuStatus, reader: jspb.BinaryReader): EcuStatus;
}

export namespace EcuStatus {
  export type AsObject = {
    ecuState: EcuStateMap[keyof EcuStateMap],
  }
}

export interface EcuStateMap {
  ECU_STATE_UNSPECIFIED: 0;
  ECU_STATE_NORMAL: 1;
  ECU_STATE_ERROR: 2;
}

export const EcuState: EcuStateMap;

