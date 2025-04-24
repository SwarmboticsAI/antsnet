export interface RobotAssignmentState {
  assignments: Record<string, string>; // robotId -> groupId
}

export type RobotAssignmentAction =
  | { type: "ASSIGN_ROBOT"; robotId: string; groupId: string }
  | { type: "UNASSIGN_ROBOT"; robotId: string }
  | { type: "RESET_ASSIGNMENTS" };

export const robotAssignmentReducer = (
  state: RobotAssignmentState,
  action: RobotAssignmentAction
): RobotAssignmentState => {
  switch (action.type) {
    case "ASSIGN_ROBOT":
      return {
        ...state,
        assignments: {
          ...state.assignments,
          [action.robotId]: action.groupId,
        },
      };

    case "UNASSIGN_ROBOT": {
      const { [action.robotId]: _, ...rest } = state.assignments;
      return {
        ...state,
        assignments: rest,
      };
    }

    case "RESET_ASSIGNMENTS":
      return { assignments: {} };

    default:
      return state;
  }
};
