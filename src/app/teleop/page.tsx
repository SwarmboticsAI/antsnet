"use client";

import { useMemo, useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import VideoStreamPlayer from "@/components/video-player";
import { Button } from "@/components/ui/button";
import { RobotMap } from "@/components/map";
import { useTeleopControls } from "@/hooks/use-teleop-controls";
import { useRobots } from "@/providers/robot-provider";
import { useTeleop } from "@/providers/teleop-provider";
import { useSessions } from "@/providers/session-provider";
import { useZenoh } from "@/providers/zenoh-provider";
import { cn } from "@/lib/utils";
import { getBatteryIcon } from "@/utils/get-battery-icon";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useProfile } from "@/providers/profile-provider";

export default function TeleopPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { profile } = useProfile();
  const robotId = searchParams.get("robot_id");
  const { getRobotById } = useRobots();
  const { hasActiveSession, requestSession } = useSessions();
  const { startTeleop, stopTeleop, sendCommand, state } = useTeleop();
  const { isConnected: isZenohConnected } = useZenoh();
  const [isInitializing, setIsInitializing] = useState(false);
  const [showSessionAlert, setShowSessionAlert] = useState(false);
  const [isStartingSession, setIsStartingSession] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const sessionStartAttempted = useRef(false);

  // Keep track of whether the component has been unmounted
  const isUnmounted = useRef(false);

  const robot = useMemo(() => {
    if (!robotId) return null;
    return getRobotById(robotId);
  }, [robotId, getRobotById]);

  // Create a teleop send command wrapper that prevents sending commands during exit
  interface TeleopCommand {
    throttle: number;
    steering: number;
  }

  const sendTeleopCommand = (t: number, s: number): void => {
    if (isExiting) {
      // Don't send commands during exit process
      return;
    }

    if (state === "active") {
      sendCommand(t, s);
    }
  };

  const { throttle, steering, resetControls } = useTeleopControls(
    70,
    sendTeleopCommand,
    0.5
  );

  // Separate effect for starting the session - now depends on Zenoh connection
  useEffect(() => {
    if (
      !robotId ||
      sessionStartAttempted.current ||
      isStartingSession ||
      !isZenohConnected
    )
      return;

    // Check if we need to start a session
    if (!hasActiveSession(robotId)) {
      // Auto-start the session
      const startSession = async () => {
        sessionStartAttempted.current = true;
        setIsStartingSession(true);

        try {
          console.log("Auto-starting session for robot:", robotId);
          await requestSession(robotId, profile?.takId ?? "default-tak-id");
          console.log("Session started successfully");
        } catch (error) {
          console.error("Error auto-starting session:", error);
          // If auto-start fails, show the dialog to let the user try manually
          sessionStartAttempted.current = false; // Reset so we can try again
          setShowSessionAlert(true);
        } finally {
          setIsStartingSession(false);
        }
      };

      setTimeout(() => {
        startSession();
      }, 500);
    }
  }, [
    robotId,
    hasActiveSession,
    requestSession,
    profile?.takId,
    isZenohConnected,
    isExiting,
  ]);

  // Setup for teleop
  useEffect(() => {
    if (!robotId || !hasActiveSession(robotId) || isInitializing || isExiting)
      return;

    const initTeleop = async () => {
      if (isUnmounted.current) return;
      setIsInitializing(true);

      try {
        await startTeleop(robotId);
      } catch (error) {
        console.error("Error starting teleop:", error);
      } finally {
        if (!isUnmounted.current) {
          setIsInitializing(false);
        }
      }
    };

    initTeleop();
  }, [robotId, hasActiveSession, startTeleop, isExiting]);

  // SINGLE cleanup useEffect with empty dependency array
  // This ensures it ONLY runs on unmount, not on re-renders or dependency changes
  useEffect(() => {
    // Reference to keep track of cleanup state
    const isExitingRef = { current: false };

    // This return function ONLY runs on unmount
    return () => {
      // Avoid running cleanup more than once
      if (isExitingRef.current) return;
      isExitingRef.current = true;

      console.log("Component unmounting, cleaning up teleop");
      isUnmounted.current = true;

      // First, do a proper stop - send a zero command to stop the robot
      if (state === "active") {
        console.log("Sending final stop command");
        sendCommand(0, 0);
      }

      // Then wait a moment to ensure the command is processed
      setTimeout(() => {
        // Now do a clean shutdown of teleop
        resetControls();

        if (robotId) {
          console.log("Stopping teleop session");
          stopTeleop().catch((error) => {
            console.error("Error stopping teleop during cleanup:", error);
          });
        }
      }, 100);
    };
  }, []); // Empty dependency array means this only runs on mount/unmount

  const isConnected = state === "active";
  const isConnecting = state === "requesting" || isInitializing;

  // Set up a proper exit sequence
  const handleExit = () => {
    setIsExiting(true);

    // First, stop the robot movement
    resetControls();

    // Send an explicit stop command
    if (state === "active") {
      sendCommand(0, 0);
    }

    // Wait briefly to ensure stop command is processed
    setTimeout(() => {
      // Then stop teleop
      stopTeleop().finally(() => {
        // Finally navigate away
        router.back();
      });
    }, 100);
  };

  const handleStartSession = async () => {
    if (!robotId) return;

    setIsStartingSession(true);
    try {
      await requestSession(robotId, profile?.takId ?? "default-tak-id");
    } catch (error) {
      console.error("Error starting session:", error);
    } finally {
      setIsStartingSession(false);
    }
  };

  return (
    <div className="w-full h-svh bg-black text-white relative overflow-hidden">
      <div className="h-full">
        <div className="absolute top-15 left-0 w-full h-full bg-blue-900">
          {robot?.vpnIpAddress && (
            <VideoStreamPlayer ipAddress={robot.vpnIpAddress} />
          )}
        </div>

        <div
          className={cn(
            "absolute top-20 left-4 text-sm px-3 py-1 rounded",
            isConnected
              ? "bg-green-500 text-green-100"
              : isConnecting
              ? "bg-yellow-500 text-yellow-100"
              : "bg-red-500 text-red-100"
          )}
        >
          {isConnected ? (
            <span className="text-green-100">Connected</span>
          ) : isConnecting ? (
            <span className="text-yellow-100">Connecting...</span>
          ) : (
            <span className="text-red-100">Disconnected</span>
          )}
        </div>

        <div className="absolute flex flex-col items-center justify-start pt-5 bottom-0 left-1/2 translate-y-1/2 -translate-x-1/2 h-72 bg-black/50 rounded-full w-120 border-4 border-muted/50 shadow-2xl">
          <h1 className="text-8xl">{robot?.speed?.toFixed(1)}</h1>
          <div className="absolute right-20 top-20">
            {getBatteryIcon(robot?.battery ?? 0)}
          </div>

          <div className="absolute  -translate-y-1/2 top-1/2 left-0 w-full h-5 bg-muted">
            <div
              className="transition-all duration-100 ease-out"
              style={{
                width: `${Math.abs(throttle) * 100}%`,
                height: "100%",
                backgroundColor: "green",
              }}
            />
          </div>
        </div>

        {/* <div className="absolute top-22 right-0 w-64 h-64 rounded-tl-4xl rounded-bl-4xl overflow-hidden opacity-65 pointer-events-none">
          <RobotMap robots={[]} />
        </div> */}

        <Button
          className="absolute top-28 left-4 bg-red-500"
          variant="destructive"
          onClick={handleExit}
          disabled={isExiting}
        >
          {isExiting ? "Exiting..." : "Exit"}
        </Button>

        {/* Session Alert Dialog - only shown if auto-start fails */}
        <AlertDialog open={showSessionAlert} onOpenChange={setShowSessionAlert}>
          <AlertDialogContent className="bg-slate-900 border-slate-700 text-white">
            <AlertDialogHeader>
              <AlertDialogTitle>Session Start Failed</AlertDialogTitle>
              <AlertDialogDescription className="text-slate-300">
                We couldn't automatically start a session for this robot. Would
                you like to try again?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel
                className="bg-slate-800 text-white hover:bg-slate-700 border-slate-600"
                onClick={() => router.back()}
              >
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                className="bg-blue-600 hover:bg-blue-500"
                onClick={handleStartSession}
                disabled={isStartingSession}
              >
                {isStartingSession ? "Starting..." : "Try Again"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
