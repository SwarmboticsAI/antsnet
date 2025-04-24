// useBehaviorCreator.ts
"use client";

import { useReducer, useEffect, useCallback } from "react";
import { Behavior } from "@/protos/generated/sbai_behavior_protos/behavior_request";
import { useBehaviors } from "@/providers/behavior-provider";
import { GeometryType, useGeoDrawing } from "@/providers/geo-drawing-provider";
import { MapInteractionMode } from "@/providers/map-provider";
import { useRobotSelection } from "@/providers/robot-selection-provider";

// --- Types ---
export type BehaviorParams = Record<string, any>;

export type BehaviorDraftState = {
  selectedBehavior: Behavior;
  params: BehaviorParams;
  useDraw: boolean;
  drawVersion: number;
  currentBehaviorIds: string[];
  manualLatLng: { lat: number; lng: number };
  // Note: selectedRobotIds has been removed from state
};

export type BehaviorDraftAction =
  | { type: "SET_BEHAVIOR_TYPE"; value: Behavior }
  | { type: "SET_PARAM"; key: string; value: any }
  | { type: "SET_PARAMS"; params: BehaviorParams }
  | { type: "TOGGLE_USE_DRAW"; value: boolean }
  | { type: "INCREMENT_DRAW_VERSION" }
  | { type: "ADD_BEHAVIOR_ID"; id: string }
  | { type: "REMOVE_BEHAVIOR_ID"; id: string }
  | { type: "CLEAR_BEHAVIOR_IDS" }
  | { type: "SET_MANUAL_LATLNG"; key: "lat" | "lng"; value: number }
  | { type: "SET_MANUAL_COORDS"; lat: number; lng: number };
// Note: Robot selection actions have been removed

// --- Parameter Field Definitions ---
export const paramFieldsMap = {
  [Behavior.BEHAVIOR_RALLY]: [
    {
      name: "rallyRadiusM",
      label: "Rally Radius (m)",
      type: "number",
      default: 3,
    },
  ],
  [Behavior.BEHAVIOR_DEFEND]: [
    {
      name: "defendRadiusM",
      label: "Defend Radius (m)",
      type: "number",
      default: 3,
    },
  ],
  [Behavior.BEHAVIOR_SURROUND]: [
    {
      name: "surroundRadiusM",
      label: "Surround Radius (m)",
      type: "number",
      default: 3,
    },
  ],
  [Behavior.BEHAVIOR_MULTI_WAYPOINT_NAVIGATION]: [
    {
      name: "desiredFinalYawDeg",
      label: "Desired Final Yaw (deg)",
      type: "number",
      default: 0,
    },
  ],
  [Behavior.BEHAVIOR_LINE_FORMATION]: [
    {
      name: "separationDistanceM",
      label: "Separation Distance (m)",
      type: "number",
      default: 5,
    },
    {
      name: "lineYawDeg",
      label: "Line Yaw (deg)",
      type: "number",
      default: 90,
    },
    {
      name: "robotYawDeg",
      label: "Robot Yaw (deg)",
      type: "number",
      default: 0,
    },
  ],
  [Behavior.BEHAVIOR_RAPTOR]: [
    {
      name: "outerRadiusM",
      label: "Outer Radius (m)",
      type: "number",
      default: 5,
    },
    {
      name: "innerRadiusM",
      label: "Inner Radius (m)",
      type: "number",
      default: 2,
    },
  ],
  [Behavior.BEHAVIOR_AREA_COVERAGE]: [
    {
      name: "laneWidthM",
      label: "Lane Width (m)",
      type: "number",
      default: 2,
    },
  ],
  [Behavior.BEHAVIOR_PATROL]: [],
};

// --- Helper Functions ---
export function getDefaultParams(behavior: Behavior): Record<string, any> {
  return (paramFieldsMap[behavior as keyof typeof paramFieldsMap] || []).reduce(
    (acc, field) => {
      acc[field.name] = field.default;
      return acc;
    },
    {} as Record<string, any>
  );
}

export function getBehaviorGeometry(behaviorType: Behavior): GeometryType {
  if (
    [
      Behavior.BEHAVIOR_MULTI_WAYPOINT_NAVIGATION,
      Behavior.BEHAVIOR_LINE_FORMATION,
    ].includes(behaviorType)
  ) {
    return "line";
  } else if (
    behaviorType === Behavior.BEHAVIOR_AREA_COVERAGE ||
    behaviorType === Behavior.BEHAVIOR_PATROL
  ) {
    return "polygon";
  }
  return "point"; // Default for point-based behaviors
}

