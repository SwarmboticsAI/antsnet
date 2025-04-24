// package: sbai_tak_protos
// file: sbai_tak_protos/sbai_tak_protos/authentication_header.proto

import * as jspb from "google-protobuf";

export class AuthenticationHeader extends jspb.Message {
  getTakId(): string;
  setTakId(value: string): void;

  getSessionToken(): string;
  setSessionToken(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): AuthenticationHeader.AsObject;
  static toObject(includeInstance: boolean, msg: AuthenticationHeader): AuthenticationHeader.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: AuthenticationHeader, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): AuthenticationHeader;
  static deserializeBinaryFromReader(message: AuthenticationHeader, reader: jspb.BinaryReader): AuthenticationHeader;
}

export namespace AuthenticationHeader {
  export type AsObject = {
    takId: string,
    sessionToken: string,
  }
}

