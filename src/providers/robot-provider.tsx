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

const HEARTBEAT_ROUTE = "tak/to_tak_heartbeat";
const SYSTEM_ROUTE = "to_tak/domain_table/system/*";

const RobotContext = createContext<any>(null);

export const RobotProvider = ({ children }: { children: ReactNode }) => {
  const { session, isConnected } = useZenoh();
  const [state, dispatch] = useReducer(reducer, initialState);
  const heartbeatTimesRef = useRef<Record<string, number>>({});
  const STALE_THRESHOLD = 10000;

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

  // Periodic offline status check
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      Object.entries(heartbeatTimesRef.current).forEach(([id, ts]) => {
        if (now - ts > STALE_THRESHOLD) {
          dispatch({ type: "MARK_OFFLINE", robotId: id });
        }
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

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
