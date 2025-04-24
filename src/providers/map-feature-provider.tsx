"use client";

import React, { createContext, useContext, useMemo, useReducer } from "react";
import {
  useMapFeatures,
  useCreateMapFeature,
  useUpdateMapFeature,
  useDeleteMapFeature,
} from "@/hooks/use-map-features";
import type { FeatureType, MapFeature } from "@/types/MapFeature";

// Local UI/draw/edit state
type DrawState = {
  mode: "idle" | "drawing" | "editing";
  featureType: FeatureType | null;
  points: [number, number][]; // [lat, lng]
  metadata: {
    fillColor?: string;
    strokeColor?: string;
    opacity?: number;
    radius?: number;
    label?: string;
    visibility?: "public" | "private";
  };
};

type DrawAction =
  | { type: "START_DRAWING"; featureType: FeatureType }
  | { type: "SET_POINTS"; points: [number, number][] }
  | { type: "ADD_POINT"; point: [number, number] }
  | { type: "REMOVE_LAST_POINT" }
  | { type: "SET_METADATA"; metadata: Partial<DrawState["metadata"]> }
  | { type: "CANCEL" }
  | { type: "FINISH" };

function drawReducer(state: DrawState, action: DrawAction): DrawState {
  switch (action.type) {
    case "START_DRAWING":
      return {
        mode: "drawing",
        featureType: action.featureType,
        points: [],
        metadata: {},
      };
    case "SET_POINTS":
      return {
        ...state,
        points: action.points,
      };
    case "ADD_POINT":
      return {
        ...state,
        points: [...state.points, action.point],
      };
    case "REMOVE_LAST_POINT":
      return {
        ...state,
        points: state.points.slice(0, -1),
      };
    case "SET_METADATA":
      return {
        ...state,
        metadata: {
          ...state.metadata,
          ...action.metadata,
        },
      };
    case "FINISH":
    case "CANCEL":
      return {
        mode: "idle",
        featureType: null,
        points: [],
        metadata: {},
      };
    default:
      return state;
  }
}

type MapFeatureContextType = {
  features: MapFeature[] | undefined;
  isLoading: boolean;
  drawState: DrawState;
  dispatch: React.Dispatch<DrawAction>;
  createFeature: (f: Partial<MapFeature>) => void;
  updateFeature: (id: string, updates: Partial<MapFeature>) => void;
  deleteFeature: (id: string) => void;
};

const MapFeatureContext = createContext<MapFeatureContextType | undefined>(
  undefined
);

export const MapFeatureProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [drawState, dispatch] = useReducer(drawReducer, {
    mode: "idle",
    featureType: null,
    points: [],
    metadata: {},
  });

  const { data: features, isLoading } = useMapFeatures();
  const createMutation = useCreateMapFeature();
  const updateMutation = useUpdateMapFeature();
  const deleteMutation = useDeleteMapFeature();

  const value = useMemo<MapFeatureContextType>(
    () => ({
      features,
      isLoading,
      drawState,
      dispatch,
      createFeature: (f) => createMutation.mutate(f),
      updateFeature: (id, updates) => updateMutation.mutate({ id, updates }),
      deleteFeature: (id) => deleteMutation.mutate(id),
    }),
    [
      features,
      isLoading,
      drawState,
      createMutation,
      updateMutation,
      deleteMutation,
    ]
  );

  return (
    <MapFeatureContext.Provider value={value}>
      {children}
    </MapFeatureContext.Provider>
  );
};

export const useMapFeatureContext = () => {
  const ctx = useContext(MapFeatureContext);
  if (!ctx)
    throw new Error(
      "useMapFeatureContext must be used within MapFeatureProvider"
    );
  return ctx;
};
