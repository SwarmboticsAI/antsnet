// package: sbai_tak_protos
// file: sbai_tak_protos/sbai_tak_protos/credentialed_parking_brake_command.proto

import * as jspb from "google-protobuf";
import * as sbai_control_protos_parking_brake_command_pb from "../../sbai_control_protos/parking_brake_command_pb";
import * as sbai_tak_protos_authentication_header_pb from "../../sbai_tak_protos/authentication_header_pb";

export class CredentialedParkingBrakeCommand extends jspb.Message {
  hasAuthenticationHeader(): boolean;
  clearAuthenticationHeader(): void;
  getAuthenticationHeader(): sbai_tak_protos_authentication_header_pb.AuthenticationHeader | undefined;
  setAuthenticationHeader(value?: sbai_tak_protos_authentication_header_pb.AuthenticationHeader): void;

  hasInternalMessage(): boolean;
  clearInternalMessage(): void;
  getInternalMessage(): sbai_control_protos_parking_brake_command_pb.ParkingBrakeCommand | undefined;
  setInternalMessage(value?: sbai_control_protos_parking_brake_command_pb.ParkingBrakeCommand): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): CredentialedParkingBrakeCommand.AsObject;
  static toObject(includeInstance: boolean, msg: CredentialedParkingBrakeCommand): CredentialedParkingBrakeCommand.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: CredentialedParkingBrakeCommand, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): CredentialedParkingBrakeCommand;
  static deserializeBinaryFromReader(message: CredentialedParkingBrakeCommand, reader: jspb.BinaryReader): CredentialedParkingBrakeCommand;
}

export namespace CredentialedParkingBrakeCommand {
  export type AsObject = {
    authenticationHeader?: sbai_tak_protos_authentication_header_pb.AuthenticationHeader.AsObject,
    internalMessage?: sbai_control_protos_parking_brake_command_pb.ParkingBrakeCommand.AsObject,
  }
}

