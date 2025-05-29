import { create } from "zustand";
import type { GeoPath } from "@swarmbotics/protos/ros2_interfaces/sbai_protos/sbai_protos/geo_path";

interface RobotPathState {
  robotPaths: Record<string, GeoPath>;
  setRobotPath: (robotId: string, data: GeoPath) => void;
  getRobotPath: (robotId: string) => GeoPath | undefined;
  resetRobotPath: (robotId: string) => void;
  resetRobotPaths: () => void;
}

export const useRobotPathStore = create<RobotPathState>((set, get) => ({
  robotPaths: {},

  setRobotPath: (robotId, data) =>
    set((state) => ({
      robotPaths: {
        ...state.robotPaths,
        [robotId]: data,
      },
    })),

  getRobotPath: (robotId) => get().robotPaths[robotId],

  resetRobotPath: (robotId) =>
    set((state) => {
      const { [robotId]: _, ...rest } = state.robotPaths;
      return { robotPaths: rest };
    }),

  resetRobotPaths: () => set({ robotPaths: {} }),
}));
