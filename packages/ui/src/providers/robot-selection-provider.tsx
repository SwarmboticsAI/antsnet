import { createContext, useContext, useState, type ReactNode } from "react";

type RobotSelectionContextType = {
  selectedRobotIds: string[];
  setSelectedRobotIds: (ids: string[]) => void;
  toggleRobotSelection: (robotId: string) => void;
  selectAllRobots: (robotIds: string[]) => void;
  clearSelection: () => void;
};

const RobotSelectionContext = createContext<
  RobotSelectionContextType | undefined
>(undefined);

export function RobotSelectionProvider({ children }: { children: ReactNode }) {
  const [selectedRobotIds, setSelectedRobotIds] = useState<string[]>([]);

  const toggleRobotSelection = (robotId: string) => {
    setSelectedRobotIds((prev) =>
      prev.includes(robotId)
        ? prev.filter((id) => id !== robotId)
        : [...prev, robotId]
    );
  };

  const selectAllRobots = (robotIds: string[]) => {
    setSelectedRobotIds(robotIds);
  };

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

export function useRobotSelection() {
  const context = useContext(RobotSelectionContext);
  if (context === undefined) {
    throw new Error(
      "useRobotSelection must be used within a RobotSelectionProvider"
    );
  }
  return context;
}
