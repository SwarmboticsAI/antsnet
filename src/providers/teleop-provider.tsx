"use client";

import React, {
  createContext,
  useContext,
  useReducer,
  useMemo,
  useCallback,
  useEffect,
  useRef,
  ReactNode,
} from "react";
import { KeyExpr } from "@eclipse-zenoh/zenoh-ts";
import { useZenoh } from "@/providers/zenoh-provider";
import { useSessions } from "@/providers/session-provider";
import { useRobots } from "@/providers/robot-provider";
import { AuthenticationHeader } from "@/protos/generated/sbai_tak_protos/sbai_tak_protos/authentication_header";
import { CredentialedCortexStateUpdate } from "@/protos/generated/sbai_tak_protos/sbai_tak_protos/credentialed_cortex_state_update";
import { CortexStateUpdate } from "@/protos/generated/sbai_cortex_protos/cortex_state_update";
import { CredentialedJoy } from "@/protos/generated/sbai_tak_protos/sbai_tak_protos/credentialed_joy";
import { Joy } from "@/protos/generated/sbai_sensor_protos/sbai_sensor_protos/joy";
import {
  initialTeleopState,
  teleopReducer,
  TeleopState,
} from "@/reducers/teleop-reducer";

const STATE_UPDATE_REQUEST_ROUTE = (robotId: string) =>
  `ants/${robotId}/state_update_request`;
const TELEOP_COMMANDS_ROUTE = (robotId: string) => `ants/${robotId}/joy`;

interface TeleopContextType {
  robotId: string | null;
  state: TeleopState;
  error: string | null;
  startTeleop: (robotId: string) => Promise<boolean>;
  stopTeleop: () => Promise<boolean>;
  sendCommand: (throttle: number, steering: number) => Promise<boolean>;
  isActive: boolean;
}

const TeleopContext = createContext<TeleopContextType | null>(null);

interface TeleopProviderProps {
  children: ReactNode;
}

