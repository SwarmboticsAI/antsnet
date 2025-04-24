// package: sbai_swarm_discovery_protos
// file: sbai_swarm_discovery_protos/sbai_swarm_discovery_protos/discovery_heartbeat.proto

import * as jspb from "google-protobuf";
import * as sbai_geometry_protos_pose_stamped_pb from "../../sbai_geometry_protos/pose_stamped_pb";

export class DiscoveryHeartbeat extends jspb.Message {
  getRobotId(): string;
  setRobotId(value: string): void;

  hasPoseSharedMapFrame(): boolean;
  clearPoseSharedMapFrame(): void;
  getPoseSharedMapFrame(): sbai_geometry_protos_pose_stamped_pb.PoseStamped | undefined;
  setPoseSharedMapFrame(value?: sbai_geometry_protos_pose_stamped_pb.PoseStamped): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): DiscoveryHeartbeat.AsObject;
  static toObject(includeInstance: boolean, msg: DiscoveryHeartbeat): DiscoveryHeartbeat.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: DiscoveryHeartbeat, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): DiscoveryHeartbeat;
  static deserializeBinaryFromReader(message: DiscoveryHeartbeat, reader: jspb.BinaryReader): DiscoveryHeartbeat;
}

export namespace DiscoveryHeartbeat {
  export type AsObject = {
    robotId: string,
    poseSharedMapFrame?: sbai_geometry_protos_pose_stamped_pb.PoseStamped.AsObject,
  }
}

