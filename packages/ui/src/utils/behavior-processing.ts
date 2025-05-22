import { BehaviorExecutionState } from "@swarmbotics/protos/ros2_interfaces/sbai_behavior_protos/sbai_behavior_protos/behavior_execution_state";
import { BehaviorStatusUI } from "@/types/behavior";

const registeredBehaviors = new Set<string>();

export function autoRegisterBehaviors(
  robotId: string,
  state: BehaviorExecutionState,
  dispatch: Function
): boolean {
  try {
    const foundBehaviorIds = new Set<string>();

    const completed = state.completedBehaviorsMap?.completedBehaviors || {};
    for (const [behaviorId, completedBehavior] of Object.entries(completed)) {
      if (!behaviorId || registeredBehaviors.has(behaviorId)) continue;
      foundBehaviorIds.add(behaviorId);
      dispatch({
        type: "REGISTER_BEHAVIOR",
        behavior: {
          behaviorId,
          behaviorType: completedBehavior.request?.requestedBehavior,
          status: BehaviorStatusUI.COMPLETED,
          robotIds: [robotId],
          robotStatuses: {
            [robotId]: {
              robotId,
              status: BehaviorStatusUI.COMPLETED,
              lastUpdate: new Date(),
            },
          },
          robotPaths: {},
          createdAt: new Date(),
        },
      });
    }

    const active = state.activeBehaviorsMap?.states || {};
    for (const [behaviorId, behaviorState] of Object.entries(active)) {
      if (
        !behaviorId ||
        registeredBehaviors.has(behaviorId) ||
        !behaviorState?.activeBehavior
      )
        continue;
      foundBehaviorIds.add(behaviorId);
      const status =
        behaviorState.status === 3
          ? BehaviorStatusUI.NEEDS_INTERVENTION
          : BehaviorStatusUI.ACTIVE;

      dispatch({
        type: "REGISTER_BEHAVIOR",
        behavior: {
          behaviorId,
          behaviorType: behaviorState.activeBehavior.requestedBehavior,
          status,
          robotIds: [robotId],
          robotStatuses: {
            [robotId]: {
              robotId,
              status,
              lastUpdate: new Date(),
            },
          },
          robotPaths: {},
          createdAt: new Date(),
        },
      });
    }

    const queued = state.behaviorRequestQueue?.requests || [];
    for (const request of queued) {
      const behaviorId = request.behaviorRequestId;
      if (!behaviorId || registeredBehaviors.has(behaviorId)) continue;
      foundBehaviorIds.add(behaviorId);
      dispatch({
        type: "REGISTER_BEHAVIOR",
        behavior: {
          behaviorId,
          behaviorType: request.requestedBehavior,
          status: BehaviorStatusUI.QUEUED,
          robotIds: [robotId],
          robotStatuses: {
            [robotId]: {
              robotId,
              status: BehaviorStatusUI.QUEUED,
              lastUpdate: new Date(),
            },
          },
          robotPaths: {},
          createdAt: new Date(),
        },
      });
    }

    foundBehaviorIds.forEach((id) => registeredBehaviors.add(id));
    return foundBehaviorIds.size > 0;
  } catch (err) {
    console.error("autoRegisterBehaviors error:", err);
    return false;
  }
}

export function processBehaviorState(
  robotId: string,
  state: BehaviorExecutionState,
  behaviors: Record<string, any>,
  dispatch: Function
): void {
  try {
    state.behaviorRequestQueue?.requests?.forEach((request) => {
      const behaviorId = request.behaviorRequestId;
      const behavior = behaviors[behaviorId];
      if (!behavior) return;
      if (
        ![
          BehaviorStatusUI.ACTIVE,
          BehaviorStatusUI.NEEDS_INTERVENTION,
          BehaviorStatusUI.COMPLETED,
          BehaviorStatusUI.FAILED,
          BehaviorStatusUI.CANCELED,
        ].includes(behavior.status)
      ) {
        dispatch({ type: "QUEUE_BEHAVIOR", behaviorId });
      }
    });

    const active = state.activeBehaviorsMap?.states || {};
    Object.entries(active).forEach(([behaviorId, behaviorState]) => {
      if (!behaviorState?.activeBehavior) return;
      const behavior = behaviors[behaviorId];
      if (!behavior) return;

      const newStatus =
        behaviorState.status === 3
          ? BehaviorStatusUI.NEEDS_INTERVENTION
          : BehaviorStatusUI.ACTIVE;
      dispatch({
        type: "UPDATE_STATUS",
        behaviorId,
        robotId,
        status: newStatus,
      });
    });

    const completed = state.completedBehaviorsMap?.completedBehaviors || {};
    Object.entries(completed).forEach(([behaviorId, completedBehavior]) => {
      const behavior = behaviors[behaviorId];
      if (!behavior) return;

      switch (completedBehavior.result) {
        case 1:
          dispatch({
            type: "UPDATE_ROBOT_STATUS",
            behaviorId,
            robotId,
            status: BehaviorStatusUI.COMPLETED,
            iteration: behavior.robotStatuses[robotId]?.iteration || 0,
            navigationStatus: 2,
          });
          break;
        case 2:
          dispatch({ type: "FAIL_BEHAVIOR", behaviorId });
          break;
        case 3:
          dispatch({ type: "CANCEL_BEHAVIOR", behaviorId });
          break;
        default:
          break;
      }
    });
  } catch (err) {
    console.error("processBehaviorState error:", err);
  }
}
