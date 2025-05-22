// Simplified useTeleopControl.ts
import { webSocketManager } from "@/lib/web-socket-manager";
import { useState, useCallback } from "react";

interface TeleopOptions {
  wsUrl: string;
  apiBaseUrl: string;
}

// Default values
const DEFAULT_OPTIONS: TeleopOptions = {
  wsUrl: `${import.meta.env.VITE_WS_URL}`,
  apiBaseUrl: `${import.meta.env.VITE_API_URL}/api`,
};

export function useTeleopControl(options: Partial<TeleopOptions> = {}) {
  const { wsUrl, apiBaseUrl } = { ...DEFAULT_OPTIONS, ...options };

  // State for tracking direct control status
  const [isControlling, setIsControlling] = useState(false);
  const [robotId, setRobotId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Send a message to the WebSocket
  const sendMessage = useCallback(
    (message: any) => {
      const ws = webSocketManager.getConnection(wsUrl);

      console.log(ws, wsUrl);

      if (ws && ws.readyState === WebSocket.OPEN) {
        console.log("Sending message:", message);
        ws.send(JSON.stringify(message));
        return true;
      }
      return false;
    },
    [wsUrl]
  );

  // Start direct control session
  const startControl = useCallback(
    async (targetRobotId: string) => {
      try {
        setError(null);

        // Set the robotId state
        setRobotId(targetRobotId);

        fetch(`${apiBaseUrl}/direct-control/start`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            robotId: targetRobotId,
            controllingDeviceId: "web",
            controllingDeviceIp: "10.243.216.20",
          }),
        })
          .then((response) => {
            if (!response.ok) {
              throw new Error("Network response was not ok");
            }
            return response.json();
          })
          .then((data) => {
            console.log("Data fetched successfully:", data);
          })
          .catch((error) => {
            console.error("Error fetching data:", error);
          });

        return true;
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Unknown error starting teleop control";
        setError(errorMessage);
        console.error("Error starting teleop control:", err);
        throw err;
      }
    },
    [sendMessage]
  );

  // Stop direct control session
  const stopControl = useCallback(
    async (targetRobotId: string) => {
      if (!targetRobotId) {
        setIsControlling(false);
        setRobotId(null);
        return;
      }

      try {
        fetch(`${apiBaseUrl}/direct-control/stop`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            robotId: targetRobotId,
            controllingDeviceId: "web",
          }),
        })
          .then((response) => {
            if (!response.ok) {
              throw new Error("Network response was not ok");
            }
            return response.json();
          })
          .then((data) => {
            console.log("Data fetched successfully:", data);
          })
          .catch((error) => {
            console.error("Error fetching data:", error);
          });
        // Reset state
        setIsControlling(false);
        setRobotId(null);
        return true;
      } catch (err) {
        console.error("Error stopping teleop control:", err);
      } finally {
        // Reset state regardless of API response
        setIsControlling(false);
        setRobotId(null);
      }
    },
    [sendMessage]
  );

  // Send teleop command
  const sendTeleopCommand = useCallback(
    (throttle: number, steering: number) => {
      console.log("Sending teleop command:", throttle, steering);

      return sendMessage({
        type: "teleop",
        robotId: robotId,
        axes: [throttle, steering],
      });
    },
    [isControlling, robotId, sendMessage]
  );

  return {
    isControlling,
    error,
    robotId,
    startControl,
    stopControl,
    sendTeleopCommand,
  };
}
