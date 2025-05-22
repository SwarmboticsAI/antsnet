import { useCallback, useState } from "react";
import { MultiWaypointNavigationRequest } from "@swarmbotics/protos/ros2_interfaces/sbai_protos/sbai_protos/multi_waypoint_navigation_request";
import { requestMultiWaypointNavigation } from "@/lib/behaviors/mutli-waypoint-navigation";

export function useMultiWaypointNavigationRequest() {
  const [loading, setLoading] = useState(false);

  const sendMultiWaypointNavigationRequest = useCallback(
    async (
      params: Omit<MultiWaypointNavigationRequest, "behaviorRequestId">
    ) => {
      setLoading(true);
      try {
        await requestMultiWaypointNavigation(params);
      } catch (error) {
        console.error("Error sending rally request:", error);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { sendMultiWaypointNavigationRequest, loading };
}
