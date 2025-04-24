// package: sbai_task_assignment_protos
// file: sbai_task_assignment_protos/sbai_task_assignment_protos/cbba_consensus_data.proto

import * as jspb from "google-protobuf";
import * as sbai_task_assignment_protos_update_iteration_pb from "../../sbai_task_assignment_protos/update_iteration_pb";
import * as sbai_task_assignment_protos_winning_agent_pb from "../../sbai_task_assignment_protos/winning_agent_pb";
import * as sbai_task_assignment_protos_winning_bid_pb from "../../sbai_task_assignment_protos/winning_bid_pb";

export class CBBAConsensusData extends jspb.Message {
  clearWinningBidsListList(): void;
  getWinningBidsListList(): Array<sbai_task_assignment_protos_winning_bid_pb.WinningBid>;
  setWinningBidsListList(value: Array<sbai_task_assignment_protos_winning_bid_pb.WinningBid>): void;
  addWinningBidsList(value?: sbai_task_assignment_protos_winning_bid_pb.WinningBid, index?: number): sbai_task_assignment_protos_winning_bid_pb.WinningBid;

  clearWinningAgentsListList(): void;
  getWinningAgentsListList(): Array<sbai_task_assignment_protos_winning_agent_pb.WinningAgent>;
  setWinningAgentsListList(value: Array<sbai_task_assignment_protos_winning_agent_pb.WinningAgent>): void;
  addWinningAgentsList(value?: sbai_task_assignment_protos_winning_agent_pb.WinningAgent, index?: number): sbai_task_assignment_protos_winning_agent_pb.WinningAgent;

  clearTimeStampListList(): void;
  getTimeStampListList(): Array<sbai_task_assignment_protos_update_iteration_pb.UpdateIteration>;
  setTimeStampListList(value: Array<sbai_task_assignment_protos_update_iteration_pb.UpdateIteration>): void;
  addTimeStampList(value?: sbai_task_assignment_protos_update_iteration_pb.UpdateIteration, index?: number): sbai_task_assignment_protos_update_iteration_pb.UpdateIteration;

  getBelievesConverged(): boolean;
  setBelievesConverged(value: boolean): void;

  getBehaviorRequestId(): string;
  setBehaviorRequestId(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): CBBAConsensusData.AsObject;
  static toObject(includeInstance: boolean, msg: CBBAConsensusData): CBBAConsensusData.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: CBBAConsensusData, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): CBBAConsensusData;
  static deserializeBinaryFromReader(message: CBBAConsensusData, reader: jspb.BinaryReader): CBBAConsensusData;
}

export namespace CBBAConsensusData {
  export type AsObject = {
    winningBidsListList: Array<sbai_task_assignment_protos_winning_bid_pb.WinningBid.AsObject>,
    winningAgentsListList: Array<sbai_task_assignment_protos_winning_agent_pb.WinningAgent.AsObject>,
    timeStampListList: Array<sbai_task_assignment_protos_update_iteration_pb.UpdateIteration.AsObject>,
    believesConverged: boolean,
    behaviorRequestId: string,
  }
}

