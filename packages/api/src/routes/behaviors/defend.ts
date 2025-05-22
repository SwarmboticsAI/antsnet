import { Router } from "express";
import { startDefendBehavior } from "@/controllers/behaviors/defend.controller";

const router = Router();

router.post("/", startDefendBehavior);

export default router;