export function getInteractionMode(
  geometryType: GeometryType
): MapInteractionMode {
  switch (geometryType) {
    case "line":
      return MapInteractionMode.DRAWING_PERIMETER;
    case "polygon":
      return MapInteractionMode.DRAWING_POLYGON;
    case "point":
    default:
      return MapInteractionMode.DRAWING_POINTS;
  }
}

// --- Initial State ---
export const initialBehaviorState: BehaviorDraftState = {
  selectedBehavior: Behavior.BEHAVIOR_RALLY,
  params: getDefaultParams(Behavior.BEHAVIOR_RALLY),
  useDraw: true,
  drawVersion: 0,
  currentBehaviorIds: [],
  manualLatLng: { lat: 33.687864, lng: -112.077793 },
  // Note: selectedRobotIds has been removed from initial state
};

// --- Reducer ---
export function behaviorReducer(
  state: BehaviorDraftState,
  action: BehaviorDraftAction
): BehaviorDraftState {
  switch (action.type) {
    case "SET_BEHAVIOR_TYPE":
      return {
        ...state,
        selectedBehavior: action.value,
        params: getDefaultParams(action.value),
        drawVersion: state.drawVersion + 1,
      };
    case "SET_PARAM":
      return {
        ...state,
        params: {
          ...state.params,
          [action.key]: action.value,
        },
      };
    case "SET_PARAMS":
      return {
        ...state,
        params: {
          ...state.params,
          ...action.params,
        },
      };
    case "TOGGLE_USE_DRAW":
      return { ...state, useDraw: action.value };
    case "INCREMENT_DRAW_VERSION":
      return { ...state, drawVersion: state.drawVersion + 1 };
    case "ADD_BEHAVIOR_ID":
      return {
        ...state,
        currentBehaviorIds: [...state.currentBehaviorIds, action.id],
      };
    case "REMOVE_BEHAVIOR_ID":
      return {
        ...state,
        currentBehaviorIds: state.currentBehaviorIds.filter(
          (id) => id !== action.id
        ),
      };
    case "CLEAR_BEHAVIOR_IDS":
      return { ...state, currentBehaviorIds: [] };
    case "SET_MANUAL_LATLNG":
      return {
        ...state,
        manualLatLng: { ...state.manualLatLng, [action.key]: action.value },
      };
    case "SET_MANUAL_COORDS":
      return {
        ...state,
        manualLatLng: { lat: action.lat, lng: action.lng },
      };
    default:
      return state;
  }
}

