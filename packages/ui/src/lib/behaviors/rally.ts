import { RallyRequest } from "@swarmbotics/protos/sbai_protos/rally_request";

export async function requestRally({
  geoPoint,
  participatingRobotIds,
  rallyPointToleranceM = 3,
}: Omit<RallyRequest, "behaviorRequestId">) {
  return fetch(`${import.meta.env.VITE_API_URL}/api/behaviors/rally`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      participatingRobotIds,
      geoPoint,
      rallyPointToleranceM,
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
