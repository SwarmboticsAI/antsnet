// package: sbai_system_alert_protos
// file: sbai_system_alert_protos/sbai_system_alert_protos/aggregated_table.proto

import * as jspb from "google-protobuf";

export class AggregatedTable extends jspb.Message {
  getRobotId(): string;
  setRobotId(value: string): void;

  getTableMap(): jspb.Map<string, Uint8Array | string>;
  clearTableMap(): void;
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): AggregatedTable.AsObject;
  static toObject(includeInstance: boolean, msg: AggregatedTable): AggregatedTable.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: AggregatedTable, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): AggregatedTable;
  static deserializeBinaryFromReader(message: AggregatedTable, reader: jspb.BinaryReader): AggregatedTable;
}

export namespace AggregatedTable {
  export type AsObject = {
    robotId: string,
    tableMap: Array<[string, Uint8Array | string]>,
  }
}

