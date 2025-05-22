import { create } from "zustand";
import type { BehaviorExecutionState } from "@swarmbotics/protos/ros2_interfaces/sbai_behavior_protos/sbai_behavior_protos/behavior_execution_state";

interface TaskTablesState {
  taskTables: Record<string, BehaviorExecutionState>;
  setTaskTable: (robotId: string, data: BehaviorExecutionState) => void;
  getTaskTable: (robotId: string) => BehaviorExecutionState | undefined;
  resetTaskTables: () => void;
}

export const useRobotTaskStore = create<TaskTablesState>((set, get) => ({
  taskTables: {},

  setTaskTable: (robotId, data) =>
    set((state) => ({
      taskTables: {
        ...state.taskTables,
        [robotId]: data,
      },
    })),

  getTaskTable: (robotId) => get().taskTables[robotId],

  resetTaskTables: () => set({ taskTables: {} }),
}));
