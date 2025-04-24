// package: sbai_tak_protos
// file: sbai_tak_protos/sbai_tak_protos/credentialed_joy.proto

import * as jspb from "google-protobuf";
import * as sbai_sensor_protos_joy_pb from "../../sbai_sensor_protos/joy_pb";
import * as sbai_tak_protos_authentication_header_pb from "../../sbai_tak_protos/authentication_header_pb";

export class CredentialedJoy extends jspb.Message {
  hasAuthenticationHeader(): boolean;
  clearAuthenticationHeader(): void;
  getAuthenticationHeader(): sbai_tak_protos_authentication_header_pb.AuthenticationHeader | undefined;
  setAuthenticationHeader(value?: sbai_tak_protos_authentication_header_pb.AuthenticationHeader): void;

  hasInternalMessage(): boolean;
  clearInternalMessage(): void;
  getInternalMessage(): sbai_sensor_protos_joy_pb.Joy | undefined;
  setInternalMessage(value?: sbai_sensor_protos_joy_pb.Joy): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): CredentialedJoy.AsObject;
  static toObject(includeInstance: boolean, msg: CredentialedJoy): CredentialedJoy.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: CredentialedJoy, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): CredentialedJoy;
  static deserializeBinaryFromReader(message: CredentialedJoy, reader: jspb.BinaryReader): CredentialedJoy;
}

export namespace CredentialedJoy {
  export type AsObject = {
    authenticationHeader?: sbai_tak_protos_authentication_header_pb.AuthenticationHeader.AsObject,
    internalMessage?: sbai_sensor_protos_joy_pb.Joy.AsObject,
  }
}

