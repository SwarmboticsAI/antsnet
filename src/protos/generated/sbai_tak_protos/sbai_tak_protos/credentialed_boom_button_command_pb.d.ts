// package: sbai_tak_protos
// file: sbai_tak_protos/sbai_tak_protos/credentialed_boom_button_command.proto

import * as jspb from "google-protobuf";
import * as sbai_control_protos_boom_button_command_pb from "../../sbai_control_protos/boom_button_command_pb";
import * as sbai_tak_protos_authentication_header_pb from "../../sbai_tak_protos/authentication_header_pb";

export class CredentialedBoomButtonCommand extends jspb.Message {
  hasAuthenticationHeader(): boolean;
  clearAuthenticationHeader(): void;
  getAuthenticationHeader(): sbai_tak_protos_authentication_header_pb.AuthenticationHeader | undefined;
  setAuthenticationHeader(value?: sbai_tak_protos_authentication_header_pb.AuthenticationHeader): void;

  hasInternalMessage(): boolean;
  clearInternalMessage(): void;
  getInternalMessage(): sbai_control_protos_boom_button_command_pb.BoomButtonCommand | undefined;
  setInternalMessage(value?: sbai_control_protos_boom_button_command_pb.BoomButtonCommand): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): CredentialedBoomButtonCommand.AsObject;
  static toObject(includeInstance: boolean, msg: CredentialedBoomButtonCommand): CredentialedBoomButtonCommand.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: CredentialedBoomButtonCommand, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): CredentialedBoomButtonCommand;
  static deserializeBinaryFromReader(message: CredentialedBoomButtonCommand, reader: jspb.BinaryReader): CredentialedBoomButtonCommand;
}

export namespace CredentialedBoomButtonCommand {
  export type AsObject = {
    authenticationHeader?: sbai_tak_protos_authentication_header_pb.AuthenticationHeader.AsObject,
    internalMessage?: sbai_control_protos_boom_button_command_pb.BoomButtonCommand.AsObject,
  }
}

