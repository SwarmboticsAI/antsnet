import { PatrolRequest } from "@swarmbotics/protos/sbai_protos/patrol_request";

export async function requestPatrol({
  patrolPerimeterPoints,
  participatingRobotIds,
}: Omit<PatrolRequest, "behaviorRequestId">) {
  return fetch(`${import.meta.env.VITE_API_URL}/api/behaviors/patrol`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      participatingRobotIds,
      patrolPerimeterPoints,
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
