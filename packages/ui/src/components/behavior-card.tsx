import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle, Pause, Play, TrashIcon, XCircle } from "lucide-react";
import { Behavior } from "@swarmbotics/protos/sbai_behavior_protos/behavior_request";

import { Button } from "@/components/ui/button";
import { Loader } from "@/components/loader";
import type { ResolvedBehavior } from "@/hooks/use-behaviors";
import { useBehaviorControls } from "@/hooks/use-behavior-controls";
import { useTheme } from "@/providers/theme-provider";
import { useRobotSystemStore } from "@/stores/system-store";
import { BehaviorStatusUI } from "@/types/behavior";
import { cn } from "@/lib/utils";

export function BehaviorCard({ behavior }: { behavior: ResolvedBehavior }) {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const { behaviorId, robotId, status, request } = behavior;
  const { getSystemTable } = useRobotSystemStore();
  const {
    pauseBehavior,
    resumeBehavior,
    cancelBehavior,
    restartBehavior,
    loading,
  } = useBehaviorControls();

  const systemTable = getSystemTable(robotId);

  // Track pending state changes to extend loading until status updates
  const [pendingAction, setPendingAction] = useState<{
    type: "pause" | "resume" | "cancel" | "restart";
    expectedStatus?: BehaviorStatusUI;
    fromStatus: BehaviorStatusUI;
  } | null>(null);

  const previousStatusRef = useRef(status);

  // Clear pending action when status changes appropriately
  useEffect(() => {
    if (pendingAction && previousStatusRef.current !== status) {
      const { type, expectedStatus, fromStatus } = pendingAction;

      let shouldClearPending = false;

      switch (type) {
        case "pause":
          shouldClearPending = status === BehaviorStatusUI.PAUSED;
          break;
        case "resume":
          shouldClearPending = status === BehaviorStatusUI.ACTIVE;
          break;
        case "cancel":
          shouldClearPending = status === BehaviorStatusUI.CANCELED;
          break;
        case "restart":
          // Restart might go through multiple states, so we clear when it's active again
          // or if it goes to a different final state
          shouldClearPending =
            status === BehaviorStatusUI.ACTIVE ||
            status === BehaviorStatusUI.FAILED ||
            status === BehaviorStatusUI.CANCELED;
          break;
      }

      if (shouldClearPending) {
        setPendingAction(null);
      }
    }

    previousStatusRef.current = status;
  }, [status, pendingAction]);

  // Enhanced loading states that consider both HTTP loading and pending status changes
  const isLoading = {
    pause: loading.pause || pendingAction?.type === "pause",
    resume: loading.resume || pendingAction?.type === "resume",
    cancel: loading.cancel || pendingAction?.type === "cancel",
    restart: loading.restart || pendingAction?.type === "restart",
  };

  const handlePauseResume = async () => {
    const isPaused = behavior.status === BehaviorStatusUI.PAUSED;

    // Set pending action to track the expected state change
    setPendingAction({
      type: isPaused ? "resume" : "pause",
      expectedStatus: isPaused
        ? BehaviorStatusUI.ACTIVE
        : BehaviorStatusUI.PAUSED,
      fromStatus: status,
    });

    try {
      if (isPaused) {
        await resumeBehavior({
          behaviorRequestId: behaviorId,
          participatingRobotIds: [robotId],
        });
      } else {
        await pauseBehavior({
          behaviorRequestId: behaviorId,
          participatingRobotIds: [robotId],
        });
      }
    } catch (error) {
      // If the request fails, clear the pending action
      setPendingAction(null);
      throw error;
    }
  };

  const handleRestart = async () => {
    setPendingAction({
      type: "restart",
      fromStatus: status,
    });

    try {
      await restartBehavior({
        behaviorRequestId: behaviorId,
        participatingRobotIds: [robotId],
      });
    } catch (error) {
      setPendingAction(null);
      throw error;
    }
  };

  const handleCancel = async () => {
    setPendingAction({
      type: "cancel",
      expectedStatus: BehaviorStatusUI.CANCELED,
      fromStatus: status,
    });

    try {
      await cancelBehavior({
        behaviorRequestId: behaviorId,
        participatingRobotIds: [robotId],
      });
    } catch (error) {
      setPendingAction(null);
      throw error;
    }
  };

  return (
    <div key={behaviorId} className="w-full">
      <div
        className={cn(
          "flex justify-between items-center p-2 border rounded w-full",
          status === BehaviorStatusUI.NEEDS_INTERVENTION && "bg-red-200"
        )}
      >
        <div className="flex items-center gap-2">
          <div
            className={cn(
              "w-2 h-2 rounded-full",
              status === BehaviorStatusUI.ACTIVE && "bg-green-500",
              status === BehaviorStatusUI.ACCEPTED && "bg-orange-500",
              status === BehaviorStatusUI.PAUSED && "bg-yellow-600",
              status === BehaviorStatusUI.QUEUED && "bg-blue-500",
              status === BehaviorStatusUI.COMPLETED && "bg-gray-500",
              status === BehaviorStatusUI.CANCELED && "bg-red-500",
              status === BehaviorStatusUI.FAILED && "bg-red-500",
              status === BehaviorStatusUI.NEEDS_INTERVENTION && "bg-red-500",
              status === BehaviorStatusUI.UNSPECIFIED && "bg-gray-500"
            )}
          />
          <span className="text-sm font-bold">
            {request?.requestedBehavior === Behavior.BEHAVIOR_RALLY
              ? "Rally"
              : request?.requestedBehavior === Behavior.BEHAVIOR_SURROUND
              ? "Surround"
              : request?.requestedBehavior === Behavior.BEHAVIOR_DEFEND
              ? "Defend"
              : request?.requestedBehavior === Behavior.BEHAVIOR_PATROL
              ? "Patrol"
              : request?.requestedBehavior === Behavior.BEHAVIOR_AREA_COVERAGE
              ? "Area Coverage"
              : request?.requestedBehavior ===
                Behavior.BEHAVIOR_MULTI_WAYPOINT_NAVIGATION
              ? "Waypoint"
              : "Unknown"}
          </span>
          <span className="text-xs">
            {status === BehaviorStatusUI.NEEDS_INTERVENTION
              ? "Needs Intervention"
              : status}
          </span>
        </div>

        {status === BehaviorStatusUI.ACTIVE ||
        status === BehaviorStatusUI.ACCEPTED ||
        status === BehaviorStatusUI.PAUSED ? (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="w-8 h-8 p-0"
              disabled={
                isLoading.pause ||
                isLoading.resume ||
                systemTable?.controlling_device_id !== undefined
              }
              onClick={handlePauseResume}
            >
              {isLoading.pause || isLoading.resume ? (
                <Loader color={theme === "dark" ? "white" : "black"} />
              ) : (
                <>
                  {behavior.status === BehaviorStatusUI.PAUSED ? (
                    <Play className="h-4 w-4" />
                  ) : (
                    <Pause className="h-4 w-4" />
                  )}
                </>
              )}
            </Button>
            {/* <Button
              variant="outline"
              size="sm"
              className="w-8 h-8 p-0"
              disabled={isLoading.restart}
              onClick={handleRestart}
            >
              {isLoading.restart ? (
                <Loader color={theme === "dark" ? "white" : "black"} />
              ) : (
                <RefreshCwIcon className="h-4 w-4" />
              )}
            </Button> */}
            <Button
              variant="destructive"
              className="w-8 h-8 p-0"
              size="sm"
              disabled={isLoading.cancel}
              onClick={handleCancel}
            >
              {isLoading.cancel ? (
                <Loader color="white" />
              ) : (
                <TrashIcon className="h-4 w-4" />
              )}
            </Button>
          </div>
        ) : status === BehaviorStatusUI.QUEUED ? (
          <p className="text-sm text-gray-500">Waiting...</p>
        ) : status === BehaviorStatusUI.NEEDS_INTERVENTION ? (
          <Button
            variant="destructive"
            size="sm"
            className="!bg-red-600"
            onClick={() => {
              console.log(
                `Navigate to teleop for robot ${robotId} and behavior ${behaviorId}`
              );
              navigate(
                `/teleop?robot_id=${robotId}&intervention=true&behavior_id=${behaviorId}`
              );
            }}
          >
            Teleop
          </Button>
        ) : (
          <div className="flex items-center gap-1">
            {status === BehaviorStatusUI.COMPLETED ? (
              <CheckCircle className="text-green-500 h-4 w-4" />
            ) : status === BehaviorStatusUI.CANCELED ||
              status === BehaviorStatusUI.FAILED ? (
              <XCircle className="text-red-500 h-4 w-4" />
            ) : (
              <span className="text-gray-500">Waiting...</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
