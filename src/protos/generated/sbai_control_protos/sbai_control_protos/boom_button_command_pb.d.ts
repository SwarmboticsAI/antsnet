// package: sbai_control_protos
// file: sbai_control_protos/sbai_control_protos/boom_button_command.proto

import * as jspb from "google-protobuf";
import * as google_protobuf_wrappers_pb from "google-protobuf/google/protobuf/wrappers_pb";

export class BoomButtonCommand extends jspb.Message {
  hasShouldEngageButtonCommand(): boolean;
  clearShouldEngageButtonCommand(): void;
  getShouldEngageButtonCommand(): google_protobuf_wrappers_pb.BoolValue | undefined;
  setShouldEngageButtonCommand(value?: google_protobuf_wrappers_pb.BoolValue): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): BoomButtonCommand.AsObject;
  static toObject(includeInstance: boolean, msg: BoomButtonCommand): BoomButtonCommand.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: BoomButtonCommand, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): BoomButtonCommand;
  static deserializeBinaryFromReader(message: BoomButtonCommand, reader: jspb.BinaryReader): BoomButtonCommand;
}

export namespace BoomButtonCommand {
  export type AsObject = {
    shouldEngageButtonCommand?: google_protobuf_wrappers_pb.BoolValue.AsObject,
  }
}

