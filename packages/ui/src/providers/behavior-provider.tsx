import React, {
  createContext,
  useContext,
  useMemo,
  useCallback,
  type ReactNode,
  useReducer,
} from "react";
import { v4 as uuidv4 } from "uuid";

import {
  behaviorReducer,
  initialBehaviorState,
} from "@/reducers/behavior-reducer";
import {
  type BehaviorInfo,
  type BehaviorParams,
  BehaviorStatusUI,
} from "@/types/behavior";
import { BehaviorControl } from "@swarmbotics/protos/sbai_behavior_protos/behavior_control_command.ts";
import { Behavior } from "@swarmbotics/protos/ros2_interfaces/sbai_behavior_protos/sbai_behavior_protos/behavior_request.ts";

interface RallyParams {
  participatingRobotIds: string[];
  rallyPointToleranceM: number;
  geoPoint: {
    lat: number;
    lng: number;
  };
}

interface BehaviorContextType {
  dispatch: React.Dispatch<any>;
  behaviors: Record<string, BehaviorInfo>;
  sortedBehaviorList: BehaviorInfo[];
  activeBehaviorId: string | null;
  activeBehavior: BehaviorInfo | null;
  getBehaviorsThatNeedIntervention: () => BehaviorInfo[];
  rallyRequest: (params: RallyParams) => Promise<string | null>;
  controlBehaviorForRobot: (
    behaviorId: string,
    robotId: string,
    command: BehaviorControl
  ) => Promise<boolean>;
  controlBehavior: (
    behaviorId: string,
    command: BehaviorControl
  ) => Promise<boolean>;
  cancelBehavior: (behaviorId: string) => Promise<boolean>;
  getBehaviorInfo: (behaviorId: string) => BehaviorInfo | undefined;
  behaviorsByStatus: Record<BehaviorStatusUI, BehaviorInfo[]>;
}

const BehaviorContext = createContext<BehaviorContextType | null>(null);

