import { useEffect, useState, useCallback } from "react";

import { VideoPlayer } from "@/components/video-player";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";

import { useRobotStore } from "@/stores/robot-store";
import { type Robot } from "@/types/robot";

export function Streams() {
  const { sortedRobots: robots } = useRobotStore();
  const [selectedRobots, setSelectedRobots] = useState<string[]>([]);
  const [cameraFeed, setCameraFeed] = useState<string>("color/low");
  const [hasInitialized, setHasInitialized] = useState(false);

  const handleToggle = (robotId: string) => {
    setSelectedRobots((prevSelected) => {
      const newSelected = new Set(prevSelected);
      if (newSelected.has(robotId)) {
        newSelected.delete(robotId);
      } else {
        newSelected.add(robotId);
      }
      return Array.from(newSelected);
    });
  };

  const handleSelectAll = useCallback(() => {
    setSelectedRobots(robots.map((r: Robot) => r.robotId));
  }, [robots]);

  const handleClearAll = () => {
    setSelectedRobots([]);
  };

  // Only auto-select all robots once when robots first load
  useEffect(() => {
    if (robots.length > 0 && !hasInitialized) {
      setTimeout(() => {
        handleSelectAll();
        setHasInitialized(true);
      }, 100);
    }
  }, [robots.length, hasInitialized, handleSelectAll]);

  const maxDisplay = 6;
  const selected = robots.filter((r: Robot) =>
    selectedRobots.includes(r.robotId)
  );
  const displayed = selected.slice(0, maxDisplay);
  const columnCount = displayed.length <= 1 ? 1 : displayed.length <= 4 ? 2 : 3;

  return (
    <>
      <div className="absolute w-full h-full top-0 left-0 pt-0 bg-background">
        <div className="flex flex-col h-screen overflow-hidden pt-19 p-4">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
            <div className="flex gap-4 flex-wrap">
              {robots.map((robot: Robot) => (
                <div
                  key={robot.robotId}
                  className="flex items-center space-x-2"
                >
                  <Checkbox
                    id={robot.robotId}
                    checked={selectedRobots.includes(robot.robotId)}
                    onCheckedChange={() => handleToggle(robot.robotId)}
                  />
                  <Label
                    htmlFor={robot.robotId}
                    className="cursor-pointer text-sm uppercase"
                  >
                    {robot.robotId}
                  </Label>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Select value={cameraFeed} onValueChange={setCameraFeed}>
                <SelectTrigger className="w-48 mr-4" size="sm">
                  <span className="text-sm">
                    {cameraFeed === "color/low"
                      ? "Main"
                      : cameraFeed === "mono"
                      ? "IR"
                      : "Perception"}
                  </span>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="color/low">Main</SelectItem>
                  <SelectItem value="mono">IR</SelectItem>
                  <SelectItem value="terrain/traversability">
                    Perception
                  </SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" onClick={handleSelectAll}>
                Select All Robots
              </Button>
              <Button variant="ghost" size="sm" onClick={handleClearAll}>
                Clear All
              </Button>
            </div>
          </div>

          <div className="flex-1 overflow-hidden">
            {displayed.length === 0 ? (
              <p className="text-gray-500 text-center mt-12">
                No video streams selected.
              </p>
            ) : (
              <div
                className="grid gap-4 h-full"
                style={{
                  gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))`,
                  gridAutoRows: "1fr",
                }}
              >
                {displayed.map((robot: Robot) => (
                  <div
                    key={robot.robotId}
                    id={`video-${robot.robotId}`}
                    className="relative rounded-lg overflow-hidden bg-background border shadow-md animate-fade-in"
                  >
                    <div className="p-0 flex items-center justify-between">
                      <h2 className="text-lg bg-black/50 text-white px-4 py-2 rounded-sm font-semibold absolute top-2 left-2 truncate z-40">
                        {robot.robotId.toUpperCase()}
                      </h2>
                    </div>
                    <div className="aspect-video w-full">
                      <VideoPlayer
                        ipAddress={robot.vpnIpAddress}
                        cameraFeedString={cameraFeed}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
