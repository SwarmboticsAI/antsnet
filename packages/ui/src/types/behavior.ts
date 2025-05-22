import { Behavior } from "@swarmbotics/protos/ros2_interfaces/sbai_behavior_protos/sbai_behavior_protos/behavior_request";

export enum BehaviorResult {
  BEHAVIOR_RESULT_UNSPECIFIED = 0,
  BEHAVIOR_RESULT_SUCCESS = 1,
  BEHAVIOR_RESULT_FAILED = 2,
  BEHAVIOR_RESULT_CANCELED = 3,
  UNRECOGNIZED = -1,
}

export interface CompletedBehavior {
  result: BehaviorResult;
  request: BehaviorRequest | undefined;
}

export interface CompletedBehaviors {
  /** Behavior Request ID <-> Completed Behavior */
  completedBehaviors: { [key: string]: CompletedBehavior };
}

export interface BehaviorRequestQueue {
  requests: BehaviorRequest[];
}

export type GeoPoint = {
  latitude: number;
  longitude: number;
  altitude?: number;
};

export interface BehaviorRequest {
  requestedBehavior: Behavior;
  behaviorRequestId: string;
  participatingRobotIds: String[];
  geoPoints: GeoPoint[];
  behaviorParams: undefined;
}

export interface ActiveBehaviorState {
  status: ActiveBehaviorStatus;
  activeBehavior: BehaviorRequest | undefined;
}

export interface ActiveBehaviorStates {
  states: { [key: string]: ActiveBehaviorState };
}

export enum ActiveBehaviorStatus {
  ACTIVE_BEHAVIOR_STATUS_UNSPECIFIED = 0,
  ACTIVE_BEHAVIOR_STATUS_RUNNING = 1,
  ACTIVE_BEHAVIOR_STATUS_PAUSED = 2,
  ACTIVE_BEHAVIOR_STATUS_PAUSED_NEEDS_INTERVENTION = 3,
  UNRECOGNIZED = -1,
}

export interface BehaviorParams {
  geoPoints?: [number, number][];
  laneWidthM?: number;
  defendRadiusM?: number;
  separationDistanceM?: number;
  lineYawDeg?: number;
  robotYawDeg?: number;
  desiredFinalYawDeg?: number;
  rallyRadiusM?: number;
  outerRadius?: number;
  innerRadius?: number;
  surroundRadiusM?: number;
}

export enum BehaviorStatusUI {
  UNSPECIFIED = "unspecified",
  PENDING = "pending",
  QUEUED = "queued",
  ACCEPTED = "accepted",
  ACTIVE = "active",
  COMPLETED = "completed",
  FAILED = "failed",
  CANCELED = "cancelled",
  PAUSED = "paused",
  NEEDS_INTERVENTION = "needs_intervention",
}

export interface RobotBehaviorStatus {
  robotId: string;
  status: BehaviorStatusUI;
  lastUpdate: Date;
  iteration?: number;
  navigationStatus?: number;
}

export interface PathPoint {
  lat: number;
  lng: number;
  altitude?: number;
  timestamp?: Date;
}

export interface RobotPath {
  robotId: string;
  path: PathPoint[];
  lastUpdate: Date;
}

export interface BehaviorInfo {
  behaviorId: string;
  behaviorType: number;
  robotIds: string[];
  params: Record<string, any>;
  createdAt: Date;
  status: BehaviorStatusUI;
  robotStatuses: Record<string, RobotBehaviorStatus>;
  robotPaths: Record<string, RobotPath>;
}

export interface BehaviorState {
  behaviors: Record<string, BehaviorInfo>;
  activeBehaviorId: string | null;
  lastUpdate: number;
}

export interface BehaviorExecutionState {
  activeBehaviorStates: ActiveBehaviorStates | undefined;
  behaviorRequestQueue: BehaviorRequestQueue | undefined;
  completedBehaviors: CompletedBehaviors | undefined;
}
