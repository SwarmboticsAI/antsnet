// package: sbai_geometry_protos
// file: sbai_geometry_protos/sbai_geometry_protos/twist.proto

import * as jspb from "google-protobuf";
import * as sbai_geometry_protos_vector3_pb from "../../sbai_geometry_protos/vector3_pb";

export class Twist extends jspb.Message {
  hasLinear(): boolean;
  clearLinear(): void;
  getLinear(): sbai_geometry_protos_vector3_pb.Vector3 | undefined;
  setLinear(value?: sbai_geometry_protos_vector3_pb.Vector3): void;

  hasAngular(): boolean;
  clearAngular(): void;
  getAngular(): sbai_geometry_protos_vector3_pb.Vector3 | undefined;
  setAngular(value?: sbai_geometry_protos_vector3_pb.Vector3): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Twist.AsObject;
  static toObject(includeInstance: boolean, msg: Twist): Twist.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: Twist, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Twist;
  static deserializeBinaryFromReader(message: Twist, reader: jspb.BinaryReader): Twist;
}

export namespace Twist {
  export type AsObject = {
    linear?: sbai_geometry_protos_vector3_pb.Vector3.AsObject,
    angular?: sbai_geometry_protos_vector3_pb.Vector3.AsObject,
  }
}

