import { AreaCoverageRequest } from "@swarmbotics/protos/ros2_interfaces/sbai_protos/sbai_protos/area_coverage_request";

export async function requestAreaCoverage({
  participatingRobotIds,
  coverageArea,
  laneWidthM = 3,
}: Omit<AreaCoverageRequest, "behaviorRequestId">) {
  return fetch(`${import.meta.env.VITE_API_URL}/api/behaviors/area-coverage`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      participatingRobotIds,
      coverageArea,
      laneWidthM,
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
