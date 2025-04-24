// package: sbai_task_assignment_protos
// file: sbai_task_assignment_protos/sbai_task_assignment_protos/update_iteration.proto

import * as jspb from "google-protobuf";

export class UpdateIteration extends jspb.Message {
  getRobotId(): string;
  setRobotId(value: string): void;

  getUpdateIteration(): number;
  setUpdateIteration(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): UpdateIteration.AsObject;
  static toObject(includeInstance: boolean, msg: UpdateIteration): UpdateIteration.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: UpdateIteration, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): UpdateIteration;
  static deserializeBinaryFromReader(message: UpdateIteration, reader: jspb.BinaryReader): UpdateIteration;
}

export namespace UpdateIteration {
  export type AsObject = {
    robotId: string,
    updateIteration: number,
  }
}

