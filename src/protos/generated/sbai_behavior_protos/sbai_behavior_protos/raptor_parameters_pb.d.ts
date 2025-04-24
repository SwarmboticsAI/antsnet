// package: sbai_behavior_protos
// file: sbai_behavior_protos/sbai_behavior_protos/raptor_parameters.proto

import * as jspb from "google-protobuf";

export class RaptorParameters extends jspb.Message {
  getOuterRadiusM(): number;
  setOuterRadiusM(value: number): void;

  getInnerRadiusM(): number;
  setInnerRadiusM(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): RaptorParameters.AsObject;
  static toObject(includeInstance: boolean, msg: RaptorParameters): RaptorParameters.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: RaptorParameters, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): RaptorParameters;
  static deserializeBinaryFromReader(message: RaptorParameters, reader: jspb.BinaryReader): RaptorParameters;
}

export namespace RaptorParameters {
  export type AsObject = {
    outerRadiusM: number,
    innerRadiusM: number,
  }
}

