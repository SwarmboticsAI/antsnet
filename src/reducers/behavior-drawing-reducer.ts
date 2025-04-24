import { Behavior } from "@/protos/generated/sbai_behavior_protos/behavior_request";
import { MapInteractionMode } from "@/providers/map-provider";
import { BehaviorParams } from "@/types/Behavior";
import { v4 as uuidv4 } from "uuid";

export interface BehaviorDraft {
  id: string;
  behaviorType: Behavior;
  points: [number, number][];
  parameters: BehaviorParams;
  createdAt: Date;
}

interface State {
  draft: BehaviorDraft | null;
  highlightedBehaviorId: string | null;
  isExecuting: boolean;
  executionError: string | null;
}

export const initialState: State = {
  draft: null,
  highlightedBehaviorId: null,
  isExecuting: false,
  executionError: null,
};

type Action =
  | { type: "START_DRAFT"; behaviorType: Behavior }
  | { type: "ADD_POINT"; point: [number, number] }
  | { type: "REMOVE_LAST_POINT" }
  | { type: "SET_PARAM"; key: keyof BehaviorParams; value: any }
  | { type: "CANCEL_DRAFT" }
  | { type: "HIGHLIGHT"; id: string | null }
  | { type: "EXEC_START" }
  | { type: "EXEC_SUCCESS" }
  | { type: "EXEC_FAIL"; error: string };

export function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "START_DRAFT": {
      const type = action.behaviorType;
      const defaultParams: BehaviorParams = getDefaultParamsForType(type);
      return {
        ...state,
        draft: {
          id: uuidv4(),
          behaviorType: type,
          points: [],
          parameters: defaultParams,
          createdAt: new Date(),
        },
        executionError: null,
      };
    }
    case "ADD_POINT": {
      if (!state.draft) return state;
      const interactionMode = getInteractionModeForBehaviorType(
        state.draft.behaviorType
      );
      const points =
        interactionMode === MapInteractionMode.SELECTING_CENTER
          ? [action.point]
          : [...state.draft.points, action.point];
      return {
        ...state,
        draft: {
          ...state.draft,
          points,
        },
      };
    }
    case "REMOVE_LAST_POINT": {
      if (!state.draft) return state;
      return {
        ...state,
        draft: {
          ...state.draft,
          points: state.draft.points.slice(0, -1),
        },
      };
    }
    case "SET_PARAM": {
      if (!state.draft) return state;
      return {
        ...state,
        draft: {
          ...state.draft,
          parameters: {
            ...state.draft.parameters,
            [action.key]: action.value,
          },
        },
      };
    }
    case "CANCEL_DRAFT": {
      return { ...state, draft: null };
    }
    case "HIGHLIGHT": {
      return { ...state, highlightedBehaviorId: action.id };
    }
    case "EXEC_START": {
      return { ...state, isExecuting: true, executionError: null };
    }
    case "EXEC_SUCCESS": {
      return { ...state, isExecuting: false, draft: null };
    }
    case "EXEC_FAIL": {
      return { ...state, isExecuting: false, executionError: action.error };
    }
    default:
      return state;
  }
}

export function getDefaultParamsForType(type: Behavior): BehaviorParams {
  switch (type) {
    case Behavior.BEHAVIOR_AREA_COVERAGE:
      return { laneWidthM: 5 };
    case Behavior.BEHAVIOR_DEFEND:
      return { defendRadiusM: 10 };
    case Behavior.BEHAVIOR_LINE_FORMATION:
      return { separationDistanceM: 5, lineYawDeg: 0, robotYawDeg: 0 };
    case Behavior.BEHAVIOR_MULTI_WAYPOINT_NAVIGATION:
      return { desiredFinalYawDeg: 0 };
    case Behavior.BEHAVIOR_RALLY:
      return { rallyRadiusM: 10 };
    case Behavior.BEHAVIOR_RAPTOR:
      return { outerRadius: 20, innerRadius: 10 };
    case Behavior.BEHAVIOR_SURROUND:
      return { surroundRadiusM: 10 };
    default:
      return {};
  }
}

export function getInteractionModeForBehaviorType(
  type: Behavior
): MapInteractionMode {
  switch (type) {
    case Behavior.BEHAVIOR_AREA_COVERAGE:
      return MapInteractionMode.DRAWING_POLYGON;
    case Behavior.BEHAVIOR_DEFEND:
    case Behavior.BEHAVIOR_LINE_FORMATION:
    case Behavior.BEHAVIOR_RAPTOR:
      return MapInteractionMode.DRAWING_PERIMETER;
    case Behavior.BEHAVIOR_RALLY:
    case Behavior.BEHAVIOR_SURROUND:
      return MapInteractionMode.SELECTING_CENTER;
    case Behavior.BEHAVIOR_MULTI_WAYPOINT_NAVIGATION:
    case Behavior.BEHAVIOR_PATROL:
      return MapInteractionMode.DRAWING_POINTS;
    default:
      return MapInteractionMode.VIEWING;
  }
}
