import { describe, it, expect, vi } from "vitest";
vi.mock("@eclipse-zenoh/zenoh-ts", () => ({
  KeyExpr: class {
    constructor(public key: string) {}
  },
  useZenoh: () => ({
    session: {
      put: vi.fn(),
      declare_subscriber: vi.fn(() => ({
        close: vi.fn(),
      })),
    },
    isConnected: true,
  }),
}));

import {
  teleopReducer,
  initialTeleopState,
  TeleopState,
} from "@/reducers/teleop-reducer";

describe("teleopReducer", () => {
  it("handles START_REQUEST", () => {
    const action = { type: "START_REQUEST", robotId: "robot123" } as const;
    const result = teleopReducer(initialTeleopState, action);
    expect(result).toEqual({
      robotId: "robot123",
      state: TeleopState.REQUESTING,
      error: null,
    });
  });

  it("transitions to ACTIVE", () => {
    const state = {
      ...initialTeleopState,
      robotId: "robot123",
      state: TeleopState.REQUESTING,
    };
    const result = teleopReducer(state, { type: "ACTIVATE" });
    expect(result.state).toBe(TeleopState.ACTIVE);
  });

  it("handles TERMINATE", () => {
    const state = {
      ...initialTeleopState,
      robotId: "robot123",
      state: TeleopState.ACTIVE,
    };
    const result = teleopReducer(state, { type: "TERMINATE" });
    expect(result.state).toBe(TeleopState.TERMINATING);
  });

  it("resets state", () => {
    const state = {
      robotId: "robot123",
      state: TeleopState.ACTIVE,
      error: "oops",
    };
    const result = teleopReducer(state, { type: "RESET" });
    expect(result).toEqual(initialTeleopState);
  });

  it("handles FAIL", () => {
    const result = teleopReducer(initialTeleopState, {
      type: "FAIL",
      error: "Something went wrong",
    });
    expect(result.state).toBe(TeleopState.ERROR);
    expect(result.error).toBe("Something went wrong");
  });
});
