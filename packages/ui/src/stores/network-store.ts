import type { CellMetrics } from "@swarmbotics/protos/ros2_interfaces/sbai_network_protos/sbai_network_protos/cell_metrics";
import type { FullPathMetrics } from "@swarmbotics/protos/ros2_interfaces/sbai_network_protos/sbai_network_protos/full_path_metrics";
import type { SatelliteMetrics } from "@swarmbotics/protos/ros2_interfaces/sbai_network_protos/sbai_network_protos/satellite_metrics";
import type { StarlinkStatus } from "@swarmbotics/protos/ros2_interfaces/sbai_network_protos/sbai_network_protos/starlink_status";
import type {
  ZerotierBackupPath,
  ZerotierConnection,
} from "@swarmbotics/protos/ros2_interfaces/sbai_network_protos/sbai_network_protos/zerotier_connection";
import { create } from "zustand";

export type NetworkTableData = {
  starlink_status?: StarlinkStatus;
  cell_metrics?: CellMetrics;
  full_path_metrics?: FullPathMetrics;
  satellite_metrics?: SatelliteMetrics;
  zerotier_connection?: ZerotierConnection;
  zerotier_backup_path?: ZerotierBackupPath;
};

interface NetworkTablesState {
  networkTables: Record<string, NetworkTableData>;
  setNetworkTable: (robotId: string, data: NetworkTableData) => void;
  getNetworkTable: (robotId: string) => NetworkTableData | undefined;
  resetNetworkTables: () => void;
}

export const useRobotNetworkStore = create<NetworkTablesState>((set, get) => ({
  networkTables: {},

  setNetworkTable: (robotId, data) =>
    set((state) => ({
      networkTables: {
        ...state.networkTables,
        [robotId]: data,
      },
    })),

  getNetworkTable: (robotId) => get().networkTables[robotId],

  resetNetworkTables: () => set({ networkTables: {} }),
}));
