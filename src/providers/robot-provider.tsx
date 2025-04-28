"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useReducer,
  ReactNode,
  useMemo,
  useRef,
} from "react";
import { KeyExpr } from "@eclipse-zenoh/zenoh-ts";
import { useZenoh } from "@/providers/zenoh-provider";
import { initialState, reducer } from "@/reducers/robot-reducer";
import {
  handleHeartbeatSample,
  handleSystemSample,
} from "@/utils/robot-handlers";
import { useSessions } from "@/providers/session-provider";
import { useRobotSelection } from "./robot-selection-provider";

const HEARTBEAT_ROUTE = "tak/to_tak_heartbeat";
const SYSTEM_ROUTE = "to_tak/domain_table/system/*";

const RobotContext = createContext<any>(null);

export const RobotProvider = ({ children }: { children: ReactNode }) => {
  const { session, isConnected } = useZenoh();
  const { terminateSession, hasActiveSession, activeRobotIds } = useSessions();
  const { toggleRobotSelection } = useRobotSelection();
  const [state, dispatch] = useReducer(reducer, initialState);
  const heartbeatTimesRef = useRef<Record<string, number>>({});
  const STALE_THRESHOLD = 10000;

  // Add refs for the session functions so we always have the latest values
  const sessionsRef = useRef({
    terminateSession,
    hasActiveSession,
    activeRobotIds,
  });

  // Keep the refs updated with the latest values
  useEffect(() => {
    sessionsRef.current = {
      terminateSession,
      hasActiveSession,
      activeRobotIds,
    };
  }, [terminateSession, hasActiveSession, activeRobotIds]);

  // Subscribe to heartbeat and system telemetry
  useEffect(() => {
    if (!isConnected || !session) return;

    console.log("Setting up Zenoh subscribers");

    const heartbeatSub = session.declare_subscriber(
      new KeyExpr(HEARTBEAT_ROUTE),
      {
        handler: async (sample) =>
          handleHeartbeatSample(sample, dispatch, heartbeatTimesRef),
      }
    );

    const systemSub = session.declare_subscriber(new KeyExpr(SYSTEM_ROUTE), {
      handler: async (sample) => handleSystemSample(sample, dispatch),
    });

    return () => {
      console.log("Cleaning up Zenoh subscribers");
      heartbeatSub?.undeclare();
      systemSub?.undeclare();
    };
  }, [isConnected, session]);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const { activeRobotIds, hasActiveSession, terminateSession } =
        sessionsRef.current;

      console.log("Interval executing, active robots:", activeRobotIds);

      Object.entries(heartbeatTimesRef.current).forEach(([id, ts]) => {
        if (now - ts > STALE_THRESHOLD) {
          console.log(
            activeRobotIds,
            "are active, checking for offline robots"
          );

          const isActive = hasActiveSession(id);
          console.log(
            isActive
              ? `Robot ${id} is offline, terminating session`
              : `Robot ${id} is offline, no active session to terminate`
          );

          if (isActive) {
            try {
              terminateSession(id);
              toggleRobotSelection(id);
              dispatch({ type: "MARK_OFFLINE", robotId: id });
              console.warn(`Ended session for Robot ${id}, marked offline`);
            } catch (error) {
              console.error(
                `Failed to terminate session for robot ${id}:`,
                error
              );
            }
          }
        }
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []); // Empty dependency array so it only runs once

  const value = useMemo(() => {
    const robots = state.robots;
    const robotList = Object.values(robots);
    return {
      robots,
      robotList,
      selectedRobotId: state.selectedRobotId,
      getRobotById: (id: string) => robots[id],
      selectRobot: (id: string | null) =>
        dispatch({ type: "SELECT", robotId: id }),
      onlineRobots: robotList.filter((r) => r.status === "online"),
      offlineRobots: robotList.filter((r) => r.status === "offline"),
    };
  }, [state]);

  return (
    <RobotContext.Provider value={value}>{children}</RobotContext.Provider>
  );
};

export const useRobots = () => {
  const context = useContext(RobotContext);
  if (!context)
    throw new Error("useRobots must be used within a RobotProvider");
  return context;
};
