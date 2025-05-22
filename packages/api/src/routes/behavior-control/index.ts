import { Router } from "express";
import { cancelBehavior } from "@/controllers/behavior-control/cancel.controller";
import { pauseBehavior } from "@/controllers/behavior-control/pause.controller";
import { resumeBehavior } from "@/controllers/behavior-control/resume.controller";
import { restartBehavior } from "@/controllers/behavior-control/restart.controller";

const router = Router();

router.post("/cancel", cancelBehavior);
router.post("/pause", pauseBehavior);
router.post("/resume", resumeBehavior);
router.post("/restart", restartBehavior);

export default router;
