// package: sbai_cortex_protos
// file: sbai_cortex_protos/sbai_cortex_protos/cortex_state_update.proto

import * as jspb from "google-protobuf";

export class CortexStateUpdate extends jspb.Message {
  getNewState(): CortexStateMap[keyof CortexStateMap];
  setNewState(value: CortexStateMap[keyof CortexStateMap]): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): CortexStateUpdate.AsObject;
  static toObject(includeInstance: boolean, msg: CortexStateUpdate): CortexStateUpdate.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: CortexStateUpdate, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): CortexStateUpdate;
  static deserializeBinaryFromReader(message: CortexStateUpdate, reader: jspb.BinaryReader): CortexStateUpdate;
}

export namespace CortexStateUpdate {
  export type AsObject = {
    newState: CortexStateMap[keyof CortexStateMap],
  }
}

export interface CortexStateMap {
  CORTEX_STATE_UNSPECIFIED: 0;
  CORTEX_STATE_INIT: 1;
  CORTEX_STATE_STANDBY: 2;
  CORTEX_STATE_TELEOP: 3;
  CORTEX_STATE_AUTO: 4;
}

export const CortexState: CortexStateMap;

