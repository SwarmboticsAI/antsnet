// package: sbai_behavior_protos
// file: sbai_behavior_protos/sbai_behavior_protos/line_formation_parameters.proto

import * as jspb from "google-protobuf";

export class LineFormationParameters extends jspb.Message {
  getSeparationDistanceM(): number;
  setSeparationDistanceM(value: number): void;

  getLineYawDeg(): number;
  setLineYawDeg(value: number): void;

  getRobotYawDeg(): number;
  setRobotYawDeg(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): LineFormationParameters.AsObject;
  static toObject(includeInstance: boolean, msg: LineFormationParameters): LineFormationParameters.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: LineFormationParameters, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): LineFormationParameters;
  static deserializeBinaryFromReader(message: LineFormationParameters, reader: jspb.BinaryReader): LineFormationParameters;
}

export namespace LineFormationParameters {
  export type AsObject = {
    separationDistanceM: number,
    lineYawDeg: number,
    robotYawDeg: number,
  }
}

