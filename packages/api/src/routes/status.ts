import { Router } from "express";
import { robotRegistryService } from "@/services/robots/robot-registry";

const router = Router();

router.get("/api/status", (req, res) => {
  const robots = robotRegistryService.getAllRobots();

  res.json({
    status: "online",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || "development",
    robots: {
      count: robots.length,
      ids: robots.map((robot) => robot.robotId),
    },

    version: "1.0.0",
  });
});

export default router;
