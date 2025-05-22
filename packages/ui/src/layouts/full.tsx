import { Outlet } from "react-router-dom";
import { Navigation } from "@/components/navigation";
import { useRobotTables } from "@/hooks/use-robot-tables";
import { useRobots } from "@/hooks/use-robot-telemetry";

export function FullWidthLayout() {
  useRobotTables();
  useRobots();

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <div className="flex flex-1">
        <Outlet />
      </div>
    </div>
  );
}
