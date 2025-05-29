import { useNavigate } from "react-router-dom";
import { ChevronLeft, CircleAlert, Joystick, Target } from "lucide-react";

import { Button } from "@/components/ui/button";
import { VideoPlayer } from "@/components/video-player";
import { useMapContext } from "@/providers/map-provider";
import { useRobotSystemStore } from "@/stores/system-store";
import { useRobotLocalizationStore } from "@/stores/localization-store";
import { OakState } from "@swarmbotics/protos/ros2_interfaces/sbai_protos/sbai_protos/oak_status";
import { type Robot } from "@/types/robot";

interface Props {
  robot: Robot;
  onBack: () => void;
  isBusy?: boolean;
}

export function RobotDetailPanel({ robot, onBack, isBusy = false }: Props) {
  const navigate = useNavigate();
  const { getSystemTable } = useRobotSystemStore();
  const { getLocalizationTable } = useRobotLocalizationStore();
  const { flyToRobot } = useMapContext();

  const systemTable = getSystemTable(robot.robotId);
  const localizationTable = getLocalizationTable(robot.robotId);

  return (
    <>
      <div className="flex items-center justify-between p-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="h-8 w-8"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-lg font-semibold uppercase w-full ml-2">
          {robot?.robotId}
        </h2>
      </div>
      <div className="flex flex-col relative p-2">
        <div className="flex-1 relative">
          <div className="relative h-48">
            {systemTable?.oak_status?.oakState === OakState.OAK_STATE_NORMAL ? (
              <VideoPlayer ipAddress={robot?.vpnIpAddress} />
            ) : (
              <div className="flex flex-col h-full items-center justify-center bg-muted rounded-sm">
                <CircleAlert className="text-yellow-500 h-8 w-8 mb-2" />
                <h2>Camera not operable</h2>
              </div>
            )}
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <Info
              label="Speed"
              value={
                Math.abs(
                  Number(
                    localizationTable?.localization_data?.bodySpeedMPerS ?? 0
                  )
                ).toFixed(1) + " mps"
              }
            />
            <Info
              label="Heading"
              value={
                localizationTable?.localization_data?.magneticHeadingDeg?.toFixed(
                  0
                ) + " deg"
              }
            />
            <Info
              label="Battery"
              value={
                systemTable?.battery_percentage?.batteryPercentage?.toFixed(0) +
                "%"
              }
            />
          </div>
        </div>
      </div>
      <div className="p-2 w-full absolute bottom-0 left-0 right-0 bg-zinc-200 dark:bg-black border-t border-muted">
        <Button
          size="icon"
          variant="outline"
          className="w-full mb-2"
          disabled={systemTable?.controlling_device_id !== undefined}
          onClick={() => {
            navigate(`/teleop?robot_id=${robot.robotId}`);
          }}
        >
          Teleop
          <Joystick className="h-4 w-4" />
        </Button>
        <Button
          size="icon"
          variant="outline"
          className="w-full mb-2"
          onClick={() => flyToRobot(robot)}
        >
          Fly to robot
          <Target className="h-4 w-4" />
        </Button>
      </div>
    </>
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
