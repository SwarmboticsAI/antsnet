import { useCallback } from "react";
import { useRobotStore } from "@/stores/robot-store";
import { useRobotTaskStore } from "@/stores/task-store";
import { useRobotLocalizationStore } from "@/stores/localization-store";
import { useRobotNetworkStore } from "@/stores/network-store";
import { useRobotPathStore } from "@/stores/robot-path-store";
import { useRobotSystemStore } from "@/stores/system-store";
import { useWebSocket } from "@/lib/web-socket-manager";

export function useRobots() {
  const { updateRobots, removeRobots } = useRobotStore();
  const { resetTaskTable } = useRobotTaskStore();
  const { resetSystemTable } = useRobotSystemStore();
  const { resetNetworkTable } = useRobotNetworkStore();
  const { resetRobotPath } = useRobotPathStore();
  const { resetLocalizationTable } = useRobotLocalizationStore();

  const handleMessage = useCallback(
    (data: any) => {
      if (data.type === "heartbeat_update") {
        updateRobots(data.robots);
      } else if (data.type === "robot_timeout") {
        removeRobots(data.robots);
        data.robots.forEach((robotId: string) => {
          // clear all tables for the robot
          resetTaskTable(robotId);
          resetLocalizationTable(robotId);
          resetSystemTable(robotId);
          resetNetworkTable(robotId);
          resetRobotPath(robotId);
        });
      }
    },
    [removeRobots]
  );

  useWebSocket(import.meta.env.VITE_DISCOVERY_WS_URL, handleMessage);
}
