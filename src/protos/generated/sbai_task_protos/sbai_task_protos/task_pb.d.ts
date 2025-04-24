/* eslint-disable @typescript-eslint/no-empty-object-type */

// package: sbai_task_protos
// file: sbai_task_protos/sbai_task_protos/task.proto

import * as jspb from "google-protobuf";
import * as sbai_geometry_protos_pose_stamped_pb from "../../sbai_geometry_protos/pose_stamped_pb";

export class Constraint extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Constraint.AsObject;
  static toObject(
    includeInstance: boolean,
    msg: Constraint
  ): Constraint.AsObject;
  static extensions: { [key: number]: jspb.ExtensionFieldInfo<jspb.Message> };
  static extensionsBinary: {
    [key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>;
  };
  static serializeBinaryToWriter(
    message: Constraint,
    writer: jspb.BinaryWriter
  ): void;
  static deserializeBinary(bytes: Uint8Array): Constraint;
  static deserializeBinaryFromReader(
    message: Constraint,
    reader: jspb.BinaryReader
  ): Constraint;
}

export namespace Constraint {
  export type AsObject = {};
}

export class NavigationTask extends jspb.Message {
  hasGoal(): boolean;
  clearGoal(): void;
  getGoal(): sbai_geometry_protos_pose_stamped_pb.PoseStamped | undefined;
  setGoal(value?: sbai_geometry_protos_pose_stamped_pb.PoseStamped): void;

  hasConstraint(): boolean;
  clearConstraint(): void;
  getConstraint(): Constraint | undefined;
  setConstraint(value?: Constraint): void;

  clearRouteList(): void;
  getRouteList(): Array<sbai_geometry_protos_pose_stamped_pb.PoseStamped>;
  setRouteList(
    value: Array<sbai_geometry_protos_pose_stamped_pb.PoseStamped>
  ): void;
  addRoute(
    value?: sbai_geometry_protos_pose_stamped_pb.PoseStamped,
    index?: number
  ): sbai_geometry_protos_pose_stamped_pb.PoseStamped;

  hasXyGoalToleranceM(): boolean;
  clearXyGoalToleranceM(): void;
  getXyGoalToleranceM(): number;
  setXyGoalToleranceM(value: number): void;

  hasYawGoalToleranceRad(): boolean;
  clearYawGoalToleranceRad(): void;
  getYawGoalToleranceRad(): number;
  setYawGoalToleranceRad(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): NavigationTask.AsObject;
  static toObject(
    includeInstance: boolean,
    msg: NavigationTask
  ): NavigationTask.AsObject;
  static extensions: { [key: number]: jspb.ExtensionFieldInfo<jspb.Message> };
  static extensionsBinary: {
    [key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>;
  };
  static serializeBinaryToWriter(
    message: NavigationTask,
    writer: jspb.BinaryWriter
  ): void;
  static deserializeBinary(bytes: Uint8Array): NavigationTask;
  static deserializeBinaryFromReader(
    message: NavigationTask,
    reader: jspb.BinaryReader
  ): NavigationTask;
}

export namespace NavigationTask {
  export type AsObject = {
    goal?: sbai_geometry_protos_pose_stamped_pb.PoseStamped.AsObject;
    constraint?: Constraint.AsObject;
    routeList: Array<sbai_geometry_protos_pose_stamped_pb.PoseStamped.AsObject>;
    xyGoalToleranceM: number;
    yawGoalToleranceRad: number;
  };
}

export class AssignmentTask extends jspb.Message {
  clearParticipatingRobotIdsList(): void;
  getParticipatingRobotIdsList(): Array<string>;
  setParticipatingRobotIdsList(value: Array<string>): void;
  addParticipatingRobotIds(value: string, index?: number): string;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): AssignmentTask.AsObject;
  static toObject(
    includeInstance: boolean,
    msg: AssignmentTask
  ): AssignmentTask.AsObject;
  static extensions: { [key: number]: jspb.ExtensionFieldInfo<jspb.Message> };
  static extensionsBinary: {
    [key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>;
  };
  static serializeBinaryToWriter(
    message: AssignmentTask,
    writer: jspb.BinaryWriter
  ): void;
  static deserializeBinary(bytes: Uint8Array): AssignmentTask;
  static deserializeBinaryFromReader(
    message: AssignmentTask,
    reader: jspb.BinaryReader
  ): AssignmentTask;
}

export namespace AssignmentTask {
  export type AsObject = {
    participatingRobotIdsList: Array<string>;
  };
}

export class Task extends jspb.Message {
  getBehaviorId(): string;
  setBehaviorId(value: string): void;

  getTaskId(): number;
  setTaskId(value: number): void;

  getTaskType(): TaskTypeMap[keyof TaskTypeMap];
  setTaskType(value: TaskTypeMap[keyof TaskTypeMap]): void;

  clearSubTasksList(): void;
  getSubTasksList(): Array<Task>;
  setSubTasksList(value: Array<Task>): void;
  addSubTasks(value?: Task, index?: number): Task;

  hasNavigationTask(): boolean;
  clearNavigationTask(): void;
  getNavigationTask(): NavigationTask | undefined;
  setNavigationTask(value?: NavigationTask): void;

  hasAssignmentTask(): boolean;
  clearAssignmentTask(): void;
  getAssignmentTask(): AssignmentTask | undefined;
  setAssignmentTask(value?: AssignmentTask): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Task.AsObject;
  static toObject(includeInstance: boolean, msg: Task): Task.AsObject;
  static extensions: { [key: number]: jspb.ExtensionFieldInfo<jspb.Message> };
  static extensionsBinary: {
    [key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>;
  };
  static serializeBinaryToWriter(
    message: Task,
    writer: jspb.BinaryWriter
  ): void;
  static deserializeBinary(bytes: Uint8Array): Task;
  static deserializeBinaryFromReader(
    message: Task,
    reader: jspb.BinaryReader
  ): Task;
}

export namespace Task {
  export type AsObject = {
    behaviorId: string;
    taskId: number;
    taskType: TaskTypeMap[keyof TaskTypeMap];
    subTasksList: Array<Task.AsObject>;
    navigationTask?: NavigationTask.AsObject;
    assignmentTask?: AssignmentTask.AsObject;
  };
}

export interface TaskTypeMap {
  TASK_TYPE_UNSPECIFIED: 0;
  TASK_TYPE_COMPOSITE: 1;
  TASK_TYPE_PERFORM_ASSIGNMENT: 2;
  TASK_TYPE_FREE_SPACE_NAVIGATE_TO_POSE: 3;
  TASK_TYPE_FOLLOW_ROUTE_TO_POSE: 4;
  TASK_TYPE_WAIT_FOR_INTERVENTION: 5;
  TASK_TYPE_REPEAT_TASK: 6;
}

export const TaskType: TaskTypeMap;
