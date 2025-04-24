"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

// Define the context type
type RobotSelectionContextType = {
  selectedRobotIds: string[];
  setSelectedRobotIds: (ids: string[]) => void;
  toggleRobotSelection: (robotId: string) => void;
  selectAllRobots: (robotIds: string[]) => void;
  clearSelection: () => void;
};

// Create the context with a default value
const RobotSelectionContext = createContext<
  RobotSelectionContextType | undefined
>(undefined);

// Provider component
export function RobotSelectionProvider({ children }: { children: ReactNode }) {
  const [selectedRobotIds, setSelectedRobotIds] = useState<string[]>([]);

  // Toggle selection of a robot
  const toggleRobotSelection = (robotId: string) => {
    setSelectedRobotIds((prev) =>
      prev.includes(robotId)
        ? prev.filter((id) => id !== robotId)
        : [...prev, robotId]
    );
  };

  // Select all robots from a provided list
  const selectAllRobots = (robotIds: string[]) => {
    setSelectedRobotIds(robotIds);
  };

  // Clear all selections
  const clearSelection = () => {
    setSelectedRobotIds([]);
  };

  return (
    <RobotSelectionContext.Provider
      value={{
        selectedRobotIds,
        setSelectedRobotIds,
        toggleRobotSelection,
        selectAllRobots,
        clearSelection,
      }}
    >
      {children}
    </RobotSelectionContext.Provider>
  );
}

// Custom hook to use the robot selection context
export function useRobotSelection() {
  const context = useContext(RobotSelectionContext);
  if (context === undefined) {
    throw new Error(
      "useRobotSelection must be used within a RobotSelectionProvider"
    );
  }
  return context;
}
