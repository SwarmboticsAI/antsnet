import { Router } from "express";
import { startPatrolBehavior } from "@/controllers/behaviors/patrol.controller";

const router = Router();

router.post("/", startPatrolBehavior);

export default router;
