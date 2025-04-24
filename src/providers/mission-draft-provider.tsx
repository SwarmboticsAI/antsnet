"use client";

import React, {
  createContext,
  useContext,
  useReducer,
  ReactNode,
  useMemo,
} from "react";
import { v4 as uuidv4 } from "uuid";
import { Behavior } from "@/protos/generated/sbai_behavior_protos/behavior_request";
import { BehaviorParams } from "@/types/Behavior";

// 🧠 Mission Types
export type MissionStatus = "DRAFT" | "READY";

export interface MissionBehavior {
  id: string;
  behaviorType: Behavior;
  params: BehaviorParams;
  groupIds: string[]; // 🔁 Changed from robotIds to groupIds
  delayMs?: number;
  requiresApproval?: boolean;
  skippable?: boolean;
  dependsOn?: string[];
}

export interface MissionPhase {
  id: string;
  name: string;
  behaviors: MissionBehavior[];
}

export interface StagingArea {
  id: string;
  name: string;
  geoPolygon: [number, number][];
}

export interface RobotGroup {
  id: string;
  name: string;
  size: number;
  preferredRobotIds?: string[];
}

export interface MissionDraft {
  id: string;
  name: string;
  description?: string;
  phases: MissionPhase[];
  stagingAreas: StagingArea[];
  robotGroups: RobotGroup[];
  status: MissionStatus;
  numberOfRobots?: number;
  createdAt: Date;
}

// 🧾 Reducer State
interface MissionDraftState {
  mission: MissionDraft;
}

// 🧩 Reducer Actions
type MissionDraftAction =
  | { type: "SET_NAME"; name: string }
  | { type: "SET_DESCRIPTION"; description: string }
  | { type: "ADD_PHASE"; name: string }
  | { type: "REMOVE_PHASE"; phaseId: string }
  | {
      type: "ADD_BEHAVIOR";
      phaseId: string;
      behavior: Omit<MissionBehavior, "id">;
    }
  | {
      type: "UPDATE_BEHAVIOR";
      behaviorId: string;
      update: Partial<MissionBehavior>;
    }
  | { type: "REMOVE_BEHAVIOR"; behaviorId: string }
  | {
      type: "ADD_STAGING_AREA";
      area: Omit<StagingArea, "id">;
    }
  | { type: "ADD_GROUP"; group: Omit<RobotGroup, "id"> }
  | { type: "REMOVE_GROUP"; groupId: string }
  | { type: "UPDATE_GROUP"; groupId: string; update: Partial<RobotGroup> }
  | { type: "RESET_DRAFT" };

// 🧠 Reducer Logic
const missionDraftReducer = (
  state: MissionDraftState,
  action: MissionDraftAction
): MissionDraftState => {
  switch (action.type) {
    case "SET_NAME":
      return {
        ...state,
        mission: { ...state.mission, name: action.name },
      };

    case "SET_DESCRIPTION":
      return {
        ...state,
        mission: { ...state.mission, description: action.description },
      };

    case "ADD_PHASE":
      return {
        ...state,
        mission: {
          ...state.mission,
          phases: [
            ...state.mission.phases,
            { id: uuidv4(), name: action.name, behaviors: [] },
          ],
        },
      };

    case "REMOVE_PHASE":
      return {
        ...state,
        mission: {
          ...state.mission,
          phases: state.mission.phases.filter((p) => p.id !== action.phaseId),
        },
      };

    case "ADD_BEHAVIOR":
      return {
        ...state,
        mission: {
          ...state.mission,
          phases: state.mission.phases.map((p) =>
            p.id === action.phaseId
              ? {
                  ...p,
                  behaviors: [
                    ...p.behaviors,
                    { ...action.behavior, id: uuidv4() },
                  ],
                }
              : p
          ),
        },
      };

    case "UPDATE_BEHAVIOR":
      return {
        ...state,
        mission: {
          ...state.mission,
          phases: state.mission.phases.map((p) => ({
            ...p,
            behaviors: p.behaviors.map((b) =>
              b.id === action.behaviorId ? { ...b, ...action.update } : b
            ),
          })),
        },
      };

    case "REMOVE_BEHAVIOR":
      return {
        ...state,
        mission: {
          ...state.mission,
          phases: state.mission.phases.map((p) => ({
            ...p,
            behaviors: p.behaviors.filter((b) => b.id !== action.behaviorId),
          })),
        },
      };

    case "ADD_STAGING_AREA":
      return {
        ...state,
        mission: {
          ...state.mission,
          stagingAreas: [
            ...state.mission.stagingAreas,
            { ...action.area, id: uuidv4() },
          ],
        },
      };

    case "ADD_GROUP":
      return {
        ...state,
        mission: {
          ...state.mission,
          robotGroups: [
            ...state.mission.robotGroups,
            { ...action.group, id: uuidv4() },
          ],
        },
      };

    case "REMOVE_GROUP":
      return {
        ...state,
        mission: {
          ...state.mission,
          robotGroups: state.mission.robotGroups.filter(
            (g) => g.id !== action.groupId
          ),
        },
      };

    case "UPDATE_GROUP":
      return {
        ...state,
        mission: {
          ...state.mission,
          robotGroups: state.mission.robotGroups.map((g) =>
            g.id === action.groupId ? { ...g, ...action.update } : g
          ),
        },
      };

    case "RESET_DRAFT":
      return createInitialDraftState();

    default:
      return state;
  }
};

// 🧼 Initial Draft
const createInitialDraftState = (): MissionDraftState => ({
  mission: {
    id: uuidv4(),
    name: "",
    description: "",
    phases: [],
    stagingAreas: [],
    robotGroups: [],
    status: "DRAFT",
    createdAt: new Date(),
  },
});

// 🧩 Context
const MissionDraftContext = createContext<
  | {
      state: MissionDraftState;
      dispatch: React.Dispatch<MissionDraftAction>;
    }
  | undefined
>(undefined);

export const MissionDraftProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(
    missionDraftReducer,
    undefined,
    createInitialDraftState
  );

  const contextValue = useMemo(() => ({ state, dispatch }), [state, dispatch]);

  return (
    <MissionDraftContext.Provider value={contextValue}>
      {children}
    </MissionDraftContext.Provider>
  );
};

export const useMissionDraft = () => {
  const context = useContext(MissionDraftContext);
  if (!context) {
    throw new Error(
      "useMissionDraft must be used within a MissionDraftProvider"
    );
  }
  return context;
};
