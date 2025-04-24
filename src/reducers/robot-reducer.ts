import { Robot } from "@/types/Robot";

interface RobotState {
  robots: Record<string, Robot>;
  selectedRobotId: string | null;
  lastUpdate: number;
}

type Action =
  | { type: "HEARTBEAT"; robot: Robot }
  | { type: "SYSTEM_TELEMETRY"; robotId: string; updates: Partial<Robot> }
  | { type: "MARK_OFFLINE"; robotId: string }
  | { type: "SELECT"; robotId: string | null };

export const initialState: RobotState = {
  robots: {},
  selectedRobotId: null,
  lastUpdate: Date.now(),
};

export function reducer(state: RobotState, action: Action): RobotState {
  switch (action.type) {
    case "HEARTBEAT": {
      const robot = action.robot;
      return {
        ...state,
        robots: {
          ...state.robots,
          [robot.robotId]: {
            ...state.robots[robot.robotId],
            ...robot,
            status: "online",
            lastSeen: new Date(),
          },
        },
        lastUpdate: Date.now(),
      };
    }
    case "SYSTEM_TELEMETRY": {
      const { robotId, updates } = action;
      return {
        ...state,
        robots: {
          ...state.robots,
          [robotId]: {
            ...state.robots[robotId],
            ...updates,
            lastSeen: new Date(),
          },
        },
        lastUpdate: Date.now(),
      };
    }
    case "MARK_OFFLINE": {
      const { robotId } = action;
      const updatedRobots = { ...state.robots };
      delete updatedRobots[robotId];

      return {
        ...state,
        robots: updatedRobots,
        lastUpdate: Date.now(),
        selectedRobotId:
          state.selectedRobotId === robotId ? null : state.selectedRobotId,
      };
    }
    case "SELECT": {
      return {
        ...state,
        selectedRobotId: action.robotId,
      };
    }
    default:
      return state;
  }
}
