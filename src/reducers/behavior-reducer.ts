export enum BehaviorStatusUI {
  UNSPECIFIED = "unspecified",
  ACCEPTED = "accepted",
  ACTIVE = "active",
  COMPLETED = "completed",
  FAILED = "failed",
  CANCELED = "cancelled",
}

export interface RobotBehaviorStatus {
  robotId: string;
  status: BehaviorStatusUI;
  lastUpdate: Date;
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

export const initialBehaviorState: BehaviorState = {
  behaviors: {},
  activeBehaviorId: null,
  lastUpdate: Date.now(),
};

export type BehaviorAction =
  | { type: "REGISTER_BEHAVIOR"; behavior: BehaviorInfo }
  | { type: "SET_ACTIVE_BEHAVIOR"; behaviorId: string | null }
  | {
      type: "UPDATE_STATUS";
      behaviorId: string;
      robotId: string;
      status: BehaviorStatusUI;
    }
  | {
      type: "UPDATE_PATH";
      behaviorId: string;
      robotId: string;
      path: RobotPath;
    }
  | { type: "CANCEL_BEHAVIOR"; behaviorId: string }
  | { type: "FAIL_BEHAVIOR"; behaviorId: string }
  | { type: "SET_ALL"; state: BehaviorState };

export function behaviorReducer(
  state: BehaviorState,
  action: BehaviorAction
): BehaviorState {
  switch (action.type) {
    case "REGISTER_BEHAVIOR": {
      return {
        ...state,
        behaviors: {
          ...state.behaviors,
          [action.behavior.behaviorId]: action.behavior,
        },
        activeBehaviorId: action.behavior.behaviorId,
        lastUpdate: Date.now(),
      };
    }
    case "SET_ACTIVE_BEHAVIOR": {
      return {
        ...state,
        activeBehaviorId: action.behaviorId,
        lastUpdate: Date.now(),
      };
    }
    case "UPDATE_STATUS": {
      const behavior = state.behaviors[action.behaviorId];
      if (!behavior) return state;

      const updatedRobotStatuses = {
        ...behavior.robotStatuses,
        [action.robotId]: {
          robotId: action.robotId,
          status: action.status,
          lastUpdate: new Date(),
        },
      };

      const robotIds = behavior.robotIds;

      // Extract current statuses for ONLY the robots involved in this behavior
      const statuses = robotIds.map((id) => updatedRobotStatuses[id]?.status);

      // Optional: If any status is still undefined, skip updating overall status
      const anyMissing = statuses.some((s) => s === undefined);
      if (anyMissing) {
        return {
          ...state,
          behaviors: {
            ...state.behaviors,
            [action.behaviorId]: {
              ...behavior,
              robotStatuses: updatedRobotStatuses,
            },
          },
          lastUpdate: Date.now(),
        };
      }

      // Derive new overall status from per-robot statuses
      const newOverallStatus = statuses.every(
        (s) => s === BehaviorStatusUI.COMPLETED
      )
        ? BehaviorStatusUI.COMPLETED
        : statuses.some((s) => s === BehaviorStatusUI.FAILED)
        ? BehaviorStatusUI.FAILED
        : statuses.some((s) => s === BehaviorStatusUI.CANCELED)
        ? BehaviorStatusUI.CANCELED
        : statuses.some((s) => s === BehaviorStatusUI.ACTIVE)
        ? BehaviorStatusUI.ACTIVE
        : statuses.every((s) => s === BehaviorStatusUI.ACCEPTED)
        ? BehaviorStatusUI.ACCEPTED
        : BehaviorStatusUI.UNSPECIFIED;

      return {
        ...state,
        behaviors: {
          ...state.behaviors,
          [action.behaviorId]: {
            ...behavior,
            robotStatuses: updatedRobotStatuses,
            status: newOverallStatus,
          },
        },
        lastUpdate: Date.now(),
      };
    }

    case "UPDATE_PATH": {
      const behavior = state.behaviors[action.behaviorId];
      if (!behavior) return state;

      return {
        ...state,
        behaviors: {
          ...state.behaviors,
          [action.behaviorId]: {
            ...behavior,
            robotPaths: {
              ...behavior.robotPaths,
              [action.robotId]: action.path,
            },
          },
        },
        lastUpdate: Date.now(),
      };
    }
    case "CANCEL_BEHAVIOR": {
      const behavior = state.behaviors[action.behaviorId];
      if (!behavior) return state;

      const updatedStatuses = { ...behavior.robotStatuses };
      for (const robotId of behavior.robotIds) {
        updatedStatuses[robotId] = {
          ...updatedStatuses[robotId],
          status: BehaviorStatusUI.CANCELED,
          lastUpdate: new Date(),
        };
      }

      return {
        ...state,
        behaviors: {
          ...state.behaviors,
          [action.behaviorId]: {
            ...behavior,
            status: BehaviorStatusUI.CANCELED,
            robotStatuses: updatedStatuses,
          },
        },
        activeBehaviorId:
          state.activeBehaviorId === action.behaviorId
            ? null
            : state.activeBehaviorId,
        lastUpdate: Date.now(),
      };
    }
    case "FAIL_BEHAVIOR": {
      const behavior = state.behaviors[action.behaviorId];
      if (!behavior) return state;

      return {
        ...state,
        behaviors: {
          ...state.behaviors,
          [action.behaviorId]: {
            ...behavior,
            status: BehaviorStatusUI.FAILED,
          },
        },
        lastUpdate: Date.now(),
      };
    }
    case "SET_ALL": {
      return action.state;
    }
    default:
      return state;
  }
}
