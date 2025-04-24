// package: sbai_builtin_protos
// file: sbai_builtin_protos/sbai_builtin_protos/time.proto

import * as jspb from "google-protobuf";

export class Time extends jspb.Message {
  getSec(): number;
  setSec(value: number): void;

  getNanosec(): number;
  setNanosec(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Time.AsObject;
  static toObject(includeInstance: boolean, msg: Time): Time.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: Time, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Time;
  static deserializeBinaryFromReader(message: Time, reader: jspb.BinaryReader): Time;
}

export namespace Time {
  export type AsObject = {
    sec: number,
    nanosec: number,
  }
}

