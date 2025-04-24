// package: sbai_std_protos
// file: sbai_std_protos/sbai_std_protos/header.proto

import * as jspb from "google-protobuf";
import * as sbai_builtin_protos_time_pb from "../../sbai_builtin_protos/time_pb";

export class Header extends jspb.Message {
  hasStamp(): boolean;
  clearStamp(): void;
  getStamp(): sbai_builtin_protos_time_pb.Time | undefined;
  setStamp(value?: sbai_builtin_protos_time_pb.Time): void;

  getFrameId(): string;
  setFrameId(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Header.AsObject;
  static toObject(includeInstance: boolean, msg: Header): Header.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: Header, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Header;
  static deserializeBinaryFromReader(message: Header, reader: jspb.BinaryReader): Header;
}

export namespace Header {
  export type AsObject = {
    stamp?: sbai_builtin_protos_time_pb.Time.AsObject,
    frameId: string,
  }
}

