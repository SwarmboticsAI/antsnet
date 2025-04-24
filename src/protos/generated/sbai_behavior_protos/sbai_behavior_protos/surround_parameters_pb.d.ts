// package: sbai_behavior_protos
// file: sbai_behavior_protos/sbai_behavior_protos/surround_parameters.proto

import * as jspb from "google-protobuf";

export class SurroundParameters extends jspb.Message {
  getSurroundRadiusM(): number;
  setSurroundRadiusM(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): SurroundParameters.AsObject;
  static toObject(includeInstance: boolean, msg: SurroundParameters): SurroundParameters.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: SurroundParameters, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): SurroundParameters;
  static deserializeBinaryFromReader(message: SurroundParameters, reader: jspb.BinaryReader): SurroundParameters;
}

export namespace SurroundParameters {
  export type AsObject = {
    surroundRadiusM: number,
  }
}

