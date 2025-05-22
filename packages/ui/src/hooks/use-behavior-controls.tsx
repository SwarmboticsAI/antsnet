import { useCallback, useState } from "react";

import { pauseBehavior } from "@/lib/behaviors/pause";
import { resumeBehavior } from "@/lib/behaviors/resume";
import { cancelBehavior } from "@/lib/behaviors/cancel";
import { restartBehavior } from "@/lib/behaviors/restart";

export function useBehaviorControls() {
  const [loading, setLoading] = useState<{
    pause: boolean;
    resume: boolean;
    cancel: boolean;
    restart: boolean;
  }>({
    pause: false,
    resume: false,
    cancel: false,
    restart: false,
  });

  const handlePauseBehavior = useCallback(
    ({
      behaviorRequestId,
      participatingRobotIds,
    }: {
      behaviorRequestId: string;
      participatingRobotIds: string[];
    }) => {
      setLoading({
        ...loading,
        pause: true,
      });

      pauseBehavior({
        behaviorRequestId,
        participatingRobotIds,
      })
        .then((response) => {
          console.log("Behavior paused successfully:", response);
          setLoading({
            ...loading,
            pause: false,
          });
        })
        .catch((error) => {
          console.error("Error pausing behavior:", error);
          setLoading({
            ...loading,
            pause: false,
          });
        })
        .finally(() => {
          setLoading({
            ...loading,
            pause: false,
          });
        });
    },
    []
  );

  const handleResumeBehavior = useCallback(
    ({
      behaviorRequestId,
      participatingRobotIds,
    }: {
      behaviorRequestId: string;
      participatingRobotIds: string[];
    }) => {
      setLoading({
        ...loading,
        resume: true,
      });

      resumeBehavior({
        behaviorRequestId,
        participatingRobotIds,
      })
        .then((response) => {
          console.log("Behavior resumed successfully:", response);
          setLoading({
            ...loading,
            resume: false,
          });
        })
        .catch((error) => {
          console.error("Error resuming behavior:", error);
          setLoading({
            ...loading,
            resume: false,
          });
        })
        .finally(() => {
          setLoading({
            ...loading,
            resume: false,
          });
        });
    },
    []
  );

  const handleCancelBehavior = useCallback(
    ({
      behaviorRequestId,
      participatingRobotIds,
    }: {
      behaviorRequestId: string;
      participatingRobotIds: string[];
    }) => {
      setLoading({
        ...loading,
        cancel: true,
      });

      cancelBehavior({
        behaviorRequestId,
        participatingRobotIds,
      })
        .then((response) => {
          console.log("Behavior canceled successfully:", response);
          setLoading({
            ...loading,
            cancel: false,
          });
        })
        .catch((error) => {
          console.error("Error canceling behavior:", error);
          setLoading({
            ...loading,
            cancel: false,
          });
        })
        .finally(() => {
          setLoading({
            ...loading,
            cancel: false,
          });
        });
    },
    []
  );

  const handleRestartBehavior = useCallback(
    ({
      behaviorRequestId,
      participatingRobotIds,
    }: {
      behaviorRequestId: string;
      participatingRobotIds: string[];
    }) => {
      setLoading({
        ...loading,
        restart: true,
      });

      restartBehavior({
        behaviorRequestId,
        participatingRobotIds,
      })
        .then((response) => {
          console.log("Behavior restarted successfully:", response);
          setLoading({
            ...loading,
            restart: false,
          });
        })
        .catch((error) => {
          console.error("Error restarting behavior:", error);
          setLoading({
            ...loading,
            restart: false,
          });
        })
        .finally(() => {
          setLoading({
            ...loading,
            restart: false,
          });
        });
    },
    []
  );

  return {
    loading,
    pauseBehavior: handlePauseBehavior,
    resumeBehavior: handleResumeBehavior,
    cancelBehavior: handleCancelBehavior,
    restartBehavior: handleRestartBehavior,
  };
}
