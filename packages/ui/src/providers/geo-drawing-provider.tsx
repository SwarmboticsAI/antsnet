// 1. Core GeoDrawing Provider (Base functionality)
import React, {
  createContext,
  useContext,
  useReducer,
  type ReactNode,
  useCallback,
} from "react";
import { MapInteractionMode } from "@/providers/map-provider";

// Core drawing types
export type GeoDrawMode = "idle" | "drawing" | "editing";
export type GeometryType = "point" | "line" | "polygon";

export interface GeoDrawState {
  mode: GeoDrawMode;
  geometryType: GeometryType;
  geoPoints: [number, number][];
  interactionMode: MapInteractionMode;
  metadata?: Record<string, any>; // Generic metadata for extensibility
}

type GeoDrawAction =
  | {
      type: "START_DRAWING";
      geometryType: GeometryType;
      interactionMode: MapInteractionMode;
      metadata?: Record<string, any>;
    }
  | { type: "SET_METADATA"; metadata: Record<string, any> }
  | { type: "ADD_POINT"; point: [number, number] }
  | { type: "REMOVE_LAST_POINT" }
  | { type: "CLEAR_DRAWING" }
  | { type: "RESET_DRAWING" };

const initialGeoDrawState: GeoDrawState = {
  mode: "idle",
  geometryType: "point",
  geoPoints: [],
  interactionMode: MapInteractionMode.VIEWING,
  metadata: {},
};

function geoDrawReducer(
  state: GeoDrawState,
  action: GeoDrawAction
): GeoDrawState {
  switch (action.type) {
    case "START_DRAWING":
      return {
        mode: "drawing",
        geometryType: action.geometryType,
        geoPoints: [],
        interactionMode: action.interactionMode,
        metadata: action.metadata || {},
      };
    case "ADD_POINT":
      return {
        ...state,
        geoPoints: [...state.geoPoints, action.point],
      };
    case "REMOVE_LAST_POINT":
      return {
        ...state,
        geoPoints: state.geoPoints.slice(0, -1),
      };
    case "SET_METADATA":
      return {
        ...state,
        metadata: {
          ...state.metadata,
          ...action.metadata,
        },
      };
    case "CLEAR_DRAWING":
      return {
        ...state,
        geoPoints: [],
      };
    case "RESET_DRAWING":
      return initialGeoDrawState;
    default:
      return state;
  }
}

interface GeoDrawContextType {
  state: GeoDrawState;
  startDrawing: (
    geometryType: GeometryType,
    interactionMode: MapInteractionMode,
    metadata?: Record<string, any>
  ) => void;
  setMetadata: (metadata: Record<string, any>) => void;
  addPoint: (point: [number, number]) => void;
  removeLastPoint: () => void;
  resetDrawing: () => void;
  clearDrawing: () => void;
  isDrawing: boolean;
}

const GeoDrawContext = createContext<GeoDrawContextType | undefined>(undefined);

export const GeoDrawProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(geoDrawReducer, initialGeoDrawState);

  const startDrawing = useCallback(
    (
      geometryType: GeometryType,
      interactionMode: MapInteractionMode,
      metadata?: Record<string, any>
    ) => {
      dispatch({
        type: "START_DRAWING",
        geometryType,
        interactionMode,
        metadata,
      });
    },
    []
  );

  const addPoint = useCallback(
    (point: [number, number]) => {
      if (state.mode !== "drawing") return;
      // Only add one point for point geometry
      if (state.geometryType === "point" && state.geoPoints.length >= 1) return;
      dispatch({ type: "ADD_POINT", point });
    },
    [state.mode, state.geometryType, state.geoPoints]
  );

  const removeLastPoint = useCallback(() => {
    if (state.mode !== "drawing" || state.geoPoints.length === 0) return;
    dispatch({ type: "REMOVE_LAST_POINT" });
  }, [state.mode, state.geoPoints]);

  const setMetadata = useCallback((metadata: Record<string, any>) => {
    dispatch({ type: "SET_METADATA", metadata });
  }, []);

  const resetDrawing = useCallback(() => {
    dispatch({ type: "RESET_DRAWING" });
  }, []);

  const clearDrawing = useCallback(() => {
    dispatch({ type: "CLEAR_DRAWING" });
  }, []);

  const isDrawing = state.mode === "drawing";

  return (
    <GeoDrawContext.Provider
      value={{
        state,
        startDrawing,
        addPoint,
        removeLastPoint,
        clearDrawing,
        resetDrawing,
        setMetadata,
        isDrawing,
      }}
    >
      {children}
    </GeoDrawContext.Provider>
  );
};

export const useGeoDrawing = (): GeoDrawContextType => {
  const context = useContext(GeoDrawContext);
  if (!context) {
    throw new Error("useGeoDrawing must be used within a GeoDrawProvider");
  }
  return context;
};
