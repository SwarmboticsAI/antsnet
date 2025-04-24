// package: sbai_geometry_protos
// file: sbai_geometry_protos/sbai_geometry_protos/pose_stamped.proto

import * as jspb from "google-protobuf";
import * as sbai_geometry_protos_pose_pb from "../../sbai_geometry_protos/pose_pb";
import * as sbai_std_protos_header_pb from "../../sbai_std_protos/header_pb";

export class PoseStamped extends jspb.Message {
  hasHeader(): boolean;
  clearHeader(): void;
  getHeader(): sbai_std_protos_header_pb.Header | undefined;
  setHeader(value?: sbai_std_protos_header_pb.Header): void;

  hasPose(): boolean;
  clearPose(): void;
  getPose(): sbai_geometry_protos_pose_pb.Pose | undefined;
  setPose(value?: sbai_geometry_protos_pose_pb.Pose): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): PoseStamped.AsObject;
  static toObject(includeInstance: boolean, msg: PoseStamped): PoseStamped.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: PoseStamped, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): PoseStamped;
  static deserializeBinaryFromReader(message: PoseStamped, reader: jspb.BinaryReader): PoseStamped;
}

export namespace PoseStamped {
  export type AsObject = {
    header?: sbai_std_protos_header_pb.Header.AsObject,
    pose?: sbai_geometry_protos_pose_pb.Pose.AsObject,
  }
}

