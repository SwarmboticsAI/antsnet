import { useCallback } from "react";
import { useRobotStore } from "@/stores/robot-store";
import { useRobotTaskStore } from "@/stores/task-store";
import { useWebSocket } from "@/lib/web-socket-manager";

export function useRobots() {
  const removeRobots = useRobotStore((s) => s.removeRobots);
  const updateRobots = useRobotStore((s) => s.updateRobots);
  const resetTaskTables = useRobotTaskStore((s) => s.resetTaskTables);

  const handleMessage = useCallback(
    (data: any) => {
      if (data.type === "heartbeat_update") {
        updateRobots(data.robots);
      } else if (data.type === "robot_timeout") {
        removeRobots(data.robots);
        resetTaskTables();
      }
    },
    [removeRobots]
  );

  useWebSocket(import.meta.env.VITE_DISCOVERY_WS_URL, handleMessage);
}
