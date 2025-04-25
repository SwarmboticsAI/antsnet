"use client";
export const dynamic = "force-dynamic";

import { useState } from "react";
import screenfull from "screenfull";

import VideoStreamPlayer from "@/components/video-player";
import { useRobots } from "@/providers/robot-provider";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Robot } from "@/types/Robot";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Sidebar } from "@/components/sidebar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";

export default function VideosPage() {
  const { robotList: robots } = useRobots();
  const [selectedRobots, setSelectedRobots] = useState<Set<string>>(new Set());
  const [cameraFeed, setCameraFeed] = useState<string>("color/low");

  const handleToggle = (robotId: string) => {
    setSelectedRobots((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(robotId)) {
        newSet.delete(robotId);
      } else {
        newSet.add(robotId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    setSelectedRobots(new Set(robots.map((r: Robot) => r.robotId)));
  };

  const handleClearAll = () => {
    setSelectedRobots(new Set());
  };

  const maxDisplay = 6;
  const selected = robots.filter((r: Robot) => selectedRobots.has(r.robotId));
  const displayed = selected.slice(0, maxDisplay);
  const columnCount = displayed.length <= 1 ? 1 : displayed.length <= 4 ? 2 : 3;

  return (
    <>
      <SidebarProvider>
        <Sidebar />
      </SidebarProvider>
      <div className="absolute w-full h-full top-0 left-0 pt-0 pl-15 bg-background">
        <div className="flex flex-col h-screen overflow-hidden pt-22 p-4">
          {/* Top: Controls */}
          <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
            <div className="flex gap-4 flex-wrap">
              {robots.map((robot: Robot) => (
                <div
                  key={robot.robotId}
                  className="flex items-center space-x-2"
                >
                  <Checkbox
                    id={robot.robotId}
                    checked={selectedRobots.has(robot.robotId)}
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

          {/* Bottom: Grid */}
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
                      <h2 className="text-sm font-semibold uppercase absolute top-4 left-4 truncate w-full">
                        {robot.robotId}
                      </h2>
                      <Button
                        size="sm"
                        variant="default"
                        className="absolute top-4 right-4"
                        onClick={() => {
                          const el = document.getElementById(
                            `video-${robot.robotId}`
                          );
                          if (screenfull.isEnabled && el)
                            screenfull.request(el);
                        }}
                      >
                        Fullscreen
                      </Button>
                    </div>
                    <div className="aspect-video w-full">
                      <VideoStreamPlayer
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
