// package: sbai_tak_protos
// file: sbai_tak_protos/sbai_tak_protos/session_request.proto

import * as jspb from "google-protobuf";

export class SessionRequest extends jspb.Message {
  getRequestType(): SessionRequestTypeMap[keyof SessionRequestTypeMap];
  setRequestType(value: SessionRequestTypeMap[keyof SessionRequestTypeMap]): void;

  getTakId(): string;
  setTakId(value: string): void;

  getRobotId(): string;
  setRobotId(value: string): void;

  hasSequenceNumber(): boolean;
  clearSequenceNumber(): void;
  getSequenceNumber(): number;
  setSequenceNumber(value: number): void;

  hasSessionToken(): boolean;
  clearSessionToken(): void;
  getSessionToken(): string;
  setSessionToken(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): SessionRequest.AsObject;
  static toObject(includeInstance: boolean, msg: SessionRequest): SessionRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: SessionRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): SessionRequest;
  static deserializeBinaryFromReader(message: SessionRequest, reader: jspb.BinaryReader): SessionRequest;
}

export namespace SessionRequest {
  export type AsObject = {
    requestType: SessionRequestTypeMap[keyof SessionRequestTypeMap],
    takId: string,
    robotId: string,
    sequenceNumber: number,
    sessionToken: string,
  }
}

export interface SessionRequestTypeMap {
  SESSION_REQUEST_TYPE_UNSPECIFIED: 0;
  SESSION_REQUEST_TYPE_START: 1;
  SESSION_REQUEST_TYPE_KEEP: 2;
  SESSION_REQUEST_TYPE_TERMINATE: 3;
}

export const SessionRequestType: SessionRequestTypeMap;

