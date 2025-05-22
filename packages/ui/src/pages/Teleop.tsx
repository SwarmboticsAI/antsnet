import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { VideoPlayer } from "@/components/video-player";
import { Button } from "@/components/ui/button";
import { RobotMap } from "@/components/map";
import { useTeleopControls } from "@/hooks/use-teleop-controls";
import { useTeleopControl } from "@/hooks/use-teleop-control"; // Import our new hook
import { useTeleop } from "@/providers/teleop-provider";
import { useRobotStore } from "@/stores/robot-store";
import { getBatteryIcon } from "@/utils/get-battery-icon";
import { type Robot } from "@/types/robot";
import { cn } from "@/lib/utils";

export function Teleop() {
  const isUnmounted = useRef(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { sortedRobots: robots } = useRobotStore();
  const [showResumeBehaviorDialog, setShowResumeBehaviorDialog] =
    useState(false);

  const { state } = useTeleop();

  const robotId = searchParams.get("robot_id");
  const interventionFlag = searchParams.get("intervention") === "true";
  const behaviorId = searchParams.get("behavior_id");

  const robot = useMemo(
    () => robots.find((r: Robot) => r.robotId === robotId),
    [robots, robotId]
  );

  const normalizedHeading = (((robot?.heading ?? 0) % 360) + 360) % 360;

  const getCardinalDirection = (degrees: number) => {
    const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
    const index = Math.round(degrees / 45) % 8;
    return directions[index];
  };

  const direction = getCardinalDirection(normalizedHeading);

  const {
    isControlling,
    error: teleopError,
    startControl,
    stopControl,
    sendTeleopCommand,
  } = useTeleopControl();

  useEffect(() => {
    const initializeTeleop = async () => {
      setIsInitializing(true);
      try {
        await startControl(robotId ?? "");
        setIsConnected(true);
      } catch (err) {
        console.error("Failed to start teleop control:", err);
        setIsConnected(false);
      } finally {
        setIsInitializing(false);
      }
    };

    initializeTeleop();

    return () => {
      isUnmounted.current = true;
    };
  }, []);

  const handleTeleopCommand = useCallback(
    (throttle: number, steering: number) => {
      if (isExiting) return;

      if (true) {
        sendTeleopCommand(throttle, steering);
      }
    },
    [isExiting, state, isControlling, sendTeleopCommand]
  );

  const { throttle: localThrottle, resetControls } = useTeleopControls(
    70,
    handleTeleopCommand,
    1
  );

  const handleExitTeleop = () => {
    if (interventionFlag && behaviorId) {
      setShowResumeBehaviorDialog(true);
    } else {
      handleExit();
    }
  };

  const handleExit = async () => {
    setIsExiting(true);
    resetControls();

    try {
      await stopControl(robotId ?? "");
    } catch (err) {
      console.error("Error stopping teleop control:", err);
    }

    // Original exit logic
    setTimeout(() => {
      navigate("/");
    }, 100);
  };

  return (
    <div className="w-full h-svh bg-black text-white relative overflow-hidden">
      <div className="h-full">
        <div className="absolute top-15 left-0 right-0 w-full h-full">
          {robot?.vpnIpAddress && (
            <VideoPlayer ipAddress={robot.vpnIpAddress} />
          )}
        </div>

        <div
          className={cn(
            "absolute bottom-4 left-4 text-sm px-3 py-1 rounded",
            isConnected
              ? "bg-green-500 text-green-100"
              : isInitializing
              ? "bg-yellow-500 text-yellow-100"
              : "bg-red-500 text-red-100"
          )}
        >
          {isConnected
            ? "Connected"
            : isInitializing
            ? "Connecting..."
            : "Disconnected"}
        </div>

        {teleopError && (
          <div className="absolute bottom-12 left-4 text-sm px-3 py-1 rounded bg-red-500 text-red-100">
            Error: {teleopError}
          </div>
        )}

        <div className="absolute flex flex-col items-center justify-start pt-5 bottom-0 left-1/2 translate-y-1/2 -translate-x-1/2 h-72 bg-black/50 rounded-full w-120 border-4 border-muted/50 shadow-2xl">
          <h1 className="text-8xl">
            {robot?.speed
              ? Math.abs(robot.speed) < 0.05
                ? "0.0"
                : robot.speed.toFixed(1)
              : "0.0"}
          </h1>
          <div className="absolute right-20 top-20">
            {getBatteryIcon(robot?.battery ?? 0)}
          </div>
          <div className="absolute top-20 left-20 text-sm">{direction}</div>
          <div className="absolute -translate-y-1/2 top-1/2 left-0 w-full h-5 bg-muted">
            <div
              className="transition-all duration-100 ease-out"
              style={{
                width: `${Math.abs(localThrottle) * 100}%`,
                height: "100%",
                backgroundColor: "green",
              }}
            />
          </div>
        </div>

        <div className="absolute top-28 right-0 w-64 h-64 rounded-tl-4xl rounded-bl-4xl overflow-hidden opacity-65 pointer-events-none">
          <RobotMap robots={robots} />
        </div>

        <Button
          className="absolute bottom-4 right-4 bg-blue-500 hover:bg-blue-400 text-white"
          onClick={handleExitTeleop}
          size="lg"
          disabled={isExiting}
        >
          {isExiting ? "Exiting..." : "Exit Teleop"}
        </Button>

        <ExitTeleopDialog
          isOpen={showResumeBehaviorDialog}
          setIsOpen={setShowResumeBehaviorDialog}
          interventionFlag={interventionFlag}
          behaviorId={behaviorId}
          resetControls={resetControls}
          onExit={handleExit}
        />
      </div>
    </div>
  );
}

export function ExitTeleopDialog({
  isOpen,
  setIsOpen,
  interventionFlag,
  behaviorId,
  resetControls,
  onExit,
}: {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  interventionFlag: boolean;
  behaviorId: string | null;
  resetControls: () => void;
  onExit: () => void;
}) {
  const [isExiting, setIsExiting] = useState(false);

  const handleExitWithoutResume = () => {
    performExit(false);
  };

  const handleExitWithResume = () => {
    performExit(true);
  };

  const performExit = (shouldResumeBehavior: boolean) => {
    setIsExiting(true);
    resetControls();

    if (shouldResumeBehavior && behaviorId) {
      try {
      } catch (error) {
        console.error("Error resuming behavior:", error);
      }
    }

    if (!shouldResumeBehavior && behaviorId) {
      try {
      } catch (error) {
        console.error("Error canceling behavior:", error);
      }
    }

    onExit();
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Exit Teleop</AlertDialogTitle>
          <AlertDialogDescription>
            This robot was manually teleoped while a swarm behavior was active.
            Do you want the robot to resume its part in the swarm behavior, or
            is that behavior finished?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          {interventionFlag && behaviorId ? (
            <>
              <AlertDialogAction
                onClick={handleExitWithoutResume}
                disabled={isExiting}
                className="bg-red-500 hover:bg-red-600 text-white"
              >
                End Behavior
              </AlertDialogAction>
              <AlertDialogAction
                onClick={handleExitWithResume}
                disabled={isExiting}
                className="bg-primary text-primary-foreground"
              >
                Resume Behavior
              </AlertDialogAction>
            </>
          ) : (
            <AlertDialogAction
              onClick={handleExitWithoutResume}
              disabled={isExiting}
            >
              Exit
            </AlertDialogAction>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
