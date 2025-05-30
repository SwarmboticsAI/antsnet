import { create } from "zustand";
import type { LocalizationData } from "@swarmbotics/protos/ros2_interfaces/sbai_protos/sbai_protos/localization_data";

export type LocalizationTableData = {
  localization_data?: LocalizationData;
};

interface LocalizationTableState {
  localizationTables: Record<string, LocalizationTableData>;
  setLocalizationTable: (robotId: string, data: LocalizationTableData) => void;
  getLocalizationTable: (robotId: string) => LocalizationTableData | undefined;
  resetLocalizationTable: (robotId: string) => void;
  resetLocalizationTables: () => void;
}

export const useRobotLocalizationStore = create<LocalizationTableState>(
  (set, get) => ({
    localizationTables: {},

    setLocalizationTable: (robotId, data) =>
      set((state) => ({
        localizationTables: {
          ...state.localizationTables,
          [robotId]: data,
        },
      })),

    getLocalizationTable: (robotId) => get().localizationTables[robotId],

    resetLocalizationTable: (robotId) =>
      set((state) => {
        const { [robotId]: _, ...rest } = state.localizationTables;
        return { localizationTables: rest };
      }),

    resetLocalizationTables: () => set({ localizationTables: {} }),
  })
);
