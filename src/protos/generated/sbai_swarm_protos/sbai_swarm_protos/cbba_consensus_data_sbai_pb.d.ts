// package: sbai_swarm_protos
// file: sbai_swarm_protos/sbai_swarm_protos/cbba_consensus_data_sbai.proto

import * as jspb from "google-protobuf";
import * as sbai_std_protos_string_pb from "../../sbai_std_protos/string_pb";
import * as sbai_task_assignment_protos_cbba_consensus_data_pb from "../../sbai_task_assignment_protos/cbba_consensus_data_pb";

export class CBBAConsensusDataSBAI extends jspb.Message {
  hasRobotId(): boolean;
  clearRobotId(): void;
  getRobotId(): sbai_std_protos_string_pb.String | undefined;
  setRobotId(value?: sbai_std_protos_string_pb.String): void;

  hasData(): boolean;
  clearData(): void;
  getData(): sbai_task_assignment_protos_cbba_consensus_data_pb.CBBAConsensusData | undefined;
  setData(value?: sbai_task_assignment_protos_cbba_consensus_data_pb.CBBAConsensusData): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): CBBAConsensusDataSBAI.AsObject;
  static toObject(includeInstance: boolean, msg: CBBAConsensusDataSBAI): CBBAConsensusDataSBAI.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: CBBAConsensusDataSBAI, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): CBBAConsensusDataSBAI;
  static deserializeBinaryFromReader(message: CBBAConsensusDataSBAI, reader: jspb.BinaryReader): CBBAConsensusDataSBAI;
}

export namespace CBBAConsensusDataSBAI {
  export type AsObject = {
    robotId?: sbai_std_protos_string_pb.String.AsObject,
    data?: sbai_task_assignment_protos_cbba_consensus_data_pb.CBBAConsensusData.AsObject,
  }
}

