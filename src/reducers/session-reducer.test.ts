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

import { sessionReducer, SessionStatus } from "@/reducers/session-reducer";

describe("sessionReducer", () => {
  const initial = {
    sessions: {},
    lastUpdate: 0,
  };

  it("initiates a session request", () => {
    const action = {
      type: "SESSION_REQUEST_INITIATED",
      robotId: "robot1",
      takId: "tak42",
      sequenceNumber: 1,
    } as const;

    const result = sessionReducer(initial, action);
    expect(result.sessions["robot1"]).toMatchObject({
      status: SessionStatus.REQUESTING,
      takId: "tak42",
      sequenceNumber: 1,
    });
  });

  it("handles SESSION_STARTED", () => {
    const state = {
      sessions: {
        robot1: {
          robotId: "robot1",
          takId: "tak42",
          token: null,
          status: SessionStatus.REQUESTING,
          startTime: null,
          lastKeepalive: null,
        },
      },
      lastUpdate: 0,
    };

    const action = {
      type: "SESSION_STARTED",
      robotId: "robot1",
      takId: "tak42",
      token: "abc123",
    } as const;

    const result = sessionReducer(state, action);
    expect(result.sessions["robot1"].status).toBe(SessionStatus.ACTIVE);
    expect(result.sessions["robot1"].token).toBe("abc123");
  });
});
