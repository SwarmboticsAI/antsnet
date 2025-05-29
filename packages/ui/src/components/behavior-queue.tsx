import { useMemo, useState } from "react";

import { ScrollArea } from "@/components/ui/scroll-area";
import { BehaviorCard } from "@/components/behavior-card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";

import { useBehaviors } from "@/hooks/use-behaviors";

export function BehaviorQueue() {
  const { behaviorsByRobotId } = useBehaviors();
  const [selectedRobotId, setSelectedRobotId] = useState<string>(
    Object.keys(useBehaviors().behaviorsByRobotId)[0] || ""
  );

  const shouldShowQueue: boolean = useMemo(
    () =>
      !!selectedRobotId &&
      Array.isArray(behaviorsByRobotId[selectedRobotId]) &&
      behaviorsByRobotId[selectedRobotId].length > 0,
    [behaviorsByRobotId, selectedRobotId]
  );

  return (
    <div className="border-t pt-3">
      <div className="flex items-center my-2 px-5">
        <Label className="text-sm font-semibold">
          Play Queue (
          {selectedRobotId
            ? behaviorsByRobotId[selectedRobotId]?.length ?? 0
            : 0}
          )
        </Label>
      </div>
      {Object.values(behaviorsByRobotId).length ? (
        <div className="flex items-center justify-between px-4">
          <Select value={selectedRobotId} onValueChange={setSelectedRobotId}>
            <SelectTrigger className="w-full">
              <Label className="text-sm">
                {selectedRobotId
                  ? `Queue for: ${selectedRobotId.toUpperCase()}`
                  : "Select Robot Queue"}
              </Label>
            </SelectTrigger>
            <SelectContent>
              {Object.keys(behaviorsByRobotId).map((robotId) => (
                <SelectItem key={robotId} value={robotId}>
                  {robotId.toUpperCase()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ) : null}
      {shouldShowQueue ? (
        <div className="mt-2">
          <ScrollArea className="h-[calc(100vh-620px)] min-h-[200px] px-4">
            <div className="py-2 space-y-2">
              {selectedRobotId &&
                behaviorsByRobotId[selectedRobotId]?.map((behavior) => (
                  <BehaviorCard behavior={behavior} key={behavior.behaviorId} />
                ))}
            </div>
          </ScrollArea>
        </div>
      ) : null}
    </div>
  );
}
