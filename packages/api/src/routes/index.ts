import { Router } from "express";
import statusRoute from "@/routes/status";
import behaviorRoutes from "@/routes/behaviors";
import behaviorControlRoutes from "@/routes/behavior-control";
import directControlRoutes from "@/routes/direct-control";
import payloadRoutes from "@/routes/payloads";
import robotRoutes from "@/routes/robot";
import authRoutes from "@/routes/auth";

const router = Router();

router.use("/api/auth", authRoutes);
router.use("/api/status", statusRoute);
router.use("/api/robots", robotRoutes);
router.use("/api/behaviors", behaviorRoutes);
router.use("/api/behavior-control", behaviorControlRoutes);
router.use("/api/direct-control", directControlRoutes);
router.use("/api/payloads", payloadRoutes);

export default router;
