// package: sbai_geometry_protos
// file: sbai_geometry_protos/sbai_geometry_protos/transform.proto

import * as jspb from "google-protobuf";
import * as sbai_geometry_protos_quaternion_pb from "../../sbai_geometry_protos/quaternion_pb";
import * as sbai_geometry_protos_vector3_pb from "../../sbai_geometry_protos/vector3_pb";

export class Transform extends jspb.Message {
  hasTranslation(): boolean;
  clearTranslation(): void;
  getTranslation(): sbai_geometry_protos_vector3_pb.Vector3 | undefined;
  setTranslation(value?: sbai_geometry_protos_vector3_pb.Vector3): void;

  hasRotation(): boolean;
  clearRotation(): void;
  getRotation(): sbai_geometry_protos_quaternion_pb.Quaternion | undefined;
  setRotation(value?: sbai_geometry_protos_quaternion_pb.Quaternion): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Transform.AsObject;
  static toObject(includeInstance: boolean, msg: Transform): Transform.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: Transform, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Transform;
  static deserializeBinaryFromReader(message: Transform, reader: jspb.BinaryReader): Transform;
}

export namespace Transform {
  export type AsObject = {
    translation?: sbai_geometry_protos_vector3_pb.Vector3.AsObject,
    rotation?: sbai_geometry_protos_quaternion_pb.Quaternion.AsObject,
  }
}

