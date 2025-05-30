import { create } from "zustand";
import type { BehaviorExecutionState } from "@swarmbotics/protos/ros2_interfaces/sbai_protos/sbai_protos/behavior_execution_state";
import type { ActiveBehaviorStatus } from "@swarmbotics/protos/ros2_interfaces/sbai_protos/sbai_protos/active_behavior_states";
import type { BehaviorRequest } from "@swarmbotics/protos/ros2_interfaces/sbai_protos/sbai_protos/behavior_request";
import type { BehaviorResult } from "@swarmbotics/protos/ros2_interfaces/sbai_protos/sbai_protos/completed_behaviors";

interface RobotBehaviorInfo {
  robotId: string;
  state: "active" | "queued" | "completed";
  status?: ActiveBehaviorStatus;
  result?: BehaviorResult;
  behaviorKey?: string;
}

interface AggregatedBehavior {
  behaviorRequest: BehaviorRequest;
  robots: RobotBehaviorInfo[];
}

interface TaskTablesState {
  taskTables: Record<string, BehaviorExecutionState>;
  setTaskTable: (robotId: string, data: BehaviorExecutionState) => void;
  getTaskTable: (robotId: string) => BehaviorExecutionState | undefined;
  getAggregatedTaskTables: () => Record<string, BehaviorExecutionState>;
  getAggregatedBehaviors: () => Record<string, AggregatedBehavior>;
  getSortedAggregatedBehaviors: () => [string, AggregatedBehavior][];
  resetTaskTable: (robotId: string) => void;
  resetTaskTables: () => void;
}

export const useRobotTaskStore = create<TaskTablesState>((set, get) => ({
  taskTables: {},

  setTaskTable: (robotId, data) =>
    set((state) => ({
      taskTables: { ...state.taskTables, [robotId]: data },
    })),

  getTaskTable: (robotId) => get().taskTables[robotId],

  getAggregatedTaskTables: () => {
    const taskTables = get().taskTables;
    return Object.keys(taskTables).reduce((acc, robotId) => {
      const taskTable = taskTables[robotId];
      if (taskTable !== undefined) {
        acc[robotId] = taskTable;
      }
      return acc;
    }, {} as Record<string, BehaviorExecutionState>);
  },

  getAggregatedBehaviors: () => {
    const taskTables = get().taskTables;
    const behaviorMap: Record<string, AggregatedBehavior> = {};

    Object.entries(taskTables).forEach(([robotId, behaviorExecutionState]) => {
      // Active behaviors
      if (behaviorExecutionState?.activeBehaviorsMap?.states) {
        Object.entries(
          behaviorExecutionState.activeBehaviorsMap.states
        ).forEach(([behaviorKey, activeBehaviorState]) => {
          if (!activeBehaviorState?.activeBehavior) return;

          const behaviorId =
            activeBehaviorState.activeBehavior.behaviorRequestId;
          const robotInfo: RobotBehaviorInfo = {
            robotId,
            state: "active",
            status: activeBehaviorState.status,
            behaviorKey,
          };

          if (behaviorMap[behaviorId]) {
            behaviorMap[behaviorId].robots.push(robotInfo);
          } else {
            behaviorMap[behaviorId] = {
              behaviorRequest: activeBehaviorState.activeBehavior,
              robots: [robotInfo],
            };
          }
        });
      }

      // Queued behaviors
      if (behaviorExecutionState?.behaviorRequestQueue?.requests) {
        behaviorExecutionState.behaviorRequestQueue.requests.forEach(
          (behaviorRequest) => {
            const behaviorId = behaviorRequest.behaviorRequestId;
            const robotInfo: RobotBehaviorInfo = {
              robotId,
              state: "queued",
            };

            if (behaviorMap[behaviorId]) {
              behaviorMap[behaviorId].robots.push(robotInfo);
            } else {
              behaviorMap[behaviorId] = {
                behaviorRequest,
                robots: [robotInfo],
              };
            }
          }
        );
      }

      // Completed behaviors
      if (behaviorExecutionState?.completedBehaviorsMap?.completedBehaviors) {
        Object.entries(
          behaviorExecutionState.completedBehaviorsMap.completedBehaviors
        ).forEach(([behaviorKey, completedBehavior]) => {
          if (!completedBehavior?.request) return;

          const behaviorId = completedBehavior.request.behaviorRequestId;
          const robotInfo: RobotBehaviorInfo = {
            robotId,
            state: "completed",
            result: completedBehavior.result,
            behaviorKey,
          };

          if (behaviorMap[behaviorId]) {
            behaviorMap[behaviorId].robots.push(robotInfo);
          } else {
            behaviorMap[behaviorId] = {
              behaviorRequest: completedBehavior.request,
              robots: [robotInfo],
            };
          }
        });
      }
    });

    return behaviorMap;
  },

  getSortedAggregatedBehaviors: () => {
    const behaviorMap = get().getAggregatedBehaviors();

    return Object.entries(behaviorMap).sort(([, behaviorA], [, behaviorB]) => {
      const hasActiveA = behaviorA.robots.some((r) => r.state === "active");
      const hasActiveB = behaviorB.robots.some((r) => r.state === "active");

      // Active behaviors first
      if (hasActiveA && !hasActiveB) return -1;
      if (!hasActiveA && hasActiveB) return 1;

      // If both have active or both don't, sort by queued vs completed
      const hasQueuedA = behaviorA.robots.some((r) => r.state === "queued");
      const hasQueuedB = behaviorB.robots.some((r) => r.state === "queued");

      if (hasQueuedA && !hasQueuedB) return -1;
      if (!hasQueuedA && hasQueuedB) return 1;

      return 0;
    });
  },

  resetTaskTable: (robotId) =>
    set((state) => {
      const { [robotId]: _, ...rest } = state.taskTables;
      return { taskTables: rest };
    }),

  resetTaskTables: () => set({ taskTables: {} }),
}));
