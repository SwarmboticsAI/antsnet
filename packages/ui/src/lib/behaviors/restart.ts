export async function restartBehavior({
  behaviorRequestId,
  participatingRobotIds,
}: {
  behaviorRequestId: string;
  participatingRobotIds: string[];
}) {
  return fetch(`${import.meta.env.VITE_API_URL}/api/behavior-control/restart`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      behaviorRequestId,
      participatingRobotIds,
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
