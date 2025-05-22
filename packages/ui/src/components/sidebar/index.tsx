import { useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { RobotDetailPanel } from "@/components/sidebar/robot-details-panel";
import { RobotListPanel } from "@/components/sidebar/robot-list-panel";

import { useRobotStore } from "@/stores/robot-store";
import { useTheme } from "@/providers/theme-provider";

import { type Robot } from "@/types/robot";
import { cn } from "@/lib/utils";

export function Sidebar({
  selectedRobotId,
  setSelectedRobotId,
}: {
  selectedRobotId?: string;
  setSelectedRobotId: (id: string | undefined) => void;
}) {
  const { theme } = useTheme();
  const [collapsed, setCollapsed] = useState(false);
  const { sortedRobots: robots } = useRobotStore();

  const selectedRobot = robots.find(
    (r: Robot) => r.robotId === selectedRobotId
  );

  return (
    <div className="absolute left-0 top-15 z-10">
      <div
        className={cn("flex", collapsed ? "translate-x-0" : "translate-x-0")}
      >
        <div
          className={cn(
            "transition-all duration-300 ease-in-out relative",
            collapsed ? "w-0 overflow-hidden" : "w-88"
          )}
        >
          <div
            className={cn(
              "h-[calc(100svh-60px)] w-full border-r shadow-lg ",
              theme === "dark" ? "bg-zinc-950/95" : "bg-zinc-100/95"
            )}
          >
            {selectedRobot ? (
              <RobotDetailPanel
                robot={selectedRobot}
                onBack={() => setSelectedRobotId(undefined)}
                isBusy={false}
              />
            ) : (
              <RobotListPanel
                robots={robots}
                onRobotClick={(robotId: string) => {
                  if (robotId !== selectedRobotId) {
                    setSelectedRobotId(robotId);
                  }
                }}
              />
            )}
          </div>
        </div>

        <Button
          className={cn(
            "h-12 w-8 absolute -right-8 top-1/2 -translate-y-1/2 flex items-center justify-center z-10",
            "rounded-r-md rounded-l-none",
            theme === "dark"
              ? "bg-yellow-600 hover:bg-yellow-700"
              : "bg-yellow-600 hover:bg-yellow-700"
          )}
          variant="default"
          onClick={() => setCollapsed(!collapsed)}
          title={collapsed ? "Show Sidebar" : "Hide Sidebar"}
        >
          {collapsed ? (
            <ArrowRight className="text-white h-4 w-4" />
          ) : (
            <ArrowLeft className="text-white h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  );
}
