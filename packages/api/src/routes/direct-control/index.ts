import Router from "express";

import {
  startDirectControlRequest,
  stopDirectControlRequest,
} from "@/controllers/direct-control/direct-control.controller";

const router = Router();

router.post("/start", startDirectControlRequest);
router.post("/stop", stopDirectControlRequest);

export default router;
