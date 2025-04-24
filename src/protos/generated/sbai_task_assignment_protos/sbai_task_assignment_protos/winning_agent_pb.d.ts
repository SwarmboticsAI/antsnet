// package: sbai_task_assignment_protos
// file: sbai_task_assignment_protos/sbai_task_assignment_protos/winning_agent.proto

import * as jspb from "google-protobuf";

export class WinningAgent extends jspb.Message {
  getTaskId(): number;
  setTaskId(value: number): void;

  getRobotId(): string;
  setRobotId(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): WinningAgent.AsObject;
  static toObject(includeInstance: boolean, msg: WinningAgent): WinningAgent.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: WinningAgent, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): WinningAgent;
  static deserializeBinaryFromReader(message: WinningAgent, reader: jspb.BinaryReader): WinningAgent;
}

export namespace WinningAgent {
  export type AsObject = {
    taskId: number,
    robotId: string,
  }
}

