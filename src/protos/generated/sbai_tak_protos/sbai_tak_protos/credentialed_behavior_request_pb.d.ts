// package: sbai_tak_protos
// file: sbai_tak_protos/sbai_tak_protos/credentialed_behavior_request.proto

import * as jspb from "google-protobuf";
import * as sbai_behavior_protos_behavior_request_pb from "../../sbai_behavior_protos/behavior_request_pb";
import * as sbai_tak_protos_authentication_header_pb from "../../sbai_tak_protos/authentication_header_pb";

export class CredentialedBehaviorRequest extends jspb.Message {
  hasAuthenticationHeader(): boolean;
  clearAuthenticationHeader(): void;
  getAuthenticationHeader(): sbai_tak_protos_authentication_header_pb.AuthenticationHeader | undefined;
  setAuthenticationHeader(value?: sbai_tak_protos_authentication_header_pb.AuthenticationHeader): void;

  hasInternalMessage(): boolean;
  clearInternalMessage(): void;
  getInternalMessage(): sbai_behavior_protos_behavior_request_pb.BehaviorRequest | undefined;
  setInternalMessage(value?: sbai_behavior_protos_behavior_request_pb.BehaviorRequest): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): CredentialedBehaviorRequest.AsObject;
  static toObject(includeInstance: boolean, msg: CredentialedBehaviorRequest): CredentialedBehaviorRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: CredentialedBehaviorRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): CredentialedBehaviorRequest;
  static deserializeBinaryFromReader(message: CredentialedBehaviorRequest, reader: jspb.BinaryReader): CredentialedBehaviorRequest;
}

export namespace CredentialedBehaviorRequest {
  export type AsObject = {
    authenticationHeader?: sbai_tak_protos_authentication_header_pb.AuthenticationHeader.AsObject,
    internalMessage?: sbai_behavior_protos_behavior_request_pb.BehaviorRequest.AsObject,
  }
}

