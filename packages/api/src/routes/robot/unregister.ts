import { Router } from "express";
import { robotRegistryService } from "@/services/robots/robot-registry";

const router = Router();

router.delete("/:robotId", (req: any, res: any) => {
  const { robotId } = req.params;

  if (!robotId) {
    return res.status(400).json({ error: "Missing robot ID" });
  }

  const allRobots = robotRegistryService.getAllRobots();

  if (allRobots.find((robot) => robot.robotId === robotId) === undefined) {
    return res.status(404).json({
      error: `Robot with ID ${robotId} not found`,
    });
  }

  // Attempt to clear any stored intervals for this robot
  if (typeof robotRegistryService.getIntervals === "function") {
    const intervals = robotRegistryService.getIntervals(robotId);
    if (Array.isArray(intervals)) {
      intervals.forEach((intervalId) => {
        clearInterval(intervalId);
      });
      console.log(`Cleared intervals for robot: ${robotId}`);
    }
  }

  // Remove the robot from registry
  robotRegistryService.removeRobot(robotId);
  console.log(`Robot removed: ${robotId}`);

  return res.status(200).json({
    success: true,
    message: "Robot removed and intervals cleared",
  });
});

export default router;
