"use client";

import { useMemo, useState } from "react";
import { CheckCircle, AlertTriangle, Loader } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useRobotAssignment } from "@/providers/robot-assignment-provider";
import { useSessions } from "@/providers/session-provider";
import { MissionDraft, RobotGroup } from "@/providers/mission-draft-provider";

export function StartSessionPanel({ mission }: { mission: MissionDraft }) {
  const { state } = useRobotAssignment();
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const { requestMultipleSessions } = useSessions();
  const [hasRequested, setHasRequested] = useState(false);

  const assignedRobotIds = useMemo(
    () => Object.keys(state.assignments),
    [state.assignments]
  );

  const groupStatus = useMemo(() => {
    return mission.robotGroups.map((group: RobotGroup) => {
      const assigned = assignedRobotIds.filter(
        (rId) => state.assignments[rId] === group.id
      );
      return {
        group,
        assignedCount: assigned.length,
        isValid: assigned.length === group.size,
      };
    });
  }, [assignedRobotIds, mission.robotGroups, state.assignments]);

  const allGroupsValid = groupStatus.every((g) => g.isValid);

  const handleStart = async () => {
    setStatus("loading");
    setHasRequested(true);

    try {
      await requestMultipleSessions(assignedRobotIds);
      setStatus("success");
    } catch (error) {
      console.error("Failed to start session", error);
      setStatus("error");
    }
  };

  if (!allGroupsValid) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Incomplete Assignments</AlertTitle>
        <AlertDescription>
          All robot groups must be fully assigned before starting a session.
        </AlertDescription>
      </Alert>
    );
  }

  if (!hasRequested) {
    return (
      <div className="flex flex-col gap-4">
        <Alert>
          <CheckCircle className="h-4 w-4 text-green-500" />
          <AlertTitle>Ready to Connect</AlertTitle>
          <AlertDescription>
            Robot assignments are valid. Start the session when ready.
          </AlertDescription>
        </Alert>
        <Button onClick={handleStart} className="w-fit">
          Start Session
        </Button>
      </div>
    );
  }

  if (status === "loading") {
    return (
      <Alert>
        <Loader className="h-4 w-4 animate-spin" />
        <AlertTitle>Connecting to Robots...</AlertTitle>
        <AlertDescription>
          Establishing session with selected units.
        </AlertDescription>
      </Alert>
    );
  }

  if (status === "error") {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Session Failed</AlertTitle>
        <AlertDescription>
          Could not start session. Check connections or robot status.
        </AlertDescription>
      </Alert>
    );
  }

  if (status === "success") {
    return (
      <Alert variant="default">
        <CheckCircle className="h-4 w-4 text-green-500" />
        <AlertTitle>Session Started</AlertTitle>
        <AlertDescription>All robots are connected and ready.</AlertDescription>
      </Alert>
    );
  }

  return null;
}
