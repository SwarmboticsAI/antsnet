import { create } from "zustand";
import type { BoomButtonStatus } from "@swarmbotics/protos/ros2_interfaces/sbai_control_protos/sbai_control_protos/boom_button_status";
import type { CanStatus } from "@swarmbotics/protos/ros2_interfaces/sbai_control_protos/sbai_control_protos/can_status";
import type { EcuStatus } from "@swarmbotics/protos/ros2_interfaces/sbai_control_protos/sbai_control_protos/ecu_status";
import type { EmergencyStopStatus } from "@swarmbotics/protos/ros2_interfaces/sbai_control_protos/sbai_control_protos/emergency_stop_status";
import type { StateChangeResult } from "@swarmbotics/protos/ros2_interfaces/sbai_cortex_protos/sbai_cortex_protos/state_change_result";
import type { OakStatus } from "@swarmbotics/protos/ros2_interfaces/sbai_perception_protos/sbai_perception_protos/oak_status";
import type { TerrainMapStatus } from "@swarmbotics/protos/ros2_interfaces/sbai_perception_protos/sbai_perception_protos/terrain_map_status";

export type SystemTableData = {
  oak_status?: OakStatus;
  can_status?: CanStatus;
  ecu_status?: EcuStatus;
  emergency_stop_status?: EmergencyStopStatus;
  boom_button_status?: BoomButtonStatus;
  state_change_result?: StateChangeResult;
  terrain_map_status?: TerrainMapStatus;
};

interface SystemTablesState {
  systemTables: Record<string, SystemTableData>;
  setSystemTable: (robotId: string, data: SystemTableData) => void;
  getSystemTable: (robotId: string) => SystemTableData | undefined;
  resetSystemTables: () => void;
}

export const useRobotSystemStore = create<SystemTablesState>((set, get) => ({
  systemTables: {},

  setSystemTable: (robotId, data) =>
    set((state) => ({
      systemTables: {
        ...state.systemTables,
        [robotId]: data,
      },
    })),

  getSystemTable: (robotId) => get().systemTables[robotId],

  resetSystemTables: () => set({ systemTables: {} }),
}));
