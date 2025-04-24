// package: sbai_geometry_protos
// file: sbai_geometry_protos/sbai_geometry_protos/pose.proto

import * as jspb from "google-protobuf";
import * as sbai_geometry_protos_point_pb from "../../sbai_geometry_protos/point_pb";
import * as sbai_geometry_protos_quaternion_pb from "../../sbai_geometry_protos/quaternion_pb";

export class Pose extends jspb.Message {
  hasPosition(): boolean;
  clearPosition(): void;
  getPosition(): sbai_geometry_protos_point_pb.Point | undefined;
  setPosition(value?: sbai_geometry_protos_point_pb.Point): void;

  hasOrientation(): boolean;
  clearOrientation(): void;
  getOrientation(): sbai_geometry_protos_quaternion_pb.Quaternion | undefined;
  setOrientation(value?: sbai_geometry_protos_quaternion_pb.Quaternion): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Pose.AsObject;
  static toObject(includeInstance: boolean, msg: Pose): Pose.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: Pose, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Pose;
  static deserializeBinaryFromReader(message: Pose, reader: jspb.BinaryReader): Pose;
}

export namespace Pose {
  export type AsObject = {
    position?: sbai_geometry_protos_point_pb.Point.AsObject,
    orientation?: sbai_geometry_protos_quaternion_pb.Quaternion.AsObject,
  }
}

