import { useCallback, useState } from "react";
import { requestRally } from "@/lib/behaviors/rally";

import { RallyRequest } from "@swarmbotics/protos/ros2_interfaces/sbai_protos/sbai_protos/rally_request";
import { set } from "lodash";

export function useRallyRequest() {
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(false);

  const sendRallyRequest = useCallback(
    async (params: Omit<RallyRequest, "behaviorRequestId">) => {
      setLoading(true);
      try {
        await requestRally(params);
      } catch (error) {
        console.error("Error sending rally request:", error);
        setError(
          error instanceof Error ? error.message : "Unknown error occurred"
        );
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { sendRallyRequest, loading, error };
}
