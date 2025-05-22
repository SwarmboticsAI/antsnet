import { useCallback, useState } from "react";
import { requestAreaCoverage } from "@/lib/behaviors/area-coverage";
import { AreaCoverageRequest } from "@swarmbotics/protos/ros2_interfaces/sbai_protos/sbai_protos/area_coverage_request";

export function useAreaCoverageRequest() {
  const [loading, setLoading] = useState(false);

  const sendAreaCoverageRequest = useCallback(
    async (params: Omit<AreaCoverageRequest, "behaviorRequestId">) => {
      setLoading(true);
      try {
        await requestAreaCoverage(params);
      } catch (error) {
        console.error("Error sending rally request:", error);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { sendAreaCoverageRequest, loading };
}
