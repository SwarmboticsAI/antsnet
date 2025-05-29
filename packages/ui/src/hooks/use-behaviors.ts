// src/hooks/useBehaviors.ts

import { useMemo } from "react";
import { useRobotTaskStore } from "@/stores/task-store";
import { BehaviorStatusUI } from "@/types/behavior";
import { BehaviorExecutionState } from "@swarmbotics/protos/ros2_interfaces/sbai_protos/sbai_protos/behavior_execution_state";
import type { ActiveBehaviorState } from "@swarmbotics/protos/ros2_interfaces/sbai_protos/sbai_protos/active_behavior_states";
import type { CompletedBehaviors } from "@swarmbotics/protos/ros2_interfaces/sbai_protos/sbai_protos/completed_behaviors";
import type { BehaviorRequest } from "@swarmbotics/protos/ros2_interfaces/sbai_protos/sbai_protos/behavior_request";

export type ResolvedBehavior = {
  behaviorId: string;
  robotId: string;
  status: BehaviorStatusUI;
  source: "queued" | "active" | "completed";
  active?: ActiveBehaviorState;
  completed?: CompletedBehaviors;
  request?: BehaviorRequest;
  rawState: BehaviorExecutionState;
};

export function useBehaviors() {
  const taskTables = useRobotTaskStore((s) => s.taskTables);

  const allBehaviors: ResolvedBehavior[] = useMemo(() => {
    return Object.entries(taskTables).flatMap(([robotId, task]) => {
      const list: ResolvedBehavior[] = [];

      for (const request of task.behaviorRequestQueue?.requests ?? []) {
        list.push({
          behaviorId: request.behaviorRequestId,
          robotId,
          status: BehaviorStatusUI.QUEUED,
          source: "queued",
          request,
          rawState: task,
        });
      }

      for (const [id, state] of Object.entries(
        task.activeBehaviorsMap?.states ?? {}
      )) {
        const status =
          state.status === 3
            ? BehaviorStatusUI.NEEDS_INTERVENTION
            : state.status === 2
            ? BehaviorStatusUI.PAUSED
            : BehaviorStatusUI.ACTIVE;

        list.push({
          behaviorId: id,
          robotId,
          status,
          source: "active",
          active: state,
          request: state.activeBehavior,
          rawState: task,
        });
      }

      for (const [id, completed] of Object.entries(
        task.completedBehaviorsMap?.completedBehaviors ?? {}
      )) {
        const status = (() => {
          switch (completed.result) {
            case 1:
              return BehaviorStatusUI.COMPLETED;
            case 2:
              return BehaviorStatusUI.FAILED;
            case 3:
              return BehaviorStatusUI.CANCELED;
            default:
              return BehaviorStatusUI.UNSPECIFIED;
          }
        })();

        list.push({
          behaviorId: id,
          robotId,
          status,
          source: "completed",
          completed: { completedBehaviors: { [id]: completed } },
          request: completed.request,
          rawState: task,
        });
      }

      return list;
    });
  }, [taskTables]);

  const behaviorsByStatus = useMemo(() => {
    const grouped: Record<BehaviorStatusUI, ResolvedBehavior[]> = {
      [BehaviorStatusUI.UNSPECIFIED]: [],
      [BehaviorStatusUI.QUEUED]: [],
      [BehaviorStatusUI.PENDING]: [],
      [BehaviorStatusUI.ACTIVE]: [],
      [BehaviorStatusUI.PAUSED]: [],
      [BehaviorStatusUI.NEEDS_INTERVENTION]: [],
      [BehaviorStatusUI.COMPLETED]: [],
      [BehaviorStatusUI.FAILED]: [],
      [BehaviorStatusUI.CANCELED]: [],
      [BehaviorStatusUI.ACCEPTED]: [],
    };

    for (const behavior of allBehaviors) {
      grouped[behavior.status].push(behavior);
    }

    return grouped;
  }, [allBehaviors]);

  const behaviorsByRobotId = useMemo(() => {
    const grouped: Record<string, ResolvedBehavior[]> = {};
    for (const behavior of allBehaviors) {
      if (!grouped[behavior.robotId]) {
        grouped[behavior.robotId] = [];
      }
      (grouped[behavior.robotId] ??= []).push(behavior);
    }
    return grouped;
  }, [allBehaviors]);

  const getBehaviorsThatNeedIntervention = () =>
    behaviorsByStatus[BehaviorStatusUI.NEEDS_INTERVENTION];

  return {
    allBehaviors,
    behaviorsByRobotId,
    behaviorsByStatus,
    getBehaviorsThatNeedIntervention,
  };
}
