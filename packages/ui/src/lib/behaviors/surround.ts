import { SurroundRequest } from "@swarmbotics/protos/ros2_interfaces/sbai_protos/sbai_protos/surround_request";

export async function requestSurround({
  geoPoint,
  participatingRobotIds,
  surroundRadiusM = 3,
}: Omit<SurroundRequest, "behaviorRequestId">) {
  return fetch(`${import.meta.env.VITE_API_URL}/api/behaviors/surround`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      participatingRobotIds,
      geoPoint,
      surroundRadiusM,
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
