// package: sbai_behavior_protos
// file: sbai_behavior_protos/sbai_behavior_protos/phase_execution_request.proto

import * as jspb from "google-protobuf";

export class PhaseExecutionRequest extends jspb.Message {
  getShouldExecuteNextPhase(): boolean;
  setShouldExecuteNextPhase(value: boolean): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): PhaseExecutionRequest.AsObject;
  static toObject(includeInstance: boolean, msg: PhaseExecutionRequest): PhaseExecutionRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: PhaseExecutionRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): PhaseExecutionRequest;
  static deserializeBinaryFromReader(message: PhaseExecutionRequest, reader: jspb.BinaryReader): PhaseExecutionRequest;
}

export namespace PhaseExecutionRequest {
  export type AsObject = {
    shouldExecuteNextPhase: boolean,
  }
}

