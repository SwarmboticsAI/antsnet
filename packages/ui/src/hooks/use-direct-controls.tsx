import { useCallback, useState } from "react";
import {
  type ApiDirectControlStartRequest,
  startDirectControl,
} from "@/lib/direct-control/start-direct-control";
import {
  type ApiDirectControlStopRequest,
  stopDirectControl,
} from "@/lib/direct-control/stop-direct-control";

export function useBehaviorControls() {
  const [loading, setLoading] = useState(false);

  const handleStartDirectControl = useCallback(
    ({
      robotId,
      controllingDeviceId,
      controllingDeviceIp,
    }: ApiDirectControlStartRequest) => {
      setLoading(true);

      startDirectControl({
        robotId,
        controllingDeviceId,
        controllingDeviceIp,
      })
        .then((response) => {
          console.log(
            "Direct control start request sent successfully:",
            response
          );
          setLoading(false);
        })
        .catch((error) => {
          console.error("Error starting direct control:", error);
          setLoading(false);
        })
        .finally(() => {
          setLoading(false);
        });
    },
    []
  );

  const handleStopDirectControl = useCallback(
    ({
      robotId,
      controllingDeviceId,
      directControlToken,
    }: ApiDirectControlStopRequest) => {
      setLoading(true);

      stopDirectControl({
        robotId,
        controllingDeviceId,
        directControlToken,
      })
        .then((response) => {
          console.log(
            "Direct control stop request sent successfully:",
            response
          );
          setLoading(false);
        })
        .catch((error) => {
          console.error("Error stopping direct control:", error);
          setLoading(false);
        })
        .finally(() => {
          setLoading(false);
        });
    },
    []
  );

  return {
    loading,
    startDirectControl: handleStartDirectControl,
    stopDirectControl: handleStopDirectControl,
  };
}
