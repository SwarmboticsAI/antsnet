"use client";

import { useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowRightFromLine,
  ChevronDown,
  ChevronRight,
  Clipboard,
  XIcon,
} from "lucide-react";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BoomButtonState } from "@/protos/generated/sbai_control_protos/sbai_control_protos/boom_button_status";
import { EmergencyStopState } from "@/protos/generated/sbai_control_protos/sbai_control_protos/emergency_stop_status";
import { OakState } from "@/protos/generated/sbai_perception_protos/sbai_perception_protos/oak_status";
import { ParkingBrakeState } from "@/protos/generated/sbai_tak_heartbeat_publisher_protos/sbai_tak_heartbeat_publisher_protos/to_tak_heartbeat";
import { useRobots } from "@/providers/robot-provider";
import type { Robot } from "@/types/Robot";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Sidebar } from "@/components/sidebar";

export default function RobotPage() {
  const { robotList: robots } = useRobots();
  const [search, setSearch] = useState("");

  const filteredRobots = useMemo(() => {
    return robots.filter((robot: Robot) =>
      robot.robotId.toLowerCase().includes(search.toLowerCase())
    );
  }, [robots, search]);

  return (
    <div className="overflow-hidden">
      <SidebarProvider>
        <Sidebar />
      </SidebarProvider>

      <div className="absolute w-full h-full top-0 left-0 pt-24 pl-20 bg-background">
        <div className="flex flex-col gap-4">
          <div className="relative w-1/3">
            {robots.length ? (
              <Input
                placeholder="Search robots..."
                className="pr-10" // make space for button
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
            filteredRobots.map((robot: Robot) => (
              <Collapsible
                key={robot.robotId}
                className="border border-muted rounded p-2 w-1/3"
              >
                <CollapsibleTrigger className="w-full flex items-center justify-between text-left text-lg font-semibold px-2 py-1 hover:bg-muted/50 rounded">
                  <span>{robot.robotId.toUpperCase()}</span>
                  <ChevronDown className="h-4 w-4 transition-transform data-[state=open]:rotate-180" />
                </CollapsibleTrigger>

                <CollapsibleContent className="mt-2 px-2">
                  <Table className="text-sm mb-2">
                    <TableBody>
                      <TableRow>
                        <TableCell className="font-medium">Latitude</TableCell>
                        <TableCell>
                          {robot.gpsCoordinates?.latitude.toFixed(7) ?? "n/a"}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Longitude</TableCell>
                        <TableCell>
                          {robot.gpsCoordinates?.longitude.toFixed(7) ?? "n/a"}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Heading</TableCell>
                        <TableCell>{robot.heading.toFixed(2)}°</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Speed</TableCell>
                        <TableCell>{robot.speed.toFixed(0)} m/s</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Battery</TableCell>
                        <TableCell>
                          {robot.battery != null
                            ? `${robot.battery.toFixed(0)}%`
                            : "n/a"}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">
                          Controlling
                        </TableCell>
                        <TableCell>
                          {robot.controllingTakId || "None"}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">
                          Oak Status
                        </TableCell>
                        <TableCell>
                          {robot.cameraStatus != null
                            ? OakState[robot.cameraStatus]
                            : "Unknown"}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">
                          Boom Button
                        </TableCell>
                        <TableCell>
                          {robot.boomButtonStatus != null
                            ? BoomButtonState[robot.boomButtonStatus]
                            : "Unknown"}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">
                          Parking Brake
                        </TableCell>
                        <TableCell>
                          {ParkingBrakeState[robot.parkingBrakeState] ??
                            "Unknown"}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">
                          Emergency Stop
                        </TableCell>
                        <TableCell>
                          {robot.emergencyStopStatus != null
                            ? EmergencyStopState[robot.emergencyStopStatus]
                            : "Unknown"}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                  <div className="flex bg-card justify-end gap-2">
                    <Button
                      className="my-2"
                      variant="outline"
                      onClick={() => {
                        const csv = `robotId,latitude,longitude,heading,speed,battery,vpnIpAddress,oakState,boomButtonState,parkingBrakeState,emergencyStopState\n${robot.robotId},${robot.gpsCoordinates?.latitude},${robot.gpsCoordinates?.longitude},${robot.heading},${robot.speed},${robot.battery},${robot.vpnIpAddress},${robot.cameraStatus},${robot.boomButtonStatus},${robot.parkingBrakeState},${robot.emergencyStopStatus}`;
                        const blob = new Blob([csv], { type: "text/csv" });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement("a");
                        a.href = url;
                        a.download = `${robot.robotId}.csv`;
                        a.click();
                        URL.revokeObjectURL(url);
                      }}
                    >
                      Export .CSV <ArrowRightFromLine className="ml-2" />
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
                      Copy contents <Clipboard className="ml-2" />
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
            ))
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
