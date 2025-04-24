/* eslint-disable @typescript-eslint/no-empty-object-type */

// package: sbai_behavior_protos
// file: sbai_behavior_protos/sbai_behavior_protos/patrol_parameters.proto

import * as jspb from "google-protobuf";

export class PatrolParameters extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): PatrolParameters.AsObject;
  static toObject(
    includeInstance: boolean,
    msg: PatrolParameters
  ): PatrolParameters.AsObject;
  static extensions: { [key: number]: jspb.ExtensionFieldInfo<jspb.Message> };
  static extensionsBinary: {
    [key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>;
  };
  static serializeBinaryToWriter(
    message: PatrolParameters,
    writer: jspb.BinaryWriter
  ): void;
  static deserializeBinary(bytes: Uint8Array): PatrolParameters;
  static deserializeBinaryFromReader(
    message: PatrolParameters,
    reader: jspb.BinaryReader
  ): PatrolParameters;
}

export namespace PatrolParameters {
  export type AsObject = {};
}
