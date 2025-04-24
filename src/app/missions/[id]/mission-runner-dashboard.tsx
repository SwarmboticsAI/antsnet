"use client";

import { useMemo } from "react";
import { CheckCircle, Loader2 } from "lucide-react";
import { useBehaviors } from "@/providers/behavior-provider";
import { BehaviorStatusUI } from "@/reducers/behavior-reducer";
import { Button } from "@/components/ui/button";

export function MissionRunnerDashboard({
  runnerState,
  startMission,
  currentPhase,
}: {
  runnerState: any;
  startMission: () => void;
  currentPhase: any;
}) {
  const { behaviorsByStatus } = useBehaviors();
  const { running, completed, phaseStarted, activeBehaviorIds } = runnerState;

  const activeBehaviors = behaviorsByStatus[BehaviorStatusUI.ACTIVE];
  const completedBehaviors = behaviorsByStatus[BehaviorStatusUI.COMPLETED];

  const statusText = useMemo(() => {
    if (completed) return "✅ Mission Complete";
    if (!running) return "Mission Running...";
    if (activeBehaviorIds.length > 0) return "Mission Running...";
    if (phaseStarted) return "⏸Waiting for behaviors...";
    return "Initializing Phase...";
  }, [running, completed, phaseStarted, activeBehaviorIds]);

  return (
    <div className="p-6 space-y-6 fixed top-15 right-0 bg-sidebar h-full w-96 overflow-y-auto">
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-semibold">Mission Runner</h1>
          <Button onClick={startMission} disabled={running || completed}>
            {completed
              ? "✅ Done"
              : running
              ? "⏳ In Progress"
              : "Start Mission"}
          </Button>
        </div>

        <div className="bg-muted p-4 rounded-md">
          <p className="text-muted-foreground">
            <strong>Status:</strong> {statusText}
          </p>
          {currentPhase && !completed && (
            <p className="text-muted-foreground">
              <strong>Current Phase:</strong> {currentPhase.name}
            </p>
          )}
        </div>
      </div>

      <div>
        <h2 className="text-lg font-medium mb-2">Live Behaviors</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {activeBehaviors.map((b) => (
            <div
              key={b.behaviorId}
              className="border p-3 rounded-md bg-background shadow-sm"
            >
              <div className="font-semibold mb-1">
                Behavior: {b.behaviorType}
              </div>

              <div className="mt-2 text-xs text-muted-foreground">
                <Loader2 className="inline mr-1 animate-spin w-3 h-3" />
                Active
              </div>
            </div>
          ))}

          {completedBehaviors.map((b) => (
            <div
              key={b.behaviorId}
              className="border p-3 rounded-md bg-green-500 shadow-sm"
            >
              <div className="font-semibold mb-1">
                Behavior: {b.behaviorType}
              </div>

              <div className="mt-2 text-xs text-green-700">
                <CheckCircle className="inline mr-1 w-3 h-3" />
                Completed
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
