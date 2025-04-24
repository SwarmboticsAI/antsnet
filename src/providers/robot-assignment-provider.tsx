"use client";

import React, {
  createContext,
  useReducer,
  useContext,
  ReactNode,
  useMemo,
} from "react";
import {
  robotAssignmentReducer,
  RobotAssignmentState,
  RobotAssignmentAction,
} from "@/reducers/robot-assignment-reducer";

const RobotAssignmentContext = createContext<{
  state: RobotAssignmentState;
  dispatch: React.Dispatch<RobotAssignmentAction>;
} | null>(null);

const initialAssignmentState: RobotAssignmentState = {
  assignments: {},
};

export const RobotAssignmentProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [state, dispatch] = useReducer(
    robotAssignmentReducer,
    initialAssignmentState
  );

  const value = useMemo(() => ({ state, dispatch }), [state]);

  return (
    <RobotAssignmentContext.Provider value={value}>
      {children}
    </RobotAssignmentContext.Provider>
  );
};

export const useRobotAssignment = () => {
  const context = useContext(RobotAssignmentContext);
  if (!context)
    throw new Error(
      "useRobotAssignment must be used inside a RobotAssignmentProvider"
    );
  return context;
};
