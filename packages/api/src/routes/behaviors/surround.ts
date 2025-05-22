import { Router } from "express";
import { startSurroundBehavior } from "@/controllers/behaviors/surround.controller";

const router = Router();

router.post("/", startSurroundBehavior);

export default router;
