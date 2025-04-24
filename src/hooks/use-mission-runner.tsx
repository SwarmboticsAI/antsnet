import { useState, useEffect, useCallback, useRef } from "react";
import { useBehaviors } from "@/providers/behavior-provider";
import { useRobotAssignment } from "@/providers/robot-assignment-provider";
import { MissionDraft } from "@/providers/mission-draft-provider";
import { BehaviorStatusUI } from "@/reducers/behavior-reducer";

// A simple state machine implementation with explicit state transitions
class MissionStateMachine {
  // Mission data
  mission: MissionDraft | null = null;

  // State
  currentState:
    | "idle"
    | "starting"
    | "running_phase"
    | "waiting_for_behaviors"
    | "transitioning"
    | "complete"
    | "error" = "idle";
  currentPhaseIndex: number = 0;
  activeBehaviorIds: string[] = [];
  error: string | null = null;

  // Tracking flags to prevent duplicate processing
  isProcessingPhase: boolean = false;
  isCheckingCompletion: boolean = false;

  // Timestamps for debugging
  lastStateChangeTime: number = 0;
  phaseStartTime: number = 0;

  // Callbacks - these will be set from the React hook
  onStateChange: () => void = () => {};
  requestBehavior: any = null;
  getBehaviors: () => any = () => ({});
  getRobotAssignments: () => any = () => ({});

  constructor() {
    this.lastStateChangeTime = Date.now();
  }

  // Set the mission to run
  setMission(mission: MissionDraft | null) {
    this.mission = mission;
    this.logState("Mission set");
  }

  // Set callback functions
  setCallbacks(callbacks: {
    onStateChange: () => void;
    requestBehavior: any;
    getBehaviors: () => any;
    getRobotAssignments: () => any;
  }) {
    this.onStateChange = callbacks.onStateChange;
    this.requestBehavior = callbacks.requestBehavior;
    this.getBehaviors = callbacks.getBehaviors;
    this.getRobotAssignments = callbacks.getRobotAssignments;
  }

  // Start the mission
  start() {
    if (!this.mission) {
      this.setError("No mission to run");
      return;
    }

    if (this.mission.phases.length === 0) {
      this.transitionTo("complete");
      return;
    }

    // Reset state and start mission
    this.currentPhaseIndex = 0;
    this.activeBehaviorIds = [];
    this.error = null;
    this.transitionTo("starting");

    // Schedule the start of the first phase
    setTimeout(() => {
      this.startCurrentPhase();
    }, 100); // Small delay to ensure state change is processed
  }

  // Reset the state machine
  reset() {
    this.currentState = "idle";
    this.currentPhaseIndex = 0;
    this.activeBehaviorIds = [];
    this.error = null;
    this.isProcessingPhase = false;
    this.isCheckingCompletion = false;
    this.logState("Reset");
    this.onStateChange();
  }

  // Set an error state
  setError(message: string) {
    this.error = message;
    this.transitionTo("error");
    console.error(`Mission error: ${message}`);
  }

  // Transition to a new state
  transitionTo(newState: typeof this.currentState) {
    const oldState = this.currentState;
    this.currentState = newState;
    this.lastStateChangeTime = Date.now();

    this.logState(`State transition: ${oldState} -> ${newState}`);
    this.onStateChange();
  }

  // Start running the current phase
  async startCurrentPhase() {
    if (this.isProcessingPhase) {
      console.warn("Already processing a phase, ignoring duplicate call");
      return;
    }

    // Guard against invalid state
    if (!this.mission) {
      this.setError("No mission available");
      return;
    }

    // Check if we've reached the end of the mission
    if (this.currentPhaseIndex >= this.mission.phases.length) {
      this.transitionTo("complete");
      return;
    }

    // Set processing flag to prevent race conditions
    this.isProcessingPhase = true;
    this.phaseStartTime = Date.now();

    try {
      // Transition to running phase state
      this.transitionTo("running_phase");

      // Get the current phase
      const phase = this.mission.phases[this.currentPhaseIndex];
      if (!phase) {
        this.transitionTo("complete");
        this.isProcessingPhase = false;
        return;
      }

      console.log(
        `Starting phase ${this.currentPhaseIndex}: ${phase.id || "unnamed"}`
      );

      // Get current robot assignments
      const robotAssignments = this.getRobotAssignments().assignments || {};

      // Clear any existing behaviors
      this.activeBehaviorIds = [];

      // Launch each behavior in the phase
      for (const behavior of phase.behaviors) {
        // Get robot IDs for this behavior based on group assignments
        const robotIds = behavior.groupIds.flatMap((groupId: string) =>
          Object.entries(robotAssignments)
            .filter(([, gid]) => gid === groupId)
            .map(([robotId]) => robotId)
        );

        if (robotIds.length === 0) {
          console.warn(
            `No robots assigned to group(s): ${behavior.groupIds.join(", ")}`
          );
        }

        // Request the behavior
        const id = await this.requestBehavior(
          behavior.behaviorType,
          robotIds,
          behavior.params
        );

        // Add behavior ID to tracking list if successful
        if (id) {
          this.activeBehaviorIds.push(id);
          console.log(
            `Added behavior ${id} to phase ${this.currentPhaseIndex}`
          );
        }
      }

      if (this.activeBehaviorIds.length === 0) {
        console.warn(
          `No behaviors created for phase ${this.currentPhaseIndex}`
        );
        // If no behaviors were created, move to the next phase immediately
        this.completeCurrentPhase();
        this.isProcessingPhase = false;
        return;
      }

      // Transition to waiting state
      this.transitionTo("waiting_for_behaviors");
    } catch (error) {
      console.error(`Error starting phase ${this.currentPhaseIndex}:`, error);
      this.setError(`Error launching phase: ${error}`);
    } finally {
      // Clear processing flag
      this.isProcessingPhase = false;
    }
  }

