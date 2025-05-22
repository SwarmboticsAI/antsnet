export enum TeleopState {
  IDLE = "idle",
  REQUESTING = "requesting",
  ACTIVE = "active",
  TERMINATING = "terminating",
  ERROR = "error",
}

interface TeleopStateModel {
  robotId: string | null;
  state: TeleopState;
  error: string | null;
}

export const initialTeleopState: TeleopStateModel = {
  robotId: null,
  state: TeleopState.IDLE,
  error: null,
};

type TeleopAction =
  | { type: "START_REQUEST"; robotId: string }
  | { type: "ACTIVATE" }
  | { type: "TERMINATE" }
  | { type: "RESET" }
  | { type: "FAIL"; error: string }
  | { type: "CLEAR_ERROR" };

export function teleopReducer(
  state: TeleopStateModel,
  action: TeleopAction
): TeleopStateModel {
  switch (action.type) {
    case "START_REQUEST":
      return {
        robotId: action.robotId,
        state: TeleopState.REQUESTING,
        error: null,
      };
    case "ACTIVATE":
      return { ...state, state: TeleopState.ACTIVE, error: null };
    case "TERMINATE":
      return { ...state, state: TeleopState.TERMINATING };
    case "RESET":
      return { robotId: null, state: TeleopState.IDLE, error: null };
    case "FAIL":
      return { ...state, state: TeleopState.ERROR, error: action.error };
    case "CLEAR_ERROR":
      return { ...state, error: null };
    default:
      return state;
  }
}
