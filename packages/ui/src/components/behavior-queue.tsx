import { ScrollArea } from "@/components/ui/scroll-area";
import { BehaviorCard } from "@/components/behavior-card";
import { Label } from "@/components/ui/label";

import { useBehaviors } from "@/hooks/use-behaviors";

export function BehaviorQueue() {
  const { allBehaviors } = useBehaviors();

  const shouldShowQueue = allBehaviors.length > 0;

  return (
    <div>
      {shouldShowQueue && (
        <div className="mt-2">
          <div className="flex items-center justify-between mb-2 px-4">
            <Label>Play Queue ({allBehaviors.length})</Label>
          </div>

          <ScrollArea className="h-[calc(100vh-620px)] min-h-[200px] px-3">
            <div className="py-2 space-y-2">
              {allBehaviors.map((behavior) => (
                <BehaviorCard behavior={behavior} key={behavior.behaviorId} />
              ))}
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  );
}
