// package: sbai_behavior_protos
// file: sbai_behavior_protos/sbai_behavior_protos/behavior_request.proto

import * as jspb from "google-protobuf";
import * as google_protobuf_any_pb from "google-protobuf/google/protobuf/any_pb";
import * as sbai_geographic_protos_geo_point_pb from "../../sbai_geographic_protos/geo_point_pb";
import * as sbai_std_protos_string_pb from "../../sbai_std_protos/string_pb";

export class BehaviorRequest extends jspb.Message {
  getRequestedBehavior(): BehaviorMap[keyof BehaviorMap];
  setRequestedBehavior(value: BehaviorMap[keyof BehaviorMap]): void;

  getBehaviorRequestId(): string;
  setBehaviorRequestId(value: string): void;

  clearParticipatingRobotIdsList(): void;
  getParticipatingRobotIdsList(): Array<sbai_std_protos_string_pb.String>;
  setParticipatingRobotIdsList(value: Array<sbai_std_protos_string_pb.String>): void;
  addParticipatingRobotIds(value?: sbai_std_protos_string_pb.String, index?: number): sbai_std_protos_string_pb.String;

  clearGeoPointsList(): void;
  getGeoPointsList(): Array<sbai_geographic_protos_geo_point_pb.GeoPoint>;
  setGeoPointsList(value: Array<sbai_geographic_protos_geo_point_pb.GeoPoint>): void;
  addGeoPoints(value?: sbai_geographic_protos_geo_point_pb.GeoPoint, index?: number): sbai_geographic_protos_geo_point_pb.GeoPoint;

  hasBehaviorParams(): boolean;
  clearBehaviorParams(): void;
  getBehaviorParams(): google_protobuf_any_pb.Any | undefined;
  setBehaviorParams(value?: google_protobuf_any_pb.Any): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): BehaviorRequest.AsObject;
  static toObject(includeInstance: boolean, msg: BehaviorRequest): BehaviorRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: BehaviorRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): BehaviorRequest;
  static deserializeBinaryFromReader(message: BehaviorRequest, reader: jspb.BinaryReader): BehaviorRequest;
}

export namespace BehaviorRequest {
  export type AsObject = {
    requestedBehavior: BehaviorMap[keyof BehaviorMap],
    behaviorRequestId: string,
    participatingRobotIdsList: Array<sbai_std_protos_string_pb.String.AsObject>,
    geoPointsList: Array<sbai_geographic_protos_geo_point_pb.GeoPoint.AsObject>,
    behaviorParams?: google_protobuf_any_pb.Any.AsObject,
  }
}

export interface BehaviorMap {
  BEHAVIOR_UNSPECIFIED: 0;
  BEHAVIOR_SURROUND: 1;
  BEHAVIOR_RALLY: 2;
  BEHAVIOR_DEFEND: 3;
  BEHAVIOR_LINE_FORMATION: 4;
  BEHAVIOR_RAPTOR: 5;
  BEHAVIOR_MULTI_WAYPOINT_NAVIGATION: 6;
  BEHAVIOR_AREA_COVERAGE: 7;
  BEHAVIOR_PATROL: 8;
}

export const Behavior: BehaviorMap;

