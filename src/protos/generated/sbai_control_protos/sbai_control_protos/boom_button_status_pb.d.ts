// package: sbai_control_protos
// file: sbai_control_protos/sbai_control_protos/boom_button_status.proto

import * as jspb from "google-protobuf";

export class BoomButtonStatus extends jspb.Message {
  getBoomButtonState(): BoomButtonStateMap[keyof BoomButtonStateMap];
  setBoomButtonState(value: BoomButtonStateMap[keyof BoomButtonStateMap]): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): BoomButtonStatus.AsObject;
  static toObject(includeInstance: boolean, msg: BoomButtonStatus): BoomButtonStatus.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: BoomButtonStatus, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): BoomButtonStatus;
  static deserializeBinaryFromReader(message: BoomButtonStatus, reader: jspb.BinaryReader): BoomButtonStatus;
}

export namespace BoomButtonStatus {
  export type AsObject = {
    boomButtonState: BoomButtonStateMap[keyof BoomButtonStateMap],
  }
}

export interface BoomButtonStateMap {
  BOOM_BUTTON_STATE_UNSPECIFIED: 0;
  BOOM_BUTTON_STATE_ENGAGED: 1;
  BOOM_BUTTON_STATE_DISENGAGED: 2;
}

export const BoomButtonState: BoomButtonStateMap;

