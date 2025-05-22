import { Router } from "express";
import { startWaypointNavigationBehavior } from "@/controllers/behaviors/waypoint-navigation.controller";

const router = Router();

router.post("/", startWaypointNavigationBehavior);

export default router;
