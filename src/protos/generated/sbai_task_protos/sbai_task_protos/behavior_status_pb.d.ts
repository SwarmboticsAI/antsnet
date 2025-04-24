// package: sbai_task_protos
// file: sbai_task_protos/sbai_task_protos/behavior_status.proto

import * as jspb from "google-protobuf";

export class BehaviorStatus extends jspb.Message {
  getBehaviorState(): BehaviorStateMap[keyof BehaviorStateMap];
  setBehaviorState(value: BehaviorStateMap[keyof BehaviorStateMap]): void;

  getBehaviorId(): string;
  setBehaviorId(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): BehaviorStatus.AsObject;
  static toObject(includeInstance: boolean, msg: BehaviorStatus): BehaviorStatus.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: BehaviorStatus, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): BehaviorStatus;
  static deserializeBinaryFromReader(message: BehaviorStatus, reader: jspb.BinaryReader): BehaviorStatus;
}

export namespace BehaviorStatus {
  export type AsObject = {
    behaviorState: BehaviorStateMap[keyof BehaviorStateMap],
    behaviorId: string,
  }
}

export interface BehaviorStateMap {
  BEHAVIOR_STATE_UNSPECIFIED: 0;
  BEHAVIOR_STATE_ACCEPTED: 1;
  BEHAVIOR_STATE_ACTIVE: 2;
  BEHAVIOR_STATE_COMPLETED: 3;
  BEHAVIOR_STATE_FAILED: 4;
  BEHAVIOR_STATE_CANCELED: 5;
}

export const BehaviorState: BehaviorStateMap;

