import { useCallback, useState } from "react";
import { PatrolRequest } from "@swarmbotics/protos/ros2_interfaces/sbai_protos/sbai_protos/patrol_request";
import { requestPatrol } from "@/lib/behaviors/patrol";

export function usePatrolRequest() {
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(false);

  const sendPatrolRequest = useCallback(
    async (params: Omit<PatrolRequest, "behaviorRequestId">) => {
      setLoading(true);
      try {
        await requestPatrol(params);
      } catch (error) {
        console.error("Error sending patrol request:", error);
        setError(
          error instanceof Error ? error.message : "Unknown error occurred"
        );
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { sendPatrolRequest, loading, error };
}
