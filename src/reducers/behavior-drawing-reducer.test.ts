import { describe, it, expect, vi } from "vitest";
import { reducer, initialState } from "@/reducers/behavior-drawing-reducer";
import { Behavior } from "@/protos/generated/sbai_behavior_protos/behavior_request";

const mockDate = new Date("2024-01-01T00:00:00Z");
vi.useFakeTimers().setSystemTime(mockDate);

describe("behaviorDrawingReducer", () => {
  it("starts a new draft with default parameters", () => {
    const state = reducer(initialState, {
      type: "START_DRAFT",
      behaviorType: Behavior.BEHAVIOR_LINE_FORMATION,
    });
    expect(state.draft).not.toBeNull();
    expect(state.draft?.behaviorType).toBe(Behavior.BEHAVIOR_LINE_FORMATION);
    expect(state.draft?.parameters.separationDistanceM).toBe(5);
    expect(state.draft?.createdAt.toISOString()).toBe(mockDate.toISOString());
  });

  it("adds a point to the draft", () => {
    const startState = reducer(initialState, {
      type: "START_DRAFT",
      behaviorType: Behavior.BEHAVIOR_AREA_COVERAGE,
    });
    const updated = reducer(startState, {
      type: "ADD_POINT",
      point: [10, 20],
    });
    expect(updated.draft?.points).toEqual([[10, 20]]);
  });

  it("overwrites center point if behavior is center-based", () => {
    const startState = reducer(initialState, {
      type: "START_DRAFT",
      behaviorType: Behavior.BEHAVIOR_SURROUND,
    });
    const stateWithFirst = reducer(startState, {
      type: "ADD_POINT",
      point: [5, 5],
    });
    const overwritten = reducer(stateWithFirst, {
      type: "ADD_POINT",
      point: [10, 10],
    });
    expect(overwritten.draft?.points).toEqual([[10, 10]]);
  });

  it("removes the last point", () => {
    let state = reducer(initialState, {
      type: "START_DRAFT",
      behaviorType: Behavior.BEHAVIOR_PATROL,
    });
    state = reducer(state, { type: "ADD_POINT", point: [1, 2] });
    state = reducer(state, { type: "ADD_POINT", point: [3, 4] });
    const updated = reducer(state, { type: "REMOVE_LAST_POINT" });
    expect(updated.draft?.points).toEqual([[1, 2]]);
  });

  it("sets a parameter value", () => {
    const state = reducer(initialState, {
      type: "START_DRAFT",
      behaviorType: Behavior.BEHAVIOR_RALLY,
    });
    const updated = reducer(state, {
      type: "SET_PARAM",
      key: "rallyRadiusM",
      value: 25,
    });
    expect(updated.draft?.parameters.rallyRadiusM).toBe(25);
  });

  it("cancels a draft", () => {
    const state = reducer(initialState, {
      type: "START_DRAFT",
      behaviorType: Behavior.BEHAVIOR_RAPTOR,
    });
    const updated = reducer(state, { type: "CANCEL_DRAFT" });
    expect(updated.draft).toBeNull();
  });

  it("tracks highlight state", () => {
    const updated = reducer(initialState, {
      type: "HIGHLIGHT",
      id: "abc123",
    });
    expect(updated.highlightedBehaviorId).toBe("abc123");
  });

  it("toggles execution state", () => {
    let state = reducer(initialState, { type: "EXEC_START" });
    expect(state.isExecuting).toBe(true);
    expect(state.executionError).toBeNull();

    state = reducer(state, {
      type: "EXEC_FAIL",
      error: "something went wrong",
    });
    expect(state.isExecuting).toBe(false);
    expect(state.executionError).toBe("something went wrong");

    state = reducer(state, { type: "EXEC_SUCCESS" });
    expect(state.isExecuting).toBe(false);
    expect(state.draft).toBeNull();
  });
});