// --- Main Hook ---
export function useBehaviorCreator(initialState = initialBehaviorState) {
  const [state, dispatch] = useReducer(behaviorReducer, initialState);
  const { requestBehavior, behaviors, cancelBehavior } = useBehaviors();
  const {
    state: drawState,
    startDrawing,
    resetDrawing,
    setMetadata,
  } = useGeoDrawing();

  // Use the shared robot selection context
  const { selectedRobotIds } = useRobotSelection();

  // Set up drawing mode when behavior type or drawing preferences change
  useEffect(() => {
    if (!state.useDraw) return;

    // Determine geometry type based on behavior
    const geometryType = getBehaviorGeometry(state.selectedBehavior);

    // Get the appropriate interaction mode
    const interactionMode = getInteractionMode(geometryType);

    // Start drawing with the proper configuration
    startDrawing(geometryType, interactionMode, {
      behaviorType: state.selectedBehavior,
      parameters: state.params,
    });
  }, [state.selectedBehavior, state.useDraw, state.drawVersion, startDrawing]);

  // Update metadata when parameters change
  useEffect(() => {
    if (state.useDraw && drawState.mode === "drawing") {
      setMetadata({
        behaviorType: state.selectedBehavior,
        params: state.params,
      });
    }
  }, [
    state.useDraw,
    drawState.mode,
    state.selectedBehavior,
    state.params,
    setMetadata,
  ]);

  // Clean up completed behaviors
  useEffect(() => {
    const interval = setInterval(() => {
      if (state.currentBehaviorIds.length > 0) {
        const active: string[] = state.currentBehaviorIds.filter(
          (id: string) => behaviors[id]?.status !== "completed"
        );
        if (active.length !== state.currentBehaviorIds.length) {
          active.forEach((id: string) =>
            dispatch({ type: "REMOVE_BEHAVIOR_ID", id })
          );
        }
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [state.currentBehaviorIds, behaviors]);

  // Check if a robot is already involved in an active behavior
  const checkRobotConflicts = useCallback(
    (robotIds: string[]) => {
      return robotIds.filter((robotId) => {
        return Object.entries(behaviors).some(([behaviorId, behavior]) => {
          if (behavior.status === "active" || behavior.status === "accepted") {
            return behavior.robotIds && behavior.robotIds.includes(robotId);
          }
          return false;
        });
      });
    },
    [behaviors]
  );

  // Create behavior function
  const createBehavior = useCallback(async () => {
    // Check for conflicts using the shared robot selection
    const robotsWithActiveBehaviors = checkRobotConflicts(selectedRobotIds);

    if (robotsWithActiveBehaviors.length > 0) {
      console.log(
        "The following robots are already active in other behaviors:",
        robotsWithActiveBehaviors
      );
      // Return the conflicting robots so the caller can handle them
      return { success: false, conflictingRobots: robotsWithActiveBehaviors };
    }

    // Determine geo points from either drawing or manual input
    const geoPoints: [number, number][] =
      state.useDraw && drawState.geoPoints.length > 0
        ? (drawState.geoPoints as [number, number][])
        : [[state.manualLatLng.lat, state.manualLatLng.lng]];

    const finalParams = { ...state.params, geoPoints };

    try {
      // Use the shared selectedRobotIds instead of state.selectedRobotIds
      const behaviorId = await requestBehavior(
        state.selectedBehavior,
        selectedRobotIds,
        finalParams
      );

      if (behaviorId) {
        dispatch({ type: "ADD_BEHAVIOR_ID", id: behaviorId });
        if (state.useDraw) {
          resetDrawing();
          dispatch({ type: "INCREMENT_DRAW_VERSION" });
        }
        return { success: true, behaviorId };
      }
      return { success: false, error: "Failed to get behavior ID" };
    } catch (e) {
      console.error("Failed to create behavior", e);
      return { success: false, error: e };
    }
  }, [
    state.selectedBehavior,
    state.params,
    state.useDraw,
    state.manualLatLng,
    drawState.geoPoints,
    requestBehavior,
    resetDrawing,
    checkRobotConflicts,
    selectedRobotIds, // Now using the shared robot selection
  ]);

  // Function to cancel all active behaviors
  const cancelAllBehaviors = useCallback(() => {
    state.currentBehaviorIds.forEach(cancelBehavior);
    dispatch({ type: "CLEAR_BEHAVIOR_IDS" });
  }, [state.currentBehaviorIds, cancelBehavior]);

  // Function to cancel a specific behavior
  const cancelSingleBehavior = useCallback(
    (behaviorId: string) => {
      cancelBehavior(behaviorId);
      dispatch({ type: "REMOVE_BEHAVIOR_ID", id: behaviorId });
    },
    [cancelBehavior]
  );

  return {
    state,
    dispatch,
    drawState,
    behaviors,
    createBehavior,
    cancelAllBehaviors,
    cancelSingleBehavior,
    checkRobotConflicts,
    currentFields:
      paramFieldsMap[state.selectedBehavior as keyof typeof paramFieldsMap] ||
      [],
    selectedRobotIds, // Expose the shared robot selection
  };
}

// Additional utility to convert behavior enum to readable name
export function convertBehaviorTypeToReadable(type: Behavior): string {
  switch (type) {
    case Behavior.BEHAVIOR_RALLY:
      return "Rally";
    case Behavior.BEHAVIOR_DEFEND:
      return "Defend";
    case Behavior.BEHAVIOR_SURROUND:
      return "Surround";
    case Behavior.BEHAVIOR_MULTI_WAYPOINT_NAVIGATION:
      return "Waypoint Navigation";
    case Behavior.BEHAVIOR_LINE_FORMATION:
      return "Line Formation";
    case Behavior.BEHAVIOR_RAPTOR:
      return "Raptor";
    case Behavior.BEHAVIOR_AREA_COVERAGE:
      return "Area Coverage";
    case Behavior.BEHAVIOR_PATROL:
      return "Patrol";
    default:
      return "Unknown";
  }
}
