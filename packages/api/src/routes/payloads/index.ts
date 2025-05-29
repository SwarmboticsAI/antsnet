import { Router } from "express";
import { registerPayload } from "@/controllers/payloads/register-payload.controller";
import { triggerBoom } from "@/controllers/payloads/trigger-boom.controller";

const router = Router();

router.post("/register-payload", registerPayload);
router.post("/trigger-boom", triggerBoom);

export default router;
