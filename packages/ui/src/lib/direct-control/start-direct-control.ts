import { DirectControlStartRequest } from "@swarmbotics/protos/ros2_interfaces/sbai_protos/sbai_protos/direct_control_request";

export interface ApiDirectControlStartRequest
  extends DirectControlStartRequest {
  robotId: string;
}

export async function startDirectControl({
  robotId,
  controllingDeviceId,
  controllingDeviceIp,
}: ApiDirectControlStartRequest) {
  return fetch(`${import.meta.env.VITE_API_URL}/api/direct-control/start`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      robotId,
      controllingDeviceId,
      controllingDeviceIp,
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
