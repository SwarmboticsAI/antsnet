import { Router } from "express";
import { startRallyBehavior } from "@/controllers/behaviors/rally.controller";

const router = Router();

router.post("/", startRallyBehavior);

export default router;
