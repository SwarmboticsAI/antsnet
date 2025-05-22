import { DefendRequest } from "@swarmbotics/protos/ros2_interfaces/sbai_protos/sbai_protos/defend_request";

export async function requestDefend({
  geoPoint,
  participatingRobotIds,
  defendRadiusM = 3,
}: Omit<DefendRequest, "behaviorRequestId">) {
  return fetch(`${import.meta.env.VITE_API_URL}/api/behaviors/defend`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      participatingRobotIds,
      geoPoint,
      defendRadiusM,
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
}
