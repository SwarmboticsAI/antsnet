import { create } from "zustand";
import { type Robot } from "@/types/robot";

type RobotState = {
  robots: Record<string, Robot>;
  sortedRobots: Robot[];
  updateRobots: (incoming: Robot[]) => void;
  removeRobots: (ids: string[]) => void;
};

export const useRobotStore = create<RobotState>((set) => ({
  robots: {},
  sortedRobots: [],
  updateRobots: (incoming) =>
    set((state) => {
      const updated = { ...state.robots };
      for (const r of incoming) {
        updated[r.robotId] = { ...updated[r.robotId], ...r };
      }
      // Calculate sorted robots after updating
      const sortedRobots = Object.values(updated).sort((a, b) =>
        a.robotId.localeCompare(b.robotId, undefined, {
          numeric: true,
          sensitivity: "base",
        })
      );
      return { robots: updated, sortedRobots };
    }),
  removeRobots: (ids) =>
    set((state) => {
      const updated = { ...state.robots };
      for (const id of ids) delete updated[id];
      // Calculate sorted robots after removing
      const sortedRobots = Object.values(updated).sort((a, b) =>
        a.robotId.localeCompare(b.robotId, undefined, {
          numeric: true,
          sensitivity: "base",
        })
      );
      return { robots: updated, sortedRobots };
    }),
}));
