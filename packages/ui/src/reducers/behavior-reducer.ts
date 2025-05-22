import { BehaviorResult } from "@swarmbotics/protos/ros2_interfaces/sbai_behavior_protos/sbai_behavior_protos/completed_behaviors";
import { ActiveBehaviorStatus } from "@swarmbotics/protos/ros2_interfaces/sbai_behavior_protos/sbai_behavior_protos/active_behavior_states";

import {
  BehaviorStatusUI,
  type BehaviorInfo,
  type BehaviorState,
  type RobotPath,
} from "@/types/behavior";

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
      type: "UPDATE_ROBOT_STATUS";
      behaviorId: string;
      robotId: string;
      status: BehaviorStatusUI;
      iteration?: number;
      navigationStatus?: number;
    }
  | {
      type: "UPDATE_BEHAVIOR_STATUS";
      behaviorId: string;
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
  | { type: "COMPLETE_BEHAVIOR"; behaviorId: string }
  | { type: "QUEUE_BEHAVIOR"; behaviorId: string }
  | { type: "SET_ALL"; state: BehaviorState };

// Helper function to derive overall behavior status from robot statuses
function deriveBehaviorStatus(behavior: BehaviorInfo): BehaviorStatusUI {
  const robotIds = behavior.robotIds;
  const statuses = robotIds
    .map((id) => behavior.robotStatuses[id]?.status)
    .filter(Boolean);

  if (statuses.length === 0) {
    return behavior.status;
  }

  if (statuses.every((s) => s === BehaviorStatusUI.COMPLETED)) {
    return BehaviorStatusUI.COMPLETED;
  }

  if (statuses.some((s) => s === BehaviorStatusUI.NEEDS_INTERVENTION)) {
    return BehaviorStatusUI.NEEDS_INTERVENTION;
  }

  if (statuses.some((s) => s === BehaviorStatusUI.FAILED)) {
    return BehaviorStatusUI.FAILED;
  }

  if (statuses.some((s) => s === BehaviorStatusUI.CANCELED)) {
    return BehaviorStatusUI.CANCELED;
  }

  if (statuses.some((s) => s === BehaviorStatusUI.PAUSED)) {
    return BehaviorStatusUI.PAUSED;
  }

  if (
    statuses.some(
      (s) => s === BehaviorStatusUI.ACTIVE || s === BehaviorStatusUI.ACCEPTED
    )
  ) {
    return BehaviorStatusUI.ACTIVE;
  }

  return BehaviorStatusUI.ACTIVE;
}

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

      // Short-circuit: if behavior is already COMPLETED, FAILED, or CANCELED,
      // don't allow changes to individual robot status (unless it's COMPLETED)
      if (
        (behavior.status === BehaviorStatusUI.COMPLETED ||
          behavior.status === BehaviorStatusUI.FAILED ||
          behavior.status === BehaviorStatusUI.CANCELED) &&
        action.status !== BehaviorStatusUI.COMPLETED
      ) {
        return state;
      }

      const updatedRobotStatuses = {
        ...behavior.robotStatuses,
        [action.robotId]: {
          ...behavior.robotStatuses[action.robotId],
          robotId: action.robotId,
          status: action.status,
          lastUpdate: new Date(),
        },
      };

      const updatedBehavior = {
        ...behavior,
        robotStatuses: updatedRobotStatuses,
      };

      // Special handling: if this robot is marking as COMPLETED, mark the behavior as COMPLETED
      if (action.status === BehaviorStatusUI.COMPLETED) {
        updatedBehavior.status = BehaviorStatusUI.COMPLETED;
      } else {
        updatedBehavior.status = deriveBehaviorStatus(updatedBehavior);
      }

      return {
        ...state,
        behaviors: {
          ...state.behaviors,
          [action.behaviorId]: updatedBehavior,
        },
        lastUpdate: Date.now(),
      };
    }
    case "UPDATE_ROBOT_STATUS": {
      const behavior = state.behaviors[action.behaviorId];
      if (!behavior) return state;

      // Fix: Add the same short-circuit as above
      if (
        (behavior.status === BehaviorStatusUI.COMPLETED ||
          behavior.status === BehaviorStatusUI.FAILED ||
          behavior.status === BehaviorStatusUI.CANCELED) &&
        action.status !== BehaviorStatusUI.COMPLETED
      ) {
        return state;
      }

      const updatedRobotStatuses = {
        ...behavior.robotStatuses,
        [action.robotId]: {
          ...behavior.robotStatuses[action.robotId],
          robotId: action.robotId,
          status: action.status,
          lastUpdate: new Date(),
          iteration:
            action.iteration !== undefined
              ? action.iteration
              : behavior.robotStatuses[action.robotId]?.iteration,
          navigationStatus:
            action.navigationStatus !== undefined
              ? action.navigationStatus
              : behavior.robotStatuses[action.robotId]?.navigationStatus,
        },
      };

      const updatedBehavior = {
        ...behavior,
        robotStatuses: updatedRobotStatuses,
      };

      updatedBehavior.status = deriveBehaviorStatus(updatedBehavior);

      // Fix: Re-enable the behavior update in state
      return {
        ...state,
        behaviors: {
          ...state.behaviors,
          [action.behaviorId]: updatedBehavior,
        },
        lastUpdate: Date.now(),
      };
    }
    case "UPDATE_BEHAVIOR_STATUS": {
      const behavior = state.behaviors[action.behaviorId];
      if (!behavior) return state;

      return {
        ...state,
        behaviors: {
          ...state.behaviors,
          [action.behaviorId]: {
            ...behavior,
            status: action.status,
          },
        },
        lastUpdate: Date.now(),
      };
    }
    case "COMPLETE_BEHAVIOR": {
      const behavior = state.behaviors[action.behaviorId];
      if (!behavior) return state;

      // Mark all robots as completed
      const updatedStatuses = { ...behavior.robotStatuses };
      for (const robotId of behavior.robotIds) {
        updatedStatuses[robotId] = {
          ...updatedStatuses[robotId],
          robotId: robotId,
          status: BehaviorStatusUI.COMPLETED,
          lastUpdate: new Date(),
        };
      }

      return {
        ...state,
        behaviors: {
          ...state.behaviors,
          [action.behaviorId]: {
            ...behavior,
            status: BehaviorStatusUI.COMPLETED,
            robotStatuses: updatedStatuses,
          },
        },
        lastUpdate: Date.now(),
      };
    }
    case "QUEUE_BEHAVIOR": {
      const behavior = state.behaviors[action.behaviorId];
      if (!behavior) return state;

      // Mark all robots as queued
      const updatedStatuses = { ...behavior.robotStatuses };
      for (const robotId of behavior.robotIds) {
        updatedStatuses[robotId] = {
          ...updatedStatuses[robotId],
          robotId: robotId,
          status: BehaviorStatusUI.QUEUED,
          lastUpdate: new Date(),
        };
      }

      return {
        ...state,
        behaviors: {
          ...state.behaviors,
          [action.behaviorId]: {
            ...behavior,
            status: BehaviorStatusUI.QUEUED,
            robotStatuses: updatedStatuses,
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
          robotId: robotId,
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

      const updatedStatuses = { ...behavior.robotStatuses };
      for (const robotId of behavior.robotIds) {
        updatedStatuses[robotId] = {
          ...updatedStatuses[robotId],
          robotId: robotId,
          status: BehaviorStatusUI.FAILED,
          lastUpdate: new Date(),
        };
      }

      return {
        ...state,
        behaviors: {
          ...state.behaviors,
          [action.behaviorId]: {
            ...behavior,
            status: BehaviorStatusUI.FAILED,
            robotStatuses: updatedStatuses,
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

// Helper functions to convert between proto statuses and UI statuses
export function mapActiveBehaviorStatus(
  status: ActiveBehaviorStatus
): BehaviorStatusUI {
  switch (status) {
    case ActiveBehaviorStatus.ACTIVE_BEHAVIOR_STATUS_RUNNING:
      return BehaviorStatusUI.ACTIVE;
    case ActiveBehaviorStatus.ACTIVE_BEHAVIOR_STATUS_PAUSED:
      return BehaviorStatusUI.PAUSED;
    case ActiveBehaviorStatus.ACTIVE_BEHAVIOR_STATUS_PAUSED_NEEDS_INTERVENTION:
      return BehaviorStatusUI.NEEDS_INTERVENTION;
    default:
      return BehaviorStatusUI.UNSPECIFIED;
  }
}

export function mapBehaviorResult(result: BehaviorResult): BehaviorStatusUI {
  switch (result) {
    case BehaviorResult.BEHAVIOR_RESULT_SUCCESS:
      return BehaviorStatusUI.COMPLETED;
    case BehaviorResult.BEHAVIOR_RESULT_FAILED:
      return BehaviorStatusUI.FAILED;
    case BehaviorResult.BEHAVIOR_RESULT_CANCELED:
      return BehaviorStatusUI.CANCELED;
    default:
      return BehaviorStatusUI.UNSPECIFIED;
  }
}
