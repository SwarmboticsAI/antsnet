// package: sbai_control_protos
// file: sbai_control_protos/sbai_control_protos/parking_brake_command.proto

import * as jspb from "google-protobuf";
import * as google_protobuf_wrappers_pb from "google-protobuf/google/protobuf/wrappers_pb";

export class ParkingBrakeCommand extends jspb.Message {
  hasShouldEngageBrake(): boolean;
  clearShouldEngageBrake(): void;
  getShouldEngageBrake(): google_protobuf_wrappers_pb.BoolValue | undefined;
  setShouldEngageBrake(value?: google_protobuf_wrappers_pb.BoolValue): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ParkingBrakeCommand.AsObject;
  static toObject(includeInstance: boolean, msg: ParkingBrakeCommand): ParkingBrakeCommand.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ParkingBrakeCommand, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ParkingBrakeCommand;
  static deserializeBinaryFromReader(message: ParkingBrakeCommand, reader: jspb.BinaryReader): ParkingBrakeCommand;
}

export namespace ParkingBrakeCommand {
  export type AsObject = {
    shouldEngageBrake?: google_protobuf_wrappers_pb.BoolValue.AsObject,
  }
}

