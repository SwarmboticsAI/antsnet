// package: sbai_tak_protos
// file: sbai_tak_protos/sbai_tak_protos/credentialed_cancel_behavior.proto

import * as jspb from "google-protobuf";
import * as sbai_std_protos_string_pb from "../../sbai_std_protos/string_pb";
import * as sbai_tak_protos_authentication_header_pb from "../../sbai_tak_protos/authentication_header_pb";

export class CredentialedCancelBehavior extends jspb.Message {
  hasAuthenticationHeader(): boolean;
  clearAuthenticationHeader(): void;
  getAuthenticationHeader(): sbai_tak_protos_authentication_header_pb.AuthenticationHeader | undefined;
  setAuthenticationHeader(value?: sbai_tak_protos_authentication_header_pb.AuthenticationHeader): void;

  hasInternalMessage(): boolean;
  clearInternalMessage(): void;
  getInternalMessage(): sbai_std_protos_string_pb.String | undefined;
  setInternalMessage(value?: sbai_std_protos_string_pb.String): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): CredentialedCancelBehavior.AsObject;
  static toObject(includeInstance: boolean, msg: CredentialedCancelBehavior): CredentialedCancelBehavior.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: CredentialedCancelBehavior, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): CredentialedCancelBehavior;
  static deserializeBinaryFromReader(message: CredentialedCancelBehavior, reader: jspb.BinaryReader): CredentialedCancelBehavior;
}

export namespace CredentialedCancelBehavior {
  export type AsObject = {
    authenticationHeader?: sbai_tak_protos_authentication_header_pb.AuthenticationHeader.AsObject,
    internalMessage?: sbai_std_protos_string_pb.String.AsObject,
  }
}

