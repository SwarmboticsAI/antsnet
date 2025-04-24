"use client";

import React, {
  createContext,
  useContext,
  useReducer,
  useMemo,
  useCallback,
  ReactNode,
  useEffect,
} from "react";

import { Behavior } from "@/protos/generated/sbai_behavior_protos/behavior_request";
import { MapInteractionMode, useMapContext } from "@/providers/map-provider";
import { useBehaviors } from "@/providers/behavior-provider";
import { useGeoDrawing, GeometryType } from "@/providers/geo-drawing-provider";
import { BehaviorParams } from "@/types/Behavior";

// Mapping behavior types to appropriate geometry types and map interaction modes
export const getBehaviorDrawingConfig = (
  behaviorType: Behavior
): {
  geometryType: GeometryType;
  interactionMode: MapInteractionMode;
} => {
  switch (behaviorType) {
    case Behavior.BEHAVIOR_RALLY:
    case Behavior.BEHAVIOR_DEFEND:
      return {
        geometryType: "point",
        interactionMode: MapInteractionMode.DRAWING_POINTS,
      };
    case Behavior.BEHAVIOR_MULTI_WAYPOINT_NAVIGATION:
      return {
        geometryType: "line",
        interactionMode: MapInteractionMode.DRAWING_POINTS,
      };
    case Behavior.BEHAVIOR_SURROUND:
      return {
        geometryType: "point", // Surrounds a central point
        interactionMode: MapInteractionMode.DRAWING_POINTS,
      };
    // Add other behavior types as needed
    default:
      return {
        geometryType: "point",
        interactionMode: MapInteractionMode.DRAWING_POINTS,
      };
  }
};

// State management specific to behavior execution
interface BehaviorExecutionState {
  isExecuting: boolean;
  executionError: string | null;
  highlightedBehaviorId: string | null;
  parameters: BehaviorParams;
}

type BehaviorExecutionAction =
  | { type: "EXEC_START" }
  | { type: "EXEC_SUCCESS" }
  | { type: "EXEC_FAIL"; error: string }
  | { type: "HIGHLIGHT"; id: string | null }
  | { type: "SET_PARAM"; key: keyof BehaviorParams; value: any };

const initialBehaviorExecutionState: BehaviorExecutionState = {
  isExecuting: false,
  executionError: null,
  highlightedBehaviorId: null,
  parameters: {},
};

function behaviorExecutionReducer(
  state: BehaviorExecutionState,
  action: BehaviorExecutionAction
): BehaviorExecutionState {
  switch (action.type) {
    case "EXEC_START":
      return { ...state, isExecuting: true, executionError: null };
    case "EXEC_SUCCESS":
      return { ...state, isExecuting: false };
    case "EXEC_FAIL":
      return {
        ...state,
        isExecuting: false,
        executionError: action.error,
      };
    case "HIGHLIGHT":
      return { ...state, highlightedBehaviorId: action.id };
    case "SET_PARAM":
      return {
        ...state,
        parameters: {
          ...state.parameters,
          [action.key]: action.value,
        },
      };
    default:
      return state;
  }
}

interface BehaviorDrawingContextType {
  // Current behavior being drafted
  currentBehaviorType: Behavior | null;

  // Parameter handling
  parameters: BehaviorParams;
  setParameterValue: (key: keyof BehaviorParams, value: any) => void;

  // Drawing operations
  startNewBehavior: (type: Behavior) => void;
  cancelBehavior: () => void;

  // Execution
  executeBehavior: (robotIds: string[]) => Promise<string | null>;
  isExecuting: boolean;
  executionError: string | null;

  // Highlighting
  highlightedBehaviorId: string | null;
  highlightBehavior: (id: string | null) => void;
}

const BehaviorDrawingContext = createContext<BehaviorDrawingContextType | null>(
  null
);

