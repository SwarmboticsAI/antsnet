// package: sbai_behavior_protos
// file: sbai_behavior_protos/sbai_behavior_protos/area_coverage_parameters.proto

import * as jspb from "google-protobuf";

export class AreaCoverageParameters extends jspb.Message {
  getLaneWidthM(): number;
  setLaneWidthM(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): AreaCoverageParameters.AsObject;
  static toObject(includeInstance: boolean, msg: AreaCoverageParameters): AreaCoverageParameters.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: AreaCoverageParameters, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): AreaCoverageParameters;
  static deserializeBinaryFromReader(message: AreaCoverageParameters, reader: jspb.BinaryReader): AreaCoverageParameters;
}

export namespace AreaCoverageParameters {
  export type AsObject = {
    laneWidthM: number,
  }
}

