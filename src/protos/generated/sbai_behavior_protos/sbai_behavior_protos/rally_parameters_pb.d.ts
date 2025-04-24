// package: sbai_behavior_protos
// file: sbai_behavior_protos/sbai_behavior_protos/rally_parameters.proto

import * as jspb from "google-protobuf";

export class RallyParameters extends jspb.Message {
  getRallyRadiusM(): number;
  setRallyRadiusM(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): RallyParameters.AsObject;
  static toObject(includeInstance: boolean, msg: RallyParameters): RallyParameters.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: RallyParameters, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): RallyParameters;
  static deserializeBinaryFromReader(message: RallyParameters, reader: jspb.BinaryReader): RallyParameters;
}

export namespace RallyParameters {
  export type AsObject = {
    rallyRadiusM: number,
  }
}

