import { Router } from "express";
import { startAreaCoverageBehavior } from "@/controllers/behaviors/area-coverage.controller";

const router = Router();

router.post("/", startAreaCoverageBehavior);

export default router;
