import { useMemo } from "react";

import { ScrollArea } from "@/components/ui/scroll-area";
import { BehaviorCard } from "@/components/behavior-card";
import { Label } from "@/components/ui/label";

import { useRobotTaskStore } from "@/stores/task-store";

export function BehaviorQueue() {
  const { getSortedAggregatedBehaviors } = useRobotTaskStore();

  const behaviors = getSortedAggregatedBehaviors();

  const shouldShowQueue: boolean = useMemo(
    () => Object.keys(behaviors).length > 0,
    [behaviors]
  );

  return (
    <div className="border-t pt-3">
      <div className="flex items-center my-2 px-5">
        <Label className="text-sm font-semibold">
          Play Queue ({Object.keys(behaviors).length})
        </Label>
      </div>

      {shouldShowQueue ? (
        <div className="mt-2">
          <ScrollArea className="h-[calc(100vh-540px)] min-h-[200px] px-4">
            <div className="py-2 space-y-2">
              {Object.entries(behaviors)?.map(([, behavior]) => {
                return (
                  <BehaviorCard
                    behavior={behavior[1]}
                    key={behavior[0]}
                    behaviorId={behavior[0]}
                  />
                );
              })}
            </div>
          </ScrollArea>
        </div>
      ) : null}
    </div>
  );
}