export const BehaviorProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(behaviorReducer, initialBehaviorState);

  const getBehaviorInfo = useCallback(
    (behaviorId: string) => state.behaviors[behaviorId],
    [state.behaviors]
  );

  const activeBehavior: BehaviorInfo | null = useMemo(() => {
    if (state.activeBehaviorId && state.behaviors[state.activeBehaviorId]) {
      return state.behaviors[state.activeBehaviorId] ?? null;
    }
    return null;
  }, [state.activeBehaviorId, state.behaviors]);

  // Updated to match new BehaviorStatusUI enum values
  const behaviorsByStatus = useMemo(() => {
    const result: Record<BehaviorStatusUI, BehaviorInfo[]> = {
      [BehaviorStatusUI.UNSPECIFIED]: [],
      [BehaviorStatusUI.QUEUED]: [],
      [BehaviorStatusUI.PENDING]: [],
      [BehaviorStatusUI.ACTIVE]: [],
      [BehaviorStatusUI.PAUSED]: [],
      [BehaviorStatusUI.NEEDS_INTERVENTION]: [],
      [BehaviorStatusUI.COMPLETED]: [],
      [BehaviorStatusUI.FAILED]: [],
      [BehaviorStatusUI.CANCELED]: [],
      [BehaviorStatusUI.ACCEPTED]: [],
    };

    Object.values(state.behaviors).forEach((behavior: BehaviorInfo) => {
      result[behavior.status].push(behavior);
    });

    return result;
  }, [state.behaviors]);

  const rallyRequest = useCallback(
    async (params: RallyParams): Promise<string | null> => {
      const behaviorId = uuidv4();
      const newBehavior: BehaviorInfo = {
        behaviorId,
        behaviorType: Behavior.BEHAVIOR_RALLY,
        robotIds: params.participatingRobotIds,
        params,
        createdAt: new Date(),
        status: BehaviorStatusUI.QUEUED,
        robotStatuses: {},
        robotPaths: {},
      };

      fetch(`/api/behaviors/rally`, {
        method: "POST",
        body: JSON.stringify(params),
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error("Network response was not ok");
          }
          return response.json();
        })
        .then((data) => {
          dispatch({ type: "REGISTER_BEHAVIOR", behavior: newBehavior });
          console.log("Behavior request successful:", data);
        })
        .catch((error) => {
          console.error("Error in behavior request:", error);
        });
      return behaviorId;
    },
    []
  );

  const controlBehaviorForRobot = useCallback(
    async (
      behaviorId: string,
      robotId: string,
      command: BehaviorControl
    ): Promise<boolean> => {
      const behavior = state.behaviors[behaviorId];
      if (!behavior) {
        console.warn(`No behavior found with ID ${behaviorId}`);
        return false;
      }

      if (!behavior.robotIds.includes(robotId)) {
        console.warn(`Robot ${robotId} is not part of behavior ${behaviorId}`);
        return false;
      }

      try {
        switch (command) {
          case BehaviorControl.BEHAVIOR_CONTROL_PAUSE:
            // Update just this robot's status
            dispatch({
              type: "UPDATE_ROBOT_STATUS",
              behaviorId,
              robotId,
              status: BehaviorStatusUI.PAUSED,
            });
            break;
          case BehaviorControl.BEHAVIOR_CONTROL_RESUME:
            dispatch({
              type: "UPDATE_ROBOT_STATUS",
              behaviorId,
              robotId,
              status: BehaviorStatusUI.ACTIVE,
            });
            break;
          case BehaviorControl.BEHAVIOR_CONTROL_CANCEL:
            dispatch({
              type: "UPDATE_ROBOT_STATUS",
              behaviorId,
              robotId,
              status: BehaviorStatusUI.CANCELED,
            });
            break;
          case BehaviorControl.BEHAVIOR_CONTROL_RESTART:
            dispatch({
              type: "UPDATE_ROBOT_STATUS",
              behaviorId,
              robotId,
              status: BehaviorStatusUI.ACCEPTED,
            });
            break;
        }

        return true;
      } catch (e) {
        console.error(`Error sending control command to robot ${robotId}:`, e);
        return false;
      }
    },
    [state.behaviors, dispatch]
  );

  const controlBehavior = useCallback(
    async (behaviorId: string, command: BehaviorControl): Promise<boolean> => {
      const behavior = state.behaviors[behaviorId];
      if (!behavior) {
        console.warn(`No behavior found with ID ${behaviorId}`);
        return false;
      }

      try {
        switch (command) {
          case BehaviorControl.BEHAVIOR_CONTROL_PAUSE:
            dispatch({
              type: "UPDATE_BEHAVIOR_STATUS",
              behaviorId,
              status: BehaviorStatusUI.PAUSED,
            });
            break;
          case BehaviorControl.BEHAVIOR_CONTROL_RESUME:
            dispatch({
              type: "UPDATE_BEHAVIOR_STATUS",
              behaviorId,
              status: BehaviorStatusUI.ACTIVE,
            });
            break;
          case BehaviorControl.BEHAVIOR_CONTROL_CANCEL:
            dispatch({ type: "CANCEL_BEHAVIOR", behaviorId });
            break;
          case BehaviorControl.BEHAVIOR_CONTROL_RESTART:
            dispatch({
              type: "UPDATE_BEHAVIOR_STATUS",
              behaviorId,
              status: BehaviorStatusUI.ACCEPTED,
            });
            break;
          default:
            console.warn("Unknown command received.");
        }

        return true;
      } catch (e) {
        console.error("Error sending control command:", e);
        return false;
      }
    },
    [state.behaviors, dispatch]
  );

  const cancelBehavior = useCallback(
    async (behaviorId: string): Promise<boolean> => {
      return controlBehavior(
        behaviorId,
        BehaviorControl.BEHAVIOR_CONTROL_CANCEL
      );
    },
    [controlBehavior]
  );

  const sortedBehaviorList = useMemo(() => {
    return Object.values(state.behaviors).sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [state.behaviors]);

  const getBehaviorsThatNeedIntervention = useCallback((): BehaviorInfo[] => {
    return Object.values(state.behaviors).filter(
      (behavior) => behavior.status === BehaviorStatusUI.NEEDS_INTERVENTION
    );
  }, [state.behaviors]);

  const contextValue = useMemo<BehaviorContextType>(
    () => ({
      dispatch,
      behaviors: state.behaviors,
      sortedBehaviorList,
      activeBehaviorId: state.activeBehaviorId,
      activeBehavior,
      rallyRequest,
      controlBehaviorForRobot,
      controlBehavior,
      cancelBehavior,
      getBehaviorInfo,
      getBehaviorsThatNeedIntervention,
      behaviorsByStatus,
    }),
    [
      dispatch,
      state.behaviors,
      sortedBehaviorList,
      state.activeBehaviorId,
      activeBehavior,
      rallyRequest,
      controlBehaviorForRobot,
      getBehaviorsThatNeedIntervention,
      controlBehavior,
      cancelBehavior,
      getBehaviorInfo,
      behaviorsByStatus,
    ]
  );

  return (
    <BehaviorContext.Provider value={contextValue}>
      {children}
    </BehaviorContext.Provider>
  );
};

export const useBehaviors = (): BehaviorContextType => {
  const context = useContext(BehaviorContext);
  if (!context) {
    throw new Error("useBehaviors must be used within a BehaviorProvider");
  }
  return context;
};

export default BehaviorProvider;
