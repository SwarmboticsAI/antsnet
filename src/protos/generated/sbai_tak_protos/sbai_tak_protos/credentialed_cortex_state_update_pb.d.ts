// package: sbai_tak_protos
// file: sbai_tak_protos/sbai_tak_protos/credentialed_cortex_state_update.proto

import * as jspb from "google-protobuf";
import * as sbai_cortex_protos_cortex_state_update_pb from "../../sbai_cortex_protos/cortex_state_update_pb";
import * as sbai_tak_protos_authentication_header_pb from "../../sbai_tak_protos/authentication_header_pb";

export class CredentialedCortexStateUpdate extends jspb.Message {
  hasAuthenticationHeader(): boolean;
  clearAuthenticationHeader(): void;
  getAuthenticationHeader(): sbai_tak_protos_authentication_header_pb.AuthenticationHeader | undefined;
  setAuthenticationHeader(value?: sbai_tak_protos_authentication_header_pb.AuthenticationHeader): void;

  hasInternalMessage(): boolean;
  clearInternalMessage(): void;
  getInternalMessage(): sbai_cortex_protos_cortex_state_update_pb.CortexStateUpdate | undefined;
  setInternalMessage(value?: sbai_cortex_protos_cortex_state_update_pb.CortexStateUpdate): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): CredentialedCortexStateUpdate.AsObject;
  static toObject(includeInstance: boolean, msg: CredentialedCortexStateUpdate): CredentialedCortexStateUpdate.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: CredentialedCortexStateUpdate, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): CredentialedCortexStateUpdate;
  static deserializeBinaryFromReader(message: CredentialedCortexStateUpdate, reader: jspb.BinaryReader): CredentialedCortexStateUpdate;
}

export namespace CredentialedCortexStateUpdate {
  export type AsObject = {
    authenticationHeader?: sbai_tak_protos_authentication_header_pb.AuthenticationHeader.AsObject,
    internalMessage?: sbai_cortex_protos_cortex_state_update_pb.CortexStateUpdate.AsObject,
  }
}

