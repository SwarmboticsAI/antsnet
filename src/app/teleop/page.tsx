"use client";

import { useMemo, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import VideoStreamPlayer from "@/components/video-player";
import { Button } from "@/components/ui/button";
import { RobotMap } from "@/components/map";
import { useTeleopControls } from "@/hooks/use-teleop-controls";
import { useRobots } from "@/providers/robot-provider";
import { useTeleop } from "@/providers/teleop-provider";
import { useSessions } from "@/providers/session-provider";
import { cn } from "@/lib/utils";
import { getBatteryIcon } from "@/utils/get-battery-icon";

export default function TeleopPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const robotId = searchParams.get("robot_id");
  const { getRobotById } = useRobots();
  const { getSessionInfo } = useSessions();
  const { startTeleop, stopTeleop, sendCommand, state } = useTeleop();
  const [isInitializing, setIsInitializing] = useState(false);

  const robot = useMemo(() => {
    if (!robotId) return null;
    return getRobotById(robotId);
  }, [robotId, getRobotById]);

  const hasActiveSession = useMemo(() => {
    if (!robotId) return false;
    const sessionInfo = getSessionInfo(robotId);
    return sessionInfo?.token !== null;
  }, [robotId, getSessionInfo]);

  const { throttle, steering, resetControls } = useTeleopControls(
    50,
    (t, s) => {
      if (state === "active") {
        sendCommand(t, s);
      }
    },
    0.3
  );

  useEffect(() => {
    if (!robotId || !hasActiveSession || isInitializing) return;

    let isMounted = true;

    const initTeleop = async () => {
      setIsInitializing(true);

      try {
        await startTeleop(robotId);
      } catch (error) {
        console.error("Error starting teleop:", error);
      } finally {
        if (isMounted) {
          setIsInitializing(false);
        }
      }
    };

    initTeleop();

    return () => {
      isMounted = false;

      resetControls();
      stopTeleop().catch(console.error);
    };
  }, [robotId, hasActiveSession]);

  const isConnected = state === "active";
  const isConnecting = state === "requesting" || isInitializing;

  const handleExit = () => {
    resetControls();
    stopTeleop().finally(() => {
      router.back();
    });
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

        <div className="absolute top-22 right-0 w-64 h-64 rounded-tl-4xl rounded-bl-4xl overflow-hidden opacity-65 pointer-events-none">
          <RobotMap robots={[]} />
        </div>

        <Button
          className="absolute top-28 left-4 bg-red-500"
          variant="destructive"
          onClick={handleExit}
        >
          Exit
        </Button>
      </div>
    </div>
  );
}
