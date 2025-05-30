import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle, Pause, Play, TrashIcon, XCircle } from "lucide-react";
import { Behavior } from "@swarmbotics/protos/sbai_behavior_protos/behavior_request";
import { ActiveBehaviorStatus } from "@swarmbotics/protos/ros2_interfaces/sbai_protos/sbai_protos/active_behavior_states";
import { BehaviorResult } from "@swarmbotics/protos/ros2_interfaces/sbai_protos/sbai_protos/completed_behaviors";

import { Button } from "@/components/ui/button";
import { Loader } from "@/components/loader";
import { useBehaviorControls } from "@/hooks/use-behavior-controls";
import { useTheme } from "@/providers/theme-provider";
import { useRobotSystemStore } from "@/stores/system-store";
import { cn } from "@/lib/utils";
import type { BehaviorRequest } from "@swarmbotics/protos/sbai_protos/behavior_request";

interface RobotBehaviorInfo {
  robotId: string;
  state: "active" | "queued" | "completed";
  status?: ActiveBehaviorStatus;
  result?: BehaviorResult;
  behaviorKey?: string;
}

interface AggregatedBehavior {
  behaviorRequest: BehaviorRequest;
  robots: RobotBehaviorInfo[];
}

interface AggregatedBehaviorCardProps {
  behaviorId: string;
  behavior: AggregatedBehavior;
}

