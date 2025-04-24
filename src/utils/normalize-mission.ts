import { MissionRecord } from "@/providers/mission-provider";

export function normalizeMission(raw: any): MissionRecord {
  if (!raw || typeof raw !== "object" || !raw.data) {
    throw new Error("Invalid mission object");
  }

  return {
    _id: raw._id,
    createdAt: new Date(raw.createdAt),
    updatedAt: new Date(raw.updatedAt),
    data: {
      id: raw.data.id || raw._id, // fallback UUID
      name: raw.data.name,
      description: raw.data.description ?? "",
      phases: raw.data.phases ?? [],
      stagingAreas: raw.data.stagingAreas ?? [],
      robotGroups: raw.data.robotGroups ?? [],
      status: raw.data.status || "DRAFT",
      numberOfRobots: raw.data.numberOfRobots,
      createdAt: new Date(raw.data.createdAt || raw.createdAt),
    },
  };
}
