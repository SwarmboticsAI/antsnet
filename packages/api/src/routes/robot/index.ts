import Router from "express";
import registerRoute from "./register";
import unregisterRoute from "./unregister";
import { robotRegistryService } from "@/services/robots/robot-registry";

const router = Router();

router.get("/", (req: any, res: any) => {
  const robots = Array.from(robotRegistryService.getAllRobots());
  return res.json({ robots });
});
router.use("/register-robot", registerRoute);
router.use("/:robotId", unregisterRoute);

export default router;
