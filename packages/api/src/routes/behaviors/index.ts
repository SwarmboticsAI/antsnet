import { Router } from "express";
import rallyRoutes from "./rally";
import surroundRoutes from "./surround";
import defendRoutes from "./defend";
import patrolRoutes from "./patrol";
import areaCoverage from "./area-coverage";
import waypointNavigation from "./waypoint-navigation";

const router = Router();

router.use("/defend", defendRoutes);
router.use("/surround", surroundRoutes);
router.use("/rally", rallyRoutes);
router.use("/patrol", patrolRoutes);
router.use("/area-coverage", areaCoverage);
router.use("/waypoint-navigation", waypointNavigation);

export default router;
