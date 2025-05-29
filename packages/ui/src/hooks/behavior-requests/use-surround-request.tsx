import { useCallback, useState } from "react";
import { requestSurround } from "@/lib/behaviors/surround";
import { SurroundRequest } from "@swarmbotics/protos/ros2_interfaces/sbai_protos/sbai_protos/surround_request";

export function useSurroundRequest() {
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(false);

  const sendSurroundRequest = useCallback(
    async (params: Omit<SurroundRequest, "behaviorRequestId">) => {
      setLoading(true);
      try {
        await requestSurround(params);
      } catch (error) {
        console.error("Error sending surround request:", error);
        setError(
          error instanceof Error ? error.message : "Unknown error occurred"
        );
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { sendSurroundRequest, loading, error };
}
