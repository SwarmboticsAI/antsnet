import { useCallback, useState } from "react";
import { requestDefend } from "@/lib/behaviors/defend";
import { DefendRequest } from "@swarmbotics/protos/ros2_interfaces/sbai_protos/sbai_protos/defend_request";

export function useDefendRequest() {
  const [loading, setLoading] = useState(false);

  const sendDefendRequest = useCallback(
    async (params: Omit<DefendRequest, "behaviorRequestId">) => {
      setLoading(true);
      try {
        await requestDefend(params);
      } catch (error) {
        console.error("Error sending rally request:", error);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { sendDefendRequest, loading };
}
