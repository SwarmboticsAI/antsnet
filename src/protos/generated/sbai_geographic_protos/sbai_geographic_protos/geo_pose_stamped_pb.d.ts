// package: sbai_geographic_protos
// file: sbai_geographic_protos/sbai_geographic_protos/geo_pose_stamped.proto

import * as jspb from "google-protobuf";
import * as sbai_geographic_protos_geo_pose_pb from "../../sbai_geographic_protos/geo_pose_pb";
import * as sbai_std_protos_header_pb from "../../sbai_std_protos/header_pb";

export class GeoPoseStamped extends jspb.Message {
  hasHeader(): boolean;
  clearHeader(): void;
  getHeader(): sbai_std_protos_header_pb.Header | undefined;
  setHeader(value?: sbai_std_protos_header_pb.Header): void;

  hasPose(): boolean;
  clearPose(): void;
  getPose(): sbai_geographic_protos_geo_pose_pb.GeoPose | undefined;
  setPose(value?: sbai_geographic_protos_geo_pose_pb.GeoPose): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GeoPoseStamped.AsObject;
  static toObject(includeInstance: boolean, msg: GeoPoseStamped): GeoPoseStamped.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: GeoPoseStamped, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GeoPoseStamped;
  static deserializeBinaryFromReader(message: GeoPoseStamped, reader: jspb.BinaryReader): GeoPoseStamped;
}

export namespace GeoPoseStamped {
  export type AsObject = {
    header?: sbai_std_protos_header_pb.Header.AsObject,
    pose?: sbai_geographic_protos_geo_pose_pb.GeoPose.AsObject,
  }
}

