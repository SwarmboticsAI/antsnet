// package: sbai_geometry_protos
// file: sbai_geometry_protos/sbai_geometry_protos/transform_stamped.proto

import * as jspb from "google-protobuf";
import * as sbai_geometry_protos_transform_pb from "../../sbai_geometry_protos/transform_pb";
import * as sbai_std_protos_header_pb from "../../sbai_std_protos/header_pb";

export class TransformStamped extends jspb.Message {
  hasHeader(): boolean;
  clearHeader(): void;
  getHeader(): sbai_std_protos_header_pb.Header | undefined;
  setHeader(value?: sbai_std_protos_header_pb.Header): void;

  getChildFrameId(): string;
  setChildFrameId(value: string): void;

  hasTransform(): boolean;
  clearTransform(): void;
  getTransform(): sbai_geometry_protos_transform_pb.Transform | undefined;
  setTransform(value?: sbai_geometry_protos_transform_pb.Transform): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): TransformStamped.AsObject;
  static toObject(includeInstance: boolean, msg: TransformStamped): TransformStamped.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: TransformStamped, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): TransformStamped;
  static deserializeBinaryFromReader(message: TransformStamped, reader: jspb.BinaryReader): TransformStamped;
}

export namespace TransformStamped {
  export type AsObject = {
    header?: sbai_std_protos_header_pb.Header.AsObject,
    childFrameId: string,
    transform?: sbai_geometry_protos_transform_pb.Transform.AsObject,
  }
}

