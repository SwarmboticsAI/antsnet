// package: sbai_geographic_protos
// file: sbai_geographic_protos/sbai_geographic_protos/geo_path.proto

import * as jspb from "google-protobuf";
import * as sbai_geographic_protos_geo_pose_stamped_pb from "../../sbai_geographic_protos/geo_pose_stamped_pb";
import * as sbai_std_protos_header_pb from "../../sbai_std_protos/header_pb";

export class GeoPath extends jspb.Message {
  hasHeader(): boolean;
  clearHeader(): void;
  getHeader(): sbai_std_protos_header_pb.Header | undefined;
  setHeader(value?: sbai_std_protos_header_pb.Header): void;

  clearPosesList(): void;
  getPosesList(): Array<sbai_geographic_protos_geo_pose_stamped_pb.GeoPoseStamped>;
  setPosesList(value: Array<sbai_geographic_protos_geo_pose_stamped_pb.GeoPoseStamped>): void;
  addPoses(value?: sbai_geographic_protos_geo_pose_stamped_pb.GeoPoseStamped, index?: number): sbai_geographic_protos_geo_pose_stamped_pb.GeoPoseStamped;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GeoPath.AsObject;
  static toObject(includeInstance: boolean, msg: GeoPath): GeoPath.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: GeoPath, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GeoPath;
  static deserializeBinaryFromReader(message: GeoPath, reader: jspb.BinaryReader): GeoPath;
}

export namespace GeoPath {
  export type AsObject = {
    header?: sbai_std_protos_header_pb.Header.AsObject,
    posesList: Array<sbai_geographic_protos_geo_pose_stamped_pb.GeoPoseStamped.AsObject>,
  }
}

