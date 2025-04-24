import { describe, it, expect } from "vitest";
import {
  behaviorReducer,
  initialBehaviorState,
  BehaviorStatusUI,
  BehaviorInfo,
  RobotPath,
} from "@/reducers/behavior-reducer";

const baseBehavior: BehaviorInfo = {
  behaviorId: "behavior-1",
  behaviorType: 0,
  robotIds: ["robot-a", "robot-b"],
  params: {},
  createdAt: new Date(),
  status: BehaviorStatusUI.UNSPECIFIED,
  robotStatuses: {
    "robot-a": {
      robotId: "robot-a",
      status: BehaviorStatusUI.UNSPECIFIED,
      lastUpdate: new Date(),
    },
    "robot-b": {
      robotId: "robot-b",
      status: BehaviorStatusUI.UNSPECIFIED,
      lastUpdate: new Date(),
    },
  },
  robotPaths: {},
};

describe("behaviorReducer", () => {
  it("registers a new behavior", () => {
    const result = behaviorReducer(initialBehaviorState, {
      type: "REGISTER_BEHAVIOR",
      behavior: baseBehavior,
    });

    expect(result.behaviors["behavior-1"]).toBeDefined();
    expect(result.activeBehaviorId).toBe("behavior-1");
  });

  it("sets the active behavior ID", () => {
    const result = behaviorReducer(
      {
        ...initialBehaviorState,
        behaviors: { "behavior-1": baseBehavior },
      },
      {
        type: "SET_ACTIVE_BEHAVIOR",
        behaviorId: "behavior-1",
      }
    );

    expect(result.activeBehaviorId).toBe("behavior-1");
  });

  it("updates robot status and calculates overall COMPLETED", () => {
    const intermediate = behaviorReducer(
      {
        ...initialBehaviorState,
        behaviors: { "behavior-1": baseBehavior },
      },
      {
        type: "UPDATE_STATUS",
        behaviorId: "behavior-1",
        robotId: "robot-a",
        status: BehaviorStatusUI.COMPLETED,
      }
    );

    const result = behaviorReducer(intermediate, {
      type: "UPDATE_STATUS",
      behaviorId: "behavior-1",
      robotId: "robot-b",
      status: BehaviorStatusUI.COMPLETED,
    });

    expect(result.behaviors["behavior-1"].status).toBe(
      BehaviorStatusUI.COMPLETED
    );
  });

  it("updates robot path correctly", () => {
    const path: RobotPath = {
      robotId: "robot-a",
      path: [
        { lat: 1, lng: 2, timestamp: new Date() },
        { lat: 3, lng: 4, timestamp: new Date() },
      ],
      lastUpdate: new Date(),
    };

    const withBehavior = behaviorReducer(initialBehaviorState, {
      type: "REGISTER_BEHAVIOR",
      behavior: baseBehavior,
    });

    const result = behaviorReducer(withBehavior, {
      type: "UPDATE_PATH",
      behaviorId: "behavior-1",
      robotId: "robot-a",
      path,
    });

    expect(
      result.behaviors["behavior-1"].robotPaths["robot-a"].path.length
    ).toBe(2);
  });

  it("marks behavior as canceled and clears activeBehaviorId", () => {
    const withBehavior = behaviorReducer(
      {
        ...initialBehaviorState,
        activeBehaviorId: "behavior-1",
        behaviors: { "behavior-1": baseBehavior },
      },
      {
        type: "CANCEL_BEHAVIOR",
        behaviorId: "behavior-1",
      }
    );

    expect(withBehavior.behaviors["behavior-1"].status).toBe(
      BehaviorStatusUI.CANCELED
    );
    expect(withBehavior.activeBehaviorId).toBeNull();
  });

  it("handles behavior failure", () => {
    const result = behaviorReducer(
      {
        ...initialBehaviorState,
        behaviors: { "behavior-1": baseBehavior },
      },
      {
        type: "FAIL_BEHAVIOR",
        behaviorId: "behavior-1",
      }
    );

    expect(result.behaviors["behavior-1"].status).toBe(BehaviorStatusUI.FAILED);
  });

  it("replaces state on SET_ALL", () => {
    const newState = {
      behaviors: {
        b2: {
          ...baseBehavior,
          behaviorId: "b2",
        },
      },
      activeBehaviorId: "b2",
      lastUpdate: 9999,
    };

    const result = behaviorReducer(initialBehaviorState, {
      type: "SET_ALL",
      state: newState,
    });

    expect(result).toEqual(newState);
  });
});
