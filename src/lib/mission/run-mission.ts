import { MissionDraft } from "@/providers/mission-draft-provider";
import { RobotAssignmentState } from "@/reducers/robot-assignment-reducer";

export async function runMission(
  mission: MissionDraft,
  assignments: RobotAssignmentState["assignments"]
) {
  console.log("🚀 Running mission:", mission.name);

  for (const phase of mission.phases) {
    console.log(`🟦 Starting Phase: ${phase.name}`);

    for (const behavior of phase.behaviors) {
      const targetRobots = behavior.groupIds.flatMap((groupId) =>
        Object.entries(assignments)
          .filter(([_, gId]) => gId === groupId)
          .map(([robotId]) => robotId)
      );

      console.log(
        "📤 Dispatching behavior:",
        behavior.behaviorType,
        "to",
        targetRobots
      );

      // 🔌 Send to Zenoh, simulate delay, etc.
      // await publishBehaviorToZenoh(behavior, targetRobots);

      if (behavior.delayMs) {
        console.log(`⏱ Waiting ${behavior.delayMs}ms before next behavior`);
        await new Promise((res) => setTimeout(res, behavior.delayMs));
      }
    }

    console.log(`✅ Phase ${phase.name} complete`);
  }

  console.log("🎉 Mission complete");
}
