import { useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowRightFromLine,
  ChevronDown,
  ChevronRight,
  Clipboard,
  XIcon,
} from "lucide-react";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible";

import { DebugTabs } from "@/components/debug-tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { BoomButtonState } from "@swarmbotics/protos/ros2_interfaces/sbai_control_protos/sbai_control_protos/boom_button_status";
import { EmergencyStopState } from "@swarmbotics/protos/ros2_interfaces/sbai_control_protos/sbai_control_protos/emergency_stop_status";
import { OakState } from "@swarmbotics/protos/ros2_interfaces/sbai_perception_protos/sbai_perception_protos/oak_status";
import { CanState } from "@swarmbotics/protos/ros2_interfaces/sbai_control_protos/sbai_control_protos/can_status";
import { ParkingBrakeState } from "@swarmbotics/protos/ros2_interfaces/sbai_tak_heartbeat_publisher_protos/sbai_tak_heartbeat_publisher_protos/to_tak_heartbeat";
import { TerrainMapHealthStatus } from "@swarmbotics/protos/ros2_interfaces/sbai_perception_protos/sbai_perception_protos/terrain_map_status";
import { StarlinkState } from "@swarmbotics/protos/ros2_interfaces/sbai_network_protos/sbai_network_protos/starlink_status";

import { useRobotStore } from "@/stores/robot-store";
import type { Robot } from "@/types/robot";

export function Debug() {
  const { sortedRobots: robots } = useRobotStore();
  const [search, setSearch] = useState("");

  const filteredRobots = useMemo(() => {
    return robots.filter((robot: Robot) =>
      robot.robotId?.toLowerCase().includes(search?.toLowerCase())
    );
  }, [robots, search]);

  return (
    <div className="w-full mx-auto">
      <section className="pt-21 bg-zinc-200 dark:bg-zinc-800 flex flex-col items-center justify-between mb-6">
        <h1 className="text-2xl font-bold mb-6">Robot Data</h1>
      </section>
      <div className="w-full max-w-5xl mx-auto pt-6">
        <div className="flex flex-col gap-4">
          <div className="relative w-full">
            {robots.length ? (
              <Input
                placeholder="Search robots..."
                className="pr-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            ) : null}
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute cursor-pointer right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <XIcon className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {robots.length ? (
            filteredRobots.map((robot: Robot) => {
              return (
                <Collapsible
                  key={robot.robotId}
                  className="border border-muted rounded p-2 w-full"
                >
                  <CollapsibleTrigger className="w-full flex items-center justify-between text-left text-lg font-semibold px-2 py-1 rounded">
                    <div className="flex items-center gap-2">
                      <span>{robot.robotId.toUpperCase()}</span>
                    </div>
                    <ChevronDown className="h-4 w-4 transition-transform data-[state=open]:rotate-180" />
                  </CollapsibleTrigger>

                  <CollapsibleContent className="mt-2 px-2">
                    <DebugTabs robot={robot} />

                    <div className="flex bg-card justify-end gap-2 mt-4">
                      <Button
                        className="my-2"
                        variant="outline"
                        onClick={() => {
                          // Map enum values to readable strings
                          const getEnumString = (
                            enumObj: any,
                            value: number | undefined
                          ) => {
                            if (value === undefined || value === null)
                              return "";
                            return enumObj[value] || value;
                          };

                          // Convert robot object to CSV with readable values
                          const robotData = {
                            robotId: robot.robotId,
                            platformType: robot.platformType,
                            ipAddress: robot.ipAddress,
                            vpnIpAddress: robot.vpnIpAddress,
                            lastSeen: robot.lastSeen
                              ? new Date(robot.lastSeen).toISOString()
                              : "",
                          };

                          // Get all keys
                          const keys = Object.keys(robotData);

                          // Create CSV header
                          let csv = keys.join(",") + "\n";

                          // Create CSV row
                          const row = keys
                            .map((key) => {
                              const value =
                                robotData[key as keyof typeof robotData];
                              if (value === null || value === undefined)
                                return "";
                              if (typeof value === "object")
                                return JSON.stringify(value);

                              // Quote strings that contain commas to avoid CSV parsing issues
                              if (
                                typeof value === "string" &&
                                value.includes(",")
                              ) {
                                return `"${value}"`;
                              }

                              return value;
                            })
                            .join(",");

                          csv += row;

                          // Download CSV
                          const blob = new Blob([csv], { type: "text/csv" });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement("a");
                          a.href = url;
                          a.download = `${robot.robotId}_full.csv`;
                          a.click();
                          URL.revokeObjectURL(url);
                        }}
                      >
                        Export Full .CSV <ArrowRightFromLine className="ml-2" />
                      </Button>
                      <Button
                        className="my-2"
                        variant="outline"
                        onClick={() => {
                          navigator.clipboard.writeText(
                            JSON.stringify(robot, null, 2)
                          );
                        }}
                      >
                        Copy JSON <Clipboard className="ml-2" />
                      </Button>
                      <Button
                        className="my-2"
                        onClick={() => {
                          window.open(
                            `http://${robot.vpnIpAddress}:8123`,
                            "_blank"
                          );
                        }}
                      >
                        Go to DART <ChevronRight className="ml-2" />
                      </Button>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              );
            })
          ) : (
            <div className="flex flex-col h-full items-center justify-center gap-2 pt-24">
              <AlertCircle className="h-12 w-12 text-muted-foreground" />
              <div className="text-muted-foreground text-2xl">
                No robots found
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
