import { create } from "zustand";
import type { BoomButtonStatus } from "@swarmbotics/protos/ros2_interfaces/sbai_protos/sbai_protos/boom_button_status";
import type { CanStatus } from "@swarmbotics/protos/ros2_interfaces/sbai_protos/sbai_protos/can_status";
import type { EcuStatus } from "@swarmbotics/protos/ros2_interfaces/sbai_protos/sbai_protos/ecu_status";
import type { EmergencyStopStatus } from "@swarmbotics/protos/ros2_interfaces/sbai_protos/sbai_protos/emergency_stop_status";
import type { StateChangeResult } from "@swarmbotics/protos/ros2_interfaces/sbai_protos/sbai_protos/state_change_result";
import type { OakStatus } from "@swarmbotics/protos/ros2_interfaces/sbai_protos/sbai_protos/oak_status";
import type { TerrainMapStatus } from "@swarmbotics/protos/ros2_interfaces/sbai_protos/sbai_protos/terrain_map_status";
import type { GpsStatus } from "@swarmbotics/protos/ros2_interfaces/sbai_protos/sbai_protos/gps_status";
import type { FixStatus } from "@swarmbotics/protos/ros2_interfaces/sbai_protos/sbai_protos/fix_status";
import type { ControllingDeviceIdentity } from "@swarmbotics/protos/ros2_interfaces/sbai_protos/sbai_protos/controlling_device_identity";
import type { BatteryPercentage } from "@swarmbotics/protos/ros2_interfaces/sbai_protos/sbai_protos/battery_percentage";
import type { ParkingBrakeStatus } from "@swarmbotics/protos/ros2_interfaces/sbai_protos/sbai_protos/parking_brake_status";

export type SystemTableData = {
  oak_status?: OakStatus;
  can_status?: CanStatus;
  ecu_status?: EcuStatus;
  emergency_stop_status?: EmergencyStopStatus;
  boom_button_status?: BoomButtonStatus;
  state_change_result?: StateChangeResult;
  terrain_map_status?: TerrainMapStatus;
  gps_status?: GpsStatus;
  fix_status?: FixStatus;
  controlling_device_id?: ControllingDeviceIdentity;
  battery_percentage?: BatteryPercentage;
  parking_brake_status?: ParkingBrakeStatus;
};

interface SystemTablesState {
  systemTables: Record<string, SystemTableData>;
  setSystemTable: (robotId: string, data: SystemTableData) => void;
  getSystemTable: (robotId: string) => SystemTableData | undefined;
  resetSystemTable: (robotId: string) => void;
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

  resetSystemTable: (robotId) =>
    set((state) => {
      const { [robotId]: _, ...rest } = state.systemTables;
      return { systemTables: rest };
    }),

  resetSystemTables: () => set({ systemTables: {} }),
}));