export const BehaviorDrawingProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  // Access the base drawing functionality
  const {
    state: drawingState,
    startDrawing,
    resetDrawing,
    setMetadata,
  } = useGeoDrawing();

  // Access map and behavior functionality
  const { setInteractionMode } = useMapContext();
  const { requestBehavior } = useBehaviors();

  // Local state for behavior execution
  const [executionState, dispatchExecution] = useReducer(
    behaviorExecutionReducer,
    initialBehaviorExecutionState
  );

  // Derive current behavior type from drawing metadata
  const currentBehaviorType = useMemo(() => {
    if (drawingState.metadata?.behaviorType) {
      return drawingState.metadata.behaviorType as Behavior;
    }
    return null;
  }, [drawingState.metadata]);

  // Automatically set map interaction mode when behavior type changes
  useEffect(() => {
    if (currentBehaviorType !== null) {
      const config = getBehaviorDrawingConfig(currentBehaviorType);
      setInteractionMode(config.interactionMode);
    } else {
      setInteractionMode(MapInteractionMode.VIEWING);
    }
  }, [currentBehaviorType, setInteractionMode]);

  // Start a new behavior drawing
  const startNewBehavior = useCallback(
    (behaviorType: Behavior) => {
      // First completely reset any existing drawing state
      resetDrawing();

      const config = getBehaviorDrawingConfig(behaviorType);

      // Reset any execution state
      dispatchExecution({ type: "HIGHLIGHT", id: null });

      // Start new drawing with behavior metadata
      startDrawing(config.geometryType, config.interactionMode, {
        behaviorType,
        parameters: executionState.parameters,
      });
    },
    [resetDrawing, startDrawing, executionState.parameters]
  );

  // Cancel current behavior
  const cancelBehavior = useCallback(() => {
    resetDrawing();
    setInteractionMode(MapInteractionMode.VIEWING);
  }, [resetDrawing, setInteractionMode]);

  // Set a parameter for the current behavior
  const setParameterValue = useCallback(
    (key: keyof BehaviorParams, value: any) => {
      dispatchExecution({ type: "SET_PARAM", key, value });

      // Also update the drawing metadata
      setMetadata({
        parameters: {
          ...executionState.parameters,
          [key]: value,
        },
      });
    },
    [setMetadata, executionState.parameters]
  );

  // Execute behavior with selected robots
  const executeBehavior = useCallback(
    async (robotIds: string[]): Promise<string | null> => {
      if (
        !currentBehaviorType ||
        robotIds.length === 0 ||
        drawingState.geoPoints.length === 0
      ) {
        dispatchExecution({
          type: "EXEC_FAIL",
          error: "Invalid behavior setup or no robots selected.",
        });
        return null;
      }

      dispatchExecution({ type: "EXEC_START" });

      try {
        // For multi-waypoint, skip starting position if needed
        let geoPoints = drawingState.geoPoints;
        if (
          currentBehaviorType === Behavior.BEHAVIOR_MULTI_WAYPOINT_NAVIGATION &&
          geoPoints.length > 1
        ) {
          geoPoints = geoPoints.slice(1);
        }

        const behaviorId = await requestBehavior(
          currentBehaviorType,
          robotIds,
          {
            geoPoints,
            ...executionState.parameters,
          }
        );

        if (behaviorId) {
          dispatchExecution({ type: "EXEC_SUCCESS" });
          setInteractionMode(MapInteractionMode.VIEWING);
          resetDrawing();
          return behaviorId;
        } else {
          dispatchExecution({
            type: "EXEC_FAIL",
            error: "Behavior execution failed.",
          });
          return null;
        }
      } catch (e) {
        dispatchExecution({
          type: "EXEC_FAIL",
          error: String(e),
        });
        return null;
      }
    },
    [
      currentBehaviorType,
      drawingState.geoPoints,
      executionState.parameters,
      requestBehavior,
      resetDrawing,
      setInteractionMode,
    ]
  );

  // Highlight a specific behavior on the map
  const highlightBehavior = useCallback((id: string | null) => {
    dispatchExecution({ type: "HIGHLIGHT", id });
  }, []);

  const contextValue = useMemo<BehaviorDrawingContextType>(
    () => ({
      currentBehaviorType,
      parameters: executionState.parameters,
      setParameterValue,
      startNewBehavior,
      cancelBehavior,
      executeBehavior,
      isExecuting: executionState.isExecuting,
      executionError: executionState.executionError,
      highlightedBehaviorId: executionState.highlightedBehaviorId,
      highlightBehavior,
    }),
    [
      currentBehaviorType,
      executionState,
      setParameterValue,
      startNewBehavior,
      cancelBehavior,
      executeBehavior,
      highlightBehavior,
    ]
  );

  return (
    <BehaviorDrawingContext.Provider value={contextValue}>
      {children}
    </BehaviorDrawingContext.Provider>
  );
};

export const useBehaviorDrawing = (): BehaviorDrawingContextType => {
  const context = useContext(BehaviorDrawingContext);
  if (!context) {
    throw new Error(
      "useBehaviorDrawing must be used within a BehaviorDrawingProvider"
    );
  }
  return context;
};
