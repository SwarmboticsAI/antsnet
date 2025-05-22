import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";

import {
  type GeoDrawState,
  type GeometryType,
  useGeoDrawing,
} from "@/providers/geo-drawing-provider";
import { MapInteractionMode } from "@/providers/map-provider";
import { useRobotSelection } from "@/providers/robot-selection-provider";
import { Behavior } from "@swarmbotics/protos/ros2_interfaces/sbai_behavior_protos/sbai_behavior_protos/behavior_request";
import { type BehaviorParams } from "@/types/behavior";

export type BehaviorDraftState = {
  selectedBehavior: Behavior;
  params: BehaviorParams;
  useDraw: boolean;
  drawVersion: number;
  currentBehaviorIds: string[];
  manualLatLng: { lat: number; lng: number };
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

export const paramFieldsMap = {
  [Behavior.BEHAVIOR_RALLY]: [
    {
      name: "rallyRadiusM",
      label: "Rally Radius (m)",
      type: "number",
      default: 5,
    },
  ],
  [Behavior.BEHAVIOR_DEFEND]: [
    {
      name: "defendRadiusM",
      label: "Defend Radius (m)",
      type: "number",
      default: 5,
    },
  ],
  [Behavior.BEHAVIOR_SURROUND]: [
    {
      name: "surroundRadiusM",
      label: "Surround Radius (m)",
      type: "number",
      default: 5,
    },
  ],
  [Behavior.BEHAVIOR_MULTI_WAYPOINT_NAVIGATION]: [],
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
      default: 7,
    },
    {
      name: "innerRadiusM",
      label: "Inner Radius (m)",
      type: "number",
      default: 5,
    },
  ],
  [Behavior.BEHAVIOR_AREA_COVERAGE]: [
    {
      name: "laneWidthM",
      label: "Lane Width (m)",
      type: "number",
      default: 3,
    },
  ],
  [Behavior.BEHAVIOR_PATROL]: [],
};

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
  return "point";
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

export const initialBehaviorState: BehaviorDraftState = {
  selectedBehavior: Behavior.BEHAVIOR_RALLY,
  params: getDefaultParams(Behavior.BEHAVIOR_RALLY),
  useDraw: true,
  drawVersion: 0,
  currentBehaviorIds: [],
  manualLatLng: { lat: 33.687864, lng: -112.077793 },
};

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
      if (state.currentBehaviorIds.includes(action.id)) {
        return state;
      }
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

type BehaviorCreatorContextType = {
  state: BehaviorDraftState;
  dispatch: React.Dispatch<BehaviorDraftAction>;
  drawState: GeoDrawState;
  resetDrawing: () => void;
  clearDrawing: () => void;
  removeLastPoint: () => void;
  currentFields: { name: string; label: string; type: string; default: any }[];
};

//
const BehaviorCreatorContext = createContext<
  BehaviorCreatorContextType | undefined
>(undefined);

export function BehaviorCreatorProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(behaviorReducer, initialBehaviorState);

  const {
    state: drawState,
    startDrawing,
    removeLastPoint,
    resetDrawing,
    clearDrawing,
    setMetadata,
  } = useGeoDrawing();

  const { selectedRobotIds } = useRobotSelection();

  useEffect(() => {
    if (!state.useDraw) return;

    const geometryType = getBehaviorGeometry(state.selectedBehavior);

    const interactionMode = getInteractionMode(geometryType);

    startDrawing(geometryType, interactionMode, {
      behaviorType: state.selectedBehavior,
      parameters: state.params,
    });
  }, [state.selectedBehavior, state.useDraw, state.drawVersion, startDrawing]);

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

  const currentFields =
    paramFieldsMap[state.selectedBehavior as keyof typeof paramFieldsMap] || [];

  const contextValue: BehaviorCreatorContextType = {
    state,
    dispatch,
    drawState,
    resetDrawing,
    clearDrawing,
    removeLastPoint,
    currentFields,
  };

  return (
    <BehaviorCreatorContext.Provider value={contextValue}>
      {children}
    </BehaviorCreatorContext.Provider>
  );
}

export function useBehaviorCreator() {
  const context = useContext(BehaviorCreatorContext);
  if (context === undefined) {
    throw new Error(
      "useBehaviorCreator must be used within a BehaviorCreatorProvider"
    );
  }
  return context;
}

export function convertBehaviorTypeToReadable(type: Behavior): string {
  switch (type) {
    case Behavior.BEHAVIOR_RALLY:
      return "Rally";
    case Behavior.BEHAVIOR_DEFEND:
      return "Defend";
    case Behavior.BEHAVIOR_SURROUND:
      return "Surround";
    case Behavior.BEHAVIOR_MULTI_WAYPOINT_NAVIGATION:
      return "Waypoint Nav";
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