  // Check if all behaviors in the current phase are complete
  checkPhaseCompletion() {
    // Skip if we're not waiting for behaviors or already checking
    if (
      this.currentState !== "waiting_for_behaviors" ||
      this.isCheckingCompletion
    ) {
      return;
    }

    // Set checking flag
    this.isCheckingCompletion = true;

    try {
      if (this.activeBehaviorIds.length === 0) {
        return;
      }

      // Get current behavior states
      const behaviors = this.getBehaviors();

      // Log behavior statuses
      this.activeBehaviorIds.forEach((id) => {
        const behavior = behaviors[id];
        if (behavior) {
          console.log(`Behavior ${id} status: ${behavior.status}`);
        } else {
          console.warn(`Missing behavior ${id}`);
        }
      });

      // Check if all behaviors are complete
      const allComplete = this.activeBehaviorIds.every((id) => {
        const behavior = behaviors[id];
        return behavior?.status === BehaviorStatusUI.COMPLETED;
      });

      if (allComplete) {
        console.log(`✅ Phase ${this.currentPhaseIndex} complete!`);
        this.completeCurrentPhase();
      }
    } finally {
      // Clear checking flag
      this.isCheckingCompletion = false;
    }
  }

  // Complete the current phase and prepare for the next one
  completeCurrentPhase() {
    if (!this.mission) return;

    // Transition to phase transition state
    this.transitionTo("transitioning");

    // Check if this was the last phase
    const isLastPhase =
      this.currentPhaseIndex === this.mission.phases.length - 1;

    if (isLastPhase) {
      // Complete the mission
      this.transitionTo("complete");
    } else {
      // Increment phase index
      this.currentPhaseIndex++;

      // Schedule the next phase with a delay
      const PHASE_DELAY_MS = 2000;
      setTimeout(() => {
        this.startCurrentPhase();
      }, PHASE_DELAY_MS);
    }
  }

  // Get current state information
  getState() {
    return {
      currentState: this.currentState,
      phaseIndex: this.currentPhaseIndex,
      currentPhase: this.mission?.phases[this.currentPhaseIndex] || null,
      activeBehaviorIds: [...this.activeBehaviorIds],
      completed: this.currentState === "complete",
      error: this.error,
      phaseCount: this.mission?.phases.length || 0,
    };
  }

  // Log current state for debugging
  logState(message: string) {
    console.log(`[MissionStateMachine] ${message}:`, {
      state: this.currentState,
      phaseIndex: this.currentPhaseIndex,
      activeBehaviors: this.activeBehaviorIds.length,
      time: new Date().toISOString(),
      timeSinceLastChange: Date.now() - this.lastStateChangeTime,
    });
  }
}

// React hook that wraps the state machine
export function useMissionRunner(mission: MissionDraft | null) {
  const { requestBehavior, behaviors } = useBehaviors();
  const { state: robotAssignmentState } = useRobotAssignment();

  // Use a ref to hold the state machine instance
  const stateMachine = useRef<MissionStateMachine>(new MissionStateMachine());

  // Use state to trigger re-renders when the state machine changes
  const [_, setUpdateCounter] = useState(0);

  // Setup callbacks and mission when dependencies change
  useEffect(() => {
    // Set callbacks
    stateMachine.current.setCallbacks({
      onStateChange: () => {
        // Force re-render when state machine changes
        setUpdateCounter((prev) => prev + 1);
      },
      requestBehavior,
      getBehaviors: () => behaviors,
      getRobotAssignments: () => robotAssignmentState,
    });

    // Set mission
    stateMachine.current.setMission(mission);
  }, [mission, requestBehavior, behaviors, robotAssignmentState]);

  // Check for phase completion when behaviors change
  useEffect(() => {
    if (stateMachine.current.currentState === "waiting_for_behaviors") {
      stateMachine.current.checkPhaseCompletion();
    }
  }, [behaviors]);

  // Start the mission
  const startMission = useCallback(() => {
    stateMachine.current.start();
  }, []);

  // Reset the mission runner
  const resetMission = useCallback(() => {
    stateMachine.current.reset();
  }, []);

  // Get current state
  const state = stateMachine.current.getState();

  return {
    startMission,
    resetMission,
    currentPhase: state.currentPhase,
    runnerState: {
      phaseIndex: state.phaseIndex,
      status:
        state.currentState === "idle"
          ? "idle"
          : state.currentState === "complete"
          ? "complete"
          : state.currentState === "error"
          ? "error"
          : state.currentState === "waiting_for_behaviors"
          ? "waiting"
          : "running",
      activeBehaviorIds: state.activeBehaviorIds,
      completed: state.completed,
      error: state.error,
    },
    debug: {
      internalState: state.currentState,
      phaseCount: state.phaseCount,
    },
  };
}
