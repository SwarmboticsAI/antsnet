import { useNavigate } from "react-router-dom";
import {
  AlertCircleIcon,
  CircleAlert,
  InfoIcon,
  Joystick,
  Locate,
  ParkingCircle,
} from "lucide-react";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { useMapContext } from "@/providers/map-provider";
import { useRobotSelection } from "@/providers/robot-selection-provider";
import { VideoPlayer } from "@/components/video-player";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getBatteryIcon } from "@/utils/get-battery-icon";
import { useRobotSystemStore } from "@/stores/system-store";
import { OakState } from "@swarmbotics/protos/ros2_interfaces/sbai_protos/sbai_protos/oak_status";
import { EmergencyStopState } from "@swarmbotics/protos/ros2_interfaces/sbai_protos/sbai_protos/emergency_stop_status";
import { type Robot } from "@/types/robot";
import { cn } from "@/lib/utils";

export function RobotListPanel({
  robots,
  onRobotClick,
}: {
  robots: Robot[];
  onRobotClick: (robotId: string) => void;
}) {
  const { systemTables } = useRobotSystemStore();
  const { selectedRobotIds, toggleRobotSelection } = useRobotSelection();
  const { flyToRobot } = useMapContext();
  const navigate = useNavigate();

  return (
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-1 overflow-auto px-2">
        {robots.length ? (
          robots.map((robot) => {
            const table = systemTables[robot.robotId];

            return (
              <Collapsible
                className={cn(
                  "border rounded-sm p-3 mt-2",
                  selectedRobotIds.includes(robot.robotId)
                    ? "border-yellow-600"
                    : ""
                )}
                key={robot.robotId}
              >
                <CollapsibleTrigger asChild>
                  <div
                    key={`robot-${robot.robotId}`}
                    className="flex flex-row justify-between gap-2 hover:bg-accent/10 cursor-pointer transition-colors w-full"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <Checkbox
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleRobotSelection(robot.robotId);
                        }}
                        checked={selectedRobotIds.includes(robot.robotId)}
                      />
                      <h3 className="font-bold flex items-center">
                        {robot.robotId?.toUpperCase()}{" "}
                      </h3>
                      <div className="flex items-center gap-1">
                        {getBatteryIcon(
                          systemTables[robot.robotId]?.battery_percentage
                            ?.batteryPercentage ?? 0
                        )}
                        <span className="text-xs">
                          {systemTables[
                            robot.robotId
                          ]?.battery_percentage?.batteryPercentage?.toFixed(0)}
                          %
                        </span>
                      </div>
                      <div>
                        <ParkingCircle
                          className={cn(
                            "w-4 h-4",
                            table?.emergency_stop_status?.emergencyStopState ===
                              EmergencyStopState.EMERGENCY_STOP_STATE_ENGAGED
                              ? "text-red-500"
                              : "text-zinc-800"
                          )}
                        />
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              size="icon"
                              className="h-8 w-8"
                              variant="outline"
                              disabled={
                                systemTables[robot.robotId]
                                  ?.controlling_device_id
                                  ?.controllingDeviceId !== undefined
                              }
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/teleop?robot_id=${robot.robotId}`);
                              }}
                            >
                              <Joystick className="h-3 w-3" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Teleop Robot</p>
                          </TooltipContent>
                        </Tooltip>

                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              size="icon"
                              className="h-8 w-8"
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation();
                                flyToRobot(robot);
                              }}
                            >
                              <Locate className="h-3 w-3" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Fly To Robot</p>
                          </TooltipContent>
                        </Tooltip>

                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              size="icon"
                              className="h-8 w-8"
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation();
                                onRobotClick(robot.robotId);
                              }}
                            >
                              <InfoIcon className="h-3 w-3" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>See Full Details</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="flex flex-col relative mt-4">
                    <div className="flex-1 relative">
                      <div className="relative h-48">
                        {table?.oak_status?.oakState ===
                        OakState.OAK_STATE_NORMAL ? (
                          <VideoPlayer ipAddress={robot?.vpnIpAddress} />
                        ) : (
                          <div className="flex flex-col h-full items-center justify-center bg-muted rounded-sm">
                            <CircleAlert className="text-yellow-500 h-8 w-8 mb-2" />
                            <h2>Camera not operable</h2>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center h-48">
            <AlertCircleIcon className="w-8 h-8 text-gray-500" />
            <p className="text-lg text-gray-500">No robots online</p>
          </div>
        )}
      </ScrollArea>
    </div>
  );
}

function Info({ label, value }: { label: string; value?: string }) {
  return (
    <div className="border rounded-sm p-4">
      <h4 className="text-xs font-semibold uppercase">{label}</h4>
      {value}
    </div>
  );
}
