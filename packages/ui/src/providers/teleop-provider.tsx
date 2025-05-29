import React, {
  createContext,
  useContext,
  useReducer,
  useMemo,
  useEffect,
  type ReactNode,
} from "react";

import {
  initialTeleopState,
  teleopReducer,
  TeleopState,
} from "@/reducers/teleop-reducer";
import { useRobotStore } from "@/stores/robot-store";

interface TeleopContextType {
  robotId: string | null;
  state: TeleopState;
  error: string | null;
  isActive: boolean;
}

const TeleopContext = createContext<TeleopContextType | null>(null);

interface TeleopProviderProps {
  children: ReactNode;
}

export const TeleopProvider: React.FC<TeleopProviderProps> = ({ children }) => {
  const { sortedRobots: robots } = useRobotStore();

  const [teleopState, dispatch] = useReducer(teleopReducer, initialTeleopState);

  useEffect(() => {
    const robot = teleopState.robotId
      ? robots.find((r) => r.robotId === teleopState.robotId)
      : null;
    const isRobotInTeleop = false;

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

  const contextValue = useMemo(
    () => ({
      robotId: teleopState.robotId,
      state: teleopState.state,
      error: teleopState.error,

      isActive: teleopState.state === TeleopState.ACTIVE,
    }),
    [teleopState]
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
