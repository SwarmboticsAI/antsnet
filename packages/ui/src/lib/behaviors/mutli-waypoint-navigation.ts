import { MultiWaypointNavigationRequest } from "@swarmbotics/protos/ros2_interfaces/sbai_protos/sbai_protos/multi_waypoint_navigation_request";

export async function requestMultiWaypointNavigation({
  participatingRobotId,
  geoPoints,
  desiredFinalYawDeg,
}: Omit<MultiWaypointNavigationRequest, "behaviorRequestId">) {
  return fetch(
    `${import.meta.env.VITE_API_URL}/api/behaviors/waypoint-navigation`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        participatingRobotId,
        geoPoints,
        desiredFinalYawDeg,
      }),
    }
  )
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
}