export function BehaviorCard({
  behaviorId,
  behavior,
}: AggregatedBehaviorCardProps) {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const { getSystemTable } = useRobotSystemStore();
  const [isExpanded, setIsExpanded] = useState(false);

  const { pauseBehavior, resumeBehavior, cancelBehavior, loading } =
    useBehaviorControls();

  // Calculate overall behavior status
  const getOverallStatus = () => {
    const activeRobots = behavior.robots.filter((r) => r.state === "active");
    const queuedRobots = behavior.robots.filter((r) => r.state === "queued");
    const completedRobots = behavior.robots.filter(
      (r) => r.state === "completed"
    );

    if (activeRobots.length === 0 && queuedRobots.length === 0) {
      return "completed";
    }

    if (activeRobots.length === 0 && queuedRobots.length > 0) {
      return "queued";
    }

    const runningCount = activeRobots.filter(
      (r) => r.status === ActiveBehaviorStatus.ACTIVE_BEHAVIOR_STATUS_RUNNING
    ).length;
    const pausedCount = activeRobots.filter(
      (r) => r.status === ActiveBehaviorStatus.ACTIVE_BEHAVIOR_STATUS_PAUSED
    ).length;
    const interventionCount = activeRobots.filter(
      (r) =>
        r.status ===
        ActiveBehaviorStatus.ACTIVE_BEHAVIOR_STATUS_PAUSED_NEEDS_INTERVENTION
    ).length;

    if (interventionCount > 0) return "needs_intervention";
    if (pausedCount > 0 && runningCount > 0) return "mixed";
    if (pausedCount > 0) return "paused";
    return "running";
  };

  const overallStatus = getOverallStatus();
  const activeRobots = behavior.robots.filter((r) => r.state === "active");
  const allRobotIds = behavior.robots.map((r) => r.robotId);

  const getBehaviorDisplayName = () => {
    switch (behavior.behaviorRequest.requestedBehavior) {
      case Behavior.BEHAVIOR_RALLY:
        return "Rally";
      case Behavior.BEHAVIOR_SURROUND:
        return "Surround";
      case Behavior.BEHAVIOR_DEFEND:
        return "Defend";
      case Behavior.BEHAVIOR_PATROL:
        return "Patrol";
      case Behavior.BEHAVIOR_AREA_COVERAGE:
        return "Area Coverage";
      case Behavior.BEHAVIOR_MULTI_WAYPOINT_NAVIGATION:
        return "Waypoint";
      default:
        return "Unknown";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "running":
        return "bg-green-500";
      case "paused":
        return "bg-yellow-600";
      case "mixed":
        return "bg-orange-500";
      case "needs_intervention":
        return "bg-red-500";
      case "queued":
        return "bg-blue-500";
      case "completed":
        return "bg-gray-500";
      default:
        return "bg-gray-500";
    }
  };

  const getRobotStatusColor = (robot: RobotBehaviorInfo) => {
    if (robot.state === "completed") {
      return robot.result === BehaviorResult.BEHAVIOR_RESULT_SUCCESS
        ? "bg-green-500"
        : "bg-red-500";
    }
    if (robot.state === "queued") return "bg-blue-500";

    switch (robot.status) {
      case ActiveBehaviorStatus.ACTIVE_BEHAVIOR_STATUS_RUNNING:
        return "bg-green-500";
      case ActiveBehaviorStatus.ACTIVE_BEHAVIOR_STATUS_PAUSED:
        return "bg-yellow-600";
      case ActiveBehaviorStatus.ACTIVE_BEHAVIOR_STATUS_PAUSED_NEEDS_INTERVENTION:
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getRobotStatusText = (robot: RobotBehaviorInfo) => {
    if (robot.state === "completed") {
      return robot.result === BehaviorResult.BEHAVIOR_RESULT_SUCCESS
        ? "Completed"
        : "Failed";
    }
    if (robot.state === "queued") return "Queued";

    switch (robot.status) {
      case ActiveBehaviorStatus.ACTIVE_BEHAVIOR_STATUS_RUNNING:
        return "Running";
      case ActiveBehaviorStatus.ACTIVE_BEHAVIOR_STATUS_PAUSED:
        return "Paused";
      case ActiveBehaviorStatus.ACTIVE_BEHAVIOR_STATUS_PAUSED_NEEDS_INTERVENTION:
        return "Needs Intervention";
      default:
        return "Unknown";
    }
  };

  const handlePauseAll = async () => {
    await pauseBehavior({
      behaviorRequestId: behaviorId,
      participatingRobotIds: allRobotIds,
    });
  };

  const handleResumeAll = async () => {
    await resumeBehavior({
      behaviorRequestId: behaviorId,
      participatingRobotIds: allRobotIds,
    });
  };

  const handleCancelAll = async () => {
    await cancelBehavior({
      behaviorRequestId: behaviorId,
      participatingRobotIds: allRobotIds,
    });
  };

  const handlePauseRobot = async (robotId: string) => {
    await pauseBehavior({
      behaviorRequestId: behaviorId,
      participatingRobotIds: [robotId],
    });
  };

  const handleResumeRobot = async (robotId: string) => {
    await resumeBehavior({
      behaviorRequestId: behaviorId,
      participatingRobotIds: [robotId],
    });
  };

  const handleCancelRobot = async (robotId: string) => {
    await cancelBehavior({
      behaviorRequestId: behaviorId,
      participatingRobotIds: [robotId],
    });
  };

  const canControlBehavior =
    overallStatus === "running" ||
    overallStatus === "paused" ||
    overallStatus === "mixed";

  return (
    <div className="w-full border rounded">
      {/* Main behavior header */}
      <div
        className={cn(
          "flex justify-between items-center p-2",
          overallStatus === "needs_intervention" && "bg-red-50"
        )}
      >
        <div
          className="flex items-center gap-2 cursor-pointer flex-1"
          onClick={() => {
            setIsExpanded(!isExpanded);
          }}
        >
          <div
            className={cn(
              "w-2.5 h-2.5 rounded-full",
              getStatusColor(overallStatus)
            )}
          />

          <div>
            <span className="font-semibold text-sm">
              {getBehaviorDisplayName()}
            </span>
            <div className="text-xs text-gray-600">
              {behavior.robots.length} robot
              {behavior.robots.length !== 1 ? "s" : ""} •{" "}
              {overallStatus.replace("_", " ")}
            </div>
          </div>
        </div>

        {/* Overall behavior controls */}
        {canControlBehavior && (
          <div className="flex items-center gap-2">
            {(overallStatus === "running" || overallStatus === "mixed") && (
              <Button
                variant="outline"
                size="sm"
                className="w-8 h-8 p-0"
                disabled={loading.pause}
                onClick={handlePauseAll}
              >
                {loading.pause ? (
                  <Loader color={theme === "dark" ? "white" : "black"} />
                ) : (
                  <Pause className="h-4 w-4" />
                )}
              </Button>
            )}

            {(overallStatus === "paused" || overallStatus === "mixed") && (
              <Button
                variant="outline"
                size="sm"
                className="w-8 h-8 p-0"
                disabled={loading.resume}
                onClick={handleResumeAll}
              >
                {loading.resume ? (
                  <Loader color={theme === "dark" ? "white" : "black"} />
                ) : (
                  <Play className="h-4 w-4" />
                )}
              </Button>
            )}

            <Button
              variant="destructive"
              className="w-8 h-8 p-0"
              size="sm"
              disabled={loading.cancel}
              onClick={handleCancelAll}
            >
              {loading.cancel ? (
                <Loader color="white" />
              ) : (
                <TrashIcon className="h-4 w-4" />
              )}
            </Button>
          </div>
        )}

        {overallStatus === "needs_intervention" && (
          <Button
            variant="destructive"
            size="sm"
            className="!bg-red-600"
            onClick={() => {
              // Navigate to first robot that needs intervention
              const robotNeedingIntervention = behavior.robots.find(
                (r) =>
                  r.status ===
                  ActiveBehaviorStatus.ACTIVE_BEHAVIOR_STATUS_PAUSED_NEEDS_INTERVENTION
              );
              if (robotNeedingIntervention) {
                navigate(
                  `/teleop?robot_id=${robotNeedingIntervention.robotId}&intervention=true&behavior_id=${behaviorId}`
                );
              }
            }}
          >
            Teleop
          </Button>
        )}
      </div>

      {/* Expanded robot details */}
      {isExpanded && (
        <div className="border-t">
          {behavior.robots.map((robot) => {
            const systemTable = getSystemTable(robot.robotId);
            const canControlRobot =
              robot.state === "active" &&
              (robot.status ===
                ActiveBehaviorStatus.ACTIVE_BEHAVIOR_STATUS_RUNNING ||
                robot.status ===
                  ActiveBehaviorStatus.ACTIVE_BEHAVIOR_STATUS_PAUSED);

            return (
              <div
                key={robot.robotId}
                className="flex justify-between items-center p-2"
              >
                <div className="flex items-center gap-2">
                  <div
                    className={cn(
                      "w-2 h-2 rounded-full",
                      getRobotStatusColor(robot)
                    )}
                  />
                  <span className="text-sm font-medium">{robot.robotId}</span>
                  <span className="text-xs text-gray-600">
                    {getRobotStatusText(robot)}
                  </span>
                </div>

                {canControlRobot && (
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-6 h-6 p-0"
                      disabled={
                        loading.pause ||
                        loading.resume ||
                        systemTable?.controlling_device_id !== undefined
                      }
                      onClick={() => {
                        if (
                          robot.status ===
                          ActiveBehaviorStatus.ACTIVE_BEHAVIOR_STATUS_PAUSED
                        ) {
                          handleResumeRobot(robot.robotId);
                        } else {
                          handlePauseRobot(robot.robotId);
                        }
                      }}
                    >
                      {robot.status ===
                      ActiveBehaviorStatus.ACTIVE_BEHAVIOR_STATUS_PAUSED ? (
                        <Play className="h-3 w-3" />
                      ) : (
                        <Pause className="h-3 w-3" />
                      )}
                    </Button>

                    <Button
                      variant="destructive"
                      className="w-6 h-6 p-0"
                      size="sm"
                      disabled={loading.cancel}
                      onClick={() => handleCancelRobot(robot.robotId)}
                    >
                      <TrashIcon className="h-3 w-3" />
                    </Button>
                  </div>
                )}

                {robot.status ===
                  ActiveBehaviorStatus.ACTIVE_BEHAVIOR_STATUS_PAUSED_NEEDS_INTERVENTION && (
                  <Button
                    variant="destructive"
                    size="sm"
                    className="!bg-red-600 text-xs px-2 py-1 h-6"
                    onClick={() => {
                      navigate(
                        `/teleop?robot_id=${robot.robotId}&intervention=true&behavior_id=${behaviorId}`
                      );
                    }}
                  >
                    Teleop
                  </Button>
                )}

                {robot.state === "completed" && (
                  <div className="flex items-center gap-1">
                    {robot.result === BehaviorResult.BEHAVIOR_RESULT_SUCCESS ? (
                      <CheckCircle className="text-green-500 h-4 w-4" />
                    ) : (
                      <XCircle className="text-red-500 h-4 w-4" />
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
