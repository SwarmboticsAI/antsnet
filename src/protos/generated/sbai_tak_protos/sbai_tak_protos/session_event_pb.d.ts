// package: sbai_tak_protos
// file: sbai_tak_protos/sbai_tak_protos/session_event.proto

import * as jspb from "google-protobuf";

export class SessionEvent extends jspb.Message {
  getTakId(): string;
  setTakId(value: string): void;

  getRobotId(): string;
  setRobotId(value: string): void;

  hasSessionToken(): boolean;
  clearSessionToken(): void;
  getSessionToken(): string;
  setSessionToken(value: string): void;

  getEventType(): SessionEventTypeMap[keyof SessionEventTypeMap];
  setEventType(value: SessionEventTypeMap[keyof SessionEventTypeMap]): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): SessionEvent.AsObject;
  static toObject(includeInstance: boolean, msg: SessionEvent): SessionEvent.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: SessionEvent, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): SessionEvent;
  static deserializeBinaryFromReader(message: SessionEvent, reader: jspb.BinaryReader): SessionEvent;
}

export namespace SessionEvent {
  export type AsObject = {
    takId: string,
    robotId: string,
    sessionToken: string,
    eventType: SessionEventTypeMap[keyof SessionEventTypeMap],
  }
}

export interface SessionEventTypeMap {
  SESSION_EVENT_TYPE_UNSPECIFIED: 0;
  SESSION_EVENT_TYPE_SESSION_STARTED: 1;
  SESSION_EVENT_TYPE_REQUEST_REJECTED: 2;
  SESSION_EVENT_TYPE_SESSION_TERMINATED: 3;
}

export const SessionEventType: SessionEventTypeMap;

