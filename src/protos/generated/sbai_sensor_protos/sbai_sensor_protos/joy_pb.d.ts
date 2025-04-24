// package: sbai_sensor_protos
// file: sbai_sensor_protos/sbai_sensor_protos/joy.proto

import * as jspb from "google-protobuf";
import * as sbai_std_protos_header_pb from "../../sbai_std_protos/header_pb";

export class Joy extends jspb.Message {
  hasHeader(): boolean;
  clearHeader(): void;
  getHeader(): sbai_std_protos_header_pb.Header | undefined;
  setHeader(value?: sbai_std_protos_header_pb.Header): void;

  clearAxesList(): void;
  getAxesList(): Array<number>;
  setAxesList(value: Array<number>): void;
  addAxes(value: number, index?: number): number;

  clearButtonsList(): void;
  getButtonsList(): Array<number>;
  setButtonsList(value: Array<number>): void;
  addButtons(value: number, index?: number): number;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Joy.AsObject;
  static toObject(includeInstance: boolean, msg: Joy): Joy.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: Joy, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Joy;
  static deserializeBinaryFromReader(message: Joy, reader: jspb.BinaryReader): Joy;
}

export namespace Joy {
  export type AsObject = {
    header?: sbai_std_protos_header_pb.Header.AsObject,
    axesList: Array<number>,
    buttonsList: Array<number>,
  }
}

