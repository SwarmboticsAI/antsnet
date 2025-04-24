// package: sbai_task_assignment_protos
// file: sbai_task_assignment_protos/sbai_task_assignment_protos/winning_bid.proto

import * as jspb from "google-protobuf";

export class WinningBid extends jspb.Message {
  getTaskId(): number;
  setTaskId(value: number): void;

  getBidValue(): number;
  setBidValue(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): WinningBid.AsObject;
  static toObject(includeInstance: boolean, msg: WinningBid): WinningBid.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: WinningBid, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): WinningBid;
  static deserializeBinaryFromReader(message: WinningBid, reader: jspb.BinaryReader): WinningBid;
}

export namespace WinningBid {
  export type AsObject = {
    taskId: number,
    bidValue: number,
  }
}

