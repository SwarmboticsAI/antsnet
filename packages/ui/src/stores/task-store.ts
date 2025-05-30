import { create } from "zustand";
import type { BehaviorExecutionState } from "@swarmbotics/protos/ros2_interfaces/sbai_protos/sbai_protos/behavior_execution_state";

interface TaskTablesState {
  taskTables: Record<string, BehaviorExecutionState>;
  setTaskTable: (robotId: string, data: BehaviorExecutionState) => void;
  getTaskTable: (robotId: string) => BehaviorExecutionState | undefined;
  resetTaskTable: (robotId: string) => void;
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

  resetTaskTable: (robotId) =>
    set((state) => {
      const { [robotId]: _, ...rest } = state.taskTables;
      return { taskTables: rest };
    }),

  resetTaskTables: () => set({ taskTables: {} }),
}));