export const TeleopProvider: React.FC<TeleopProviderProps> = ({ children }) => {
  const { session, isConnected } = useZenoh();
  const { sessions, clientTakId } = useSessions();
  const { robots } = useRobots();

  const [teleopState, dispatch] = useReducer(teleopReducer, initialTeleopState);
  const lastCommandTime = useRef<number>(0);
  const commandRateLimit = 50;

  useEffect(() => {
    const robot = teleopState.robotId ? robots[teleopState.robotId] : null;
    const isRobotInTeleop = robot?.mode === 3;

    if (teleopState.state === TeleopState.REQUESTING && isRobotInTeleop) {
      dispatch({ type: "ACTIVATE" });
    } else if (teleopState.state === TeleopState.ACTIVE && !isRobotInTeleop) {
      dispatch({ type: "RESET" });
      dispatch({
        type: "FAIL",
        error: "Robot exited teleop mode unexpectedly",
      });
    } else if (
      teleopState.state === TeleopState.TERMINATING &&
      !isRobotInTeleop
    ) {
      dispatch({ type: "RESET" });
    }
  }, [robots, teleopState.robotId, teleopState.state]);

  const encodeAuthHeader = (takId: string, token: string) =>
    AuthenticationHeader.create({ takId, sessionToken: token });

  const encodeStateUpdate = (takId: string, token: string, enable: boolean) => {
    const auth = encodeAuthHeader(takId, token);
    return CredentialedCortexStateUpdate.encode(
      CredentialedCortexStateUpdate.create({
        authenticationHeader: auth,
        internalMessage: CortexStateUpdate.create({ newState: enable ? 3 : 4 }),
      })
    ).finish();
  };

  const encodeJoyCommand = (
    takId: string,
    token: string,
    throttle: number,
    steering: number
  ) =>
    CredentialedJoy.encode(
      CredentialedJoy.create({
        authenticationHeader: encodeAuthHeader(takId, token),
        internalMessage: Joy.create({ axes: [throttle, steering] }),
      })
    ).finish();

  const startTeleop = useCallback(
    async (id: string): Promise<boolean> => {
      if (
        teleopState.robotId === id &&
        (teleopState.state === TeleopState.ACTIVE ||
          teleopState.state === TeleopState.REQUESTING)
      )
        return true;

      if (!isConnected || !session) {
        dispatch({ type: "FAIL", error: "Zenoh not connected" });
        return false;
      }

      const sessionInfo = sessions[id];
      if (!sessionInfo?.token) {
        dispatch({ type: "FAIL", error: "No active session for this robot" });
        return false;
      }

      try {
        dispatch({ type: "START_REQUEST", robotId: id });
        const route = STATE_UPDATE_REQUEST_ROUTE(id);
        const message = encodeStateUpdate(clientTakId, sessionInfo.token, true);
        await session.put(new KeyExpr(route), message);
        return true;
      } catch (error) {
        dispatch({
          type: "FAIL",
          error: error instanceof Error ? error.message : String(error),
        });
        return false;
      }
    },
    [
      isConnected,
      session,
      sessions,
      clientTakId,
      teleopState.robotId,
      teleopState.state,
    ]
  );

  const stopTeleop = useCallback(async (): Promise<boolean> => {
    const id = teleopState.robotId;
    if (
      !id ||
      teleopState.state === TeleopState.IDLE ||
      teleopState.state === TeleopState.TERMINATING
    )
      return true;
    if (!isConnected || !session) return false;

    const sessionInfo = sessions[id];
    if (!sessionInfo?.token) {
      dispatch({ type: "RESET" });
      dispatch({ type: "FAIL", error: "No active session for this robot" });
      return false;
    }

    try {
      await sendCommand(0, 0);
      dispatch({ type: "TERMINATE" });
      const route = STATE_UPDATE_REQUEST_ROUTE(id);
      const message = encodeStateUpdate(clientTakId, sessionInfo.token, false);
      await session.put(new KeyExpr(route), message);
      return true;
    } catch (error) {
      dispatch({
        type: "FAIL",
        error: error instanceof Error ? error.message : String(error),
      });
      return false;
    }
  }, [
    isConnected,
    session,
    sessions,
    clientTakId,
    teleopState.robotId,
    teleopState.state,
  ]);

  const sendCommand = useCallback(
    async (throttle: number, steering: number): Promise<boolean> => {
      const now = Date.now();
      if (now - lastCommandTime.current < commandRateLimit) return false;
      lastCommandTime.current = now;

      const id = teleopState.robotId;
      if (
        !isConnected ||
        !session ||
        !id ||
        teleopState.state !== TeleopState.ACTIVE
      )
        return false;

      const sessionInfo = sessions[id];
      if (!sessionInfo?.token) {
        dispatch({ type: "FAIL", error: "No active session for this robot" });
        return false;
      }

      try {
        const clampedThrottle = Math.max(-1, Math.min(1, throttle));
        const clampedSteering = Math.max(-1, Math.min(1, steering));
        const route = TELEOP_COMMANDS_ROUTE(id);
        const message = encodeJoyCommand(
          clientTakId,
          sessionInfo.token,
          clampedThrottle,
          clampedSteering
        );
        await session.put(new KeyExpr(route), message);
        return true;
      } catch (error) {
        console.error("Error sending command:", error);
        return false;
      }
    },
    [
      isConnected,
      session,
      teleopState.robotId,
      teleopState.state,
      sessions,
      clientTakId,
    ]
  );

  const contextValue = useMemo(
    () => ({
      robotId: teleopState.robotId,
      state: teleopState.state,
      error: teleopState.error,
      startTeleop,
      stopTeleop,
      sendCommand,
      isActive: teleopState.state === TeleopState.ACTIVE,
    }),
    [teleopState, startTeleop, stopTeleop, sendCommand]
  );

  return (
    <TeleopContext.Provider value={contextValue}>
      {children}
    </TeleopContext.Provider>
  );
};

export default TeleopProvider;

export const useTeleop = (): TeleopContextType => {
  const context = useContext(TeleopContext);
  if (!context)
    throw new Error("useTeleop must be used within a TeleopProvider");
  return context;
};
