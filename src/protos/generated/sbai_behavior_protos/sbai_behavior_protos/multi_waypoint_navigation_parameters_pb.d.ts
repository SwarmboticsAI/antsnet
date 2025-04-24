// package: sbai_behavior_protos
// file: sbai_behavior_protos/sbai_behavior_protos/multi_waypoint_navigation_parameters.proto

import * as jspb from "google-protobuf";

export class MultiWaypointNavigationParameters extends jspb.Message {
  getDesiredFinalYawDeg(): number;
  setDesiredFinalYawDeg(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): MultiWaypointNavigationParameters.AsObject;
  static toObject(includeInstance: boolean, msg: MultiWaypointNavigationParameters): MultiWaypointNavigationParameters.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: MultiWaypointNavigationParameters, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): MultiWaypointNavigationParameters;
  static deserializeBinaryFromReader(message: MultiWaypointNavigationParameters, reader: jspb.BinaryReader): MultiWaypointNavigationParameters;
}

export namespace MultiWaypointNavigationParameters {
  export type AsObject = {
    desiredFinalYawDeg: number,
  }
}

