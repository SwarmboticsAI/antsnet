import { describe, it, expect, beforeEach, vi } from "vitest";
import { reducer, initialState } from "@/reducers/robot-reducer";
import { Robot } from "@/types/Robot";

const baseRobot: Robot = {
  robotId: "robot1",
  heading: 0,
  battery: 100,
  gpsCoordinates: null,
  platformType: "test-platform",
  speed: 1.0,
  ipAddress: "192.168.1.1",
  vpnIpAddress: "10.0.0.1",
  status: "online",
  mode: 0,
  lastSeen: new Date(),
  parkingBrakeState: 0,
  controllingTakId: "SWARM-UI",
};

describe("robot reducer", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2024-01-01T00:00:00.000Z"));
  });

  it("adds robot on HEARTBEAT", () => {
    const action = { type: "HEARTBEAT" as const, robot: baseRobot };
    const result = reducer(initialState, action);
    expect(result.robots["robot1"]).toMatchObject({
      robotId: "robot1",
      status: "online",
    });
    expect(result.lastUpdate).toBe(
      new Date("2024-01-01T00:00:00.000Z").getTime()
    );
  });

  it("updates robot with SYSTEM_TELEMETRY", () => {
    const heartbeat = { type: "HEARTBEAT" as const, robot: baseRobot };
    const state = reducer(initialState, heartbeat);
    const action = {
      type: "SYSTEM_TELEMETRY" as const,
      robotId: "robot1",
      updates: { boomButtonStatus: 2, ecuStatus: 1 },
    };
    const result = reducer(state, action);
    expect(result.robots["robot1"]).toMatchObject({
      boomButtonStatus: 2,
      ecuStatus: 1,
    });
  });

  it("removes robot from state on MARK_OFFLINE", () => {
    const heartbeat = { type: "HEARTBEAT" as const, robot: baseRobot };
    const state = reducer(initialState, heartbeat);
    const result = reducer(state, {
      type: "MARK_OFFLINE",
      robotId: "robot1",
    });
    expect(result.robots["robot1"]).toBeUndefined();
  });

  it("sets selected robot with SELECT", () => {
    const result = reducer(initialState, {
      type: "SELECT",
      robotId: "robot1",
    });
    expect(result.selectedRobotId).toBe("robot1");
  });
});
