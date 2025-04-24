// package: sbai_cortex_protos
// file: sbai_cortex_protos/sbai_cortex_protos/state_change_result.proto

import * as jspb from "google-protobuf";
import * as google_protobuf_wrappers_pb from "google-protobuf/google/protobuf/wrappers_pb";
import * as sbai_cortex_protos_cortex_state_update_pb from "../../sbai_cortex_protos/cortex_state_update_pb";

export class StateChangeResult extends jspb.Message {
  hasNewState(): boolean;
  clearNewState(): void;
  getNewState(): sbai_cortex_protos_cortex_state_update_pb.CortexStateUpdate | undefined;
  setNewState(value?: sbai_cortex_protos_cortex_state_update_pb.CortexStateUpdate): void;

  hasWasStateChangeSuccessful(): boolean;
  clearWasStateChangeSuccessful(): void;
  getWasStateChangeSuccessful(): google_protobuf_wrappers_pb.BoolValue | undefined;
  setWasStateChangeSuccessful(value?: google_protobuf_wrappers_pb.BoolValue): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): StateChangeResult.AsObject;
  static toObject(includeInstance: boolean, msg: StateChangeResult): StateChangeResult.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: StateChangeResult, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): StateChangeResult;
  static deserializeBinaryFromReader(message: StateChangeResult, reader: jspb.BinaryReader): StateChangeResult;
}

export namespace StateChangeResult {
  export type AsObject = {
    newState?: sbai_cortex_protos_cortex_state_update_pb.CortexStateUpdate.AsObject,
    wasStateChangeSuccessful?: google_protobuf_wrappers_pb.BoolValue.AsObject,
  }
}

