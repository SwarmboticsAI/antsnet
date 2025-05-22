import { useCallback } from "react";
import { useRobotTaskStore } from "@/stores/task-store";
import { useRobotPathStore } from "@/stores/robot-path-store";
import {
  useRobotNetworkStore,
  type NetworkTableData,
} from "@/stores/network-store";
import {
  useRobotSystemStore,
  type SystemTableData,
} from "@/stores/system-store";
import { useWebSocket } from "@/lib/web-socket-manager";
import type { BehaviorExecutionState } from "@swarmbotics/protos/ros2_interfaces/sbai_behavior_protos/sbai_behavior_protos/behavior_execution_state";

type IncomingMessage =
  | {
      type: "system-table-update";
      payload: { robotId: string; data: SystemTableData };
    }
  | {
      type: "network-table-update";
      payload: { robotId: string; data: NetworkTableData };
    }
  | {
      type: "task-table-update";
      payload: {
        robotId: string;
        data: { behavior_execution_state?: BehaviorExecutionState };
      };
    }
  | {
      type: string;
      payload?: any;
    };

export function useRobotTables() {
  const setSystemTables = useRobotSystemStore((s) => s.setSystemTable);
  const setNetworkTables = useRobotNetworkStore((s) => s.setNetworkTable);
  const setTaskTable = useRobotTaskStore((s) => s.setTaskTable);
  const setRobotPath = useRobotPathStore((s) => s.setRobotPath);

  const handleMessage = useCallback(
    (data: IncomingMessage) => {
      try {
        switch (data.type) {
          case "system-table-update":
            if (!data.payload?.robotId || !data.payload?.data) break;
            setSystemTables(data.payload.robotId, data.payload.data);
            break;

          case "network-table-update":
            if (!data.payload?.robotId || !data.payload?.data) break;
            setNetworkTables(data.payload.robotId, data.payload.data);
            break;

          case "task-table-update":
            if (
              data.payload?.robotId &&
              data.payload.data?.behavior_execution_state
            ) {
              setTaskTable(
                data.payload.robotId,
                data.payload.data.behavior_execution_state
              );
            }
            if (data.payload?.robotId && data.payload.data?.geo_path) {
              setRobotPath(data.payload.robotId, data.payload.data?.geo_path);
            }

            break;

          default:
            if (import.meta.env.DEV) {
              console.warn("[WebSocket] Unknown message type:", data.type);
            }
            break;
        }
      } catch (err) {
        console.error("[WebSocket] Error processing message:", err);
      }
    },
    [setTaskTable]
  );

  useWebSocket(import.meta.env.VITE_WS_URL, handleMessage);
}
