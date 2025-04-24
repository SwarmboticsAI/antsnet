// package: sbai_perception_protos
// file: sbai_perception_protos/sbai_perception_protos/oak_status.proto

import * as jspb from "google-protobuf";

export class OakStatus extends jspb.Message {
  getOakState(): OakStateMap[keyof OakStateMap];
  setOakState(value: OakStateMap[keyof OakStateMap]): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): OakStatus.AsObject;
  static toObject(includeInstance: boolean, msg: OakStatus): OakStatus.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: OakStatus, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): OakStatus;
  static deserializeBinaryFromReader(message: OakStatus, reader: jspb.BinaryReader): OakStatus;
}

export namespace OakStatus {
  export type AsObject = {
    oakState: OakStateMap[keyof OakStateMap],
  }
}

export interface OakStateMap {
  OAK_STATE_UNSPECIFIED: 0;
  OAK_STATE_NORMAL: 1;
  OAK_STATE_ERROR: 2;
}

export const OakState: OakStateMap;

