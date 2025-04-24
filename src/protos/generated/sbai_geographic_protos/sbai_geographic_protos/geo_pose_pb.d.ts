// package: sbai_geographic_protos
// file: sbai_geographic_protos/sbai_geographic_protos/geo_pose.proto

import * as jspb from "google-protobuf";
import * as sbai_geographic_protos_geo_point_pb from "../../sbai_geographic_protos/geo_point_pb";
import * as sbai_geometry_protos_quaternion_pb from "../../sbai_geometry_protos/quaternion_pb";

export class GeoPose extends jspb.Message {
  hasPosition(): boolean;
  clearPosition(): void;
  getPosition(): sbai_geographic_protos_geo_point_pb.GeoPoint | undefined;
  setPosition(value?: sbai_geographic_protos_geo_point_pb.GeoPoint): void;

  hasOrientation(): boolean;
  clearOrientation(): void;
  getOrientation(): sbai_geometry_protos_quaternion_pb.Quaternion | undefined;
  setOrientation(value?: sbai_geometry_protos_quaternion_pb.Quaternion): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GeoPose.AsObject;
  static toObject(includeInstance: boolean, msg: GeoPose): GeoPose.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: GeoPose, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GeoPose;
  static deserializeBinaryFromReader(message: GeoPose, reader: jspb.BinaryReader): GeoPose;
}

export namespace GeoPose {
  export type AsObject = {
    position?: sbai_geographic_protos_geo_point_pb.GeoPoint.AsObject,
    orientation?: sbai_geometry_protos_quaternion_pb.Quaternion.AsObject,
  }
}

