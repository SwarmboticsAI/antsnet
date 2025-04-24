// package: sbai_behavior_protos
// file: sbai_behavior_protos/sbai_behavior_protos/defend_parameters.proto

import * as jspb from "google-protobuf";

export class DefendParameters extends jspb.Message {
  getDefendRadiusM(): number;
  setDefendRadiusM(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): DefendParameters.AsObject;
  static toObject(includeInstance: boolean, msg: DefendParameters): DefendParameters.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: DefendParameters, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): DefendParameters;
  static deserializeBinaryFromReader(message: DefendParameters, reader: jspb.BinaryReader): DefendParameters;
}

export namespace DefendParameters {
  export type AsObject = {
    defendRadiusM: number,
  }
}

