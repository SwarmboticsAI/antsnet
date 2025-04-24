import { useEffect, useMemo, useState } from "react";
import { useMapContext } from "@/providers/map-provider";
import { useRobots } from "@/providers/robot-provider";
import { Robot } from "@/types/Robot";

export function useLockView() {
  const { mapRef, flyToRobot } = useMapContext();
  const { robotList: robots } = useRobots();

  const [lockedRobotId, setLockedRobotId] = useState<string>();

  const lockedRobot = useMemo(() => {
    if (!lockedRobotId) return null;

    return robots.find((robot: Robot) => robot.robotId === lockedRobotId);
  }, [lockedRobotId, robots]);

  useEffect(() => {
    if (lockedRobot && mapRef.current) {
      console.log("🗺️ Locking view to robot:", lockedRobot);

      flyToRobot(lockedRobot);
    }
  }, [lockedRobot, mapRef, flyToRobot]);

  return {
    lockedRobotId,
    setLockedRobotId,
  };
}
